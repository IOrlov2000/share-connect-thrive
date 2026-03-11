import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function checkRateLimit(supabase: any, key: string, maxAttempts = 3, windowMinutes = 5, blockMinutes = 15): Promise<{ allowed: boolean; retryAfter?: number }> {
  const now = new Date();
  const { data: blocked } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('key', key)
    .not('blocked_until', 'is', null)
    .gte('blocked_until', now.toISOString())
    .maybeSingle();

  if (blocked) {
    const retryAfter = Math.ceil((new Date(blocked.blocked_until).getTime() - now.getTime()) / 1000);
    return { allowed: false, retryAfter };
  }

  const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000).toISOString();
  const { data: record } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('key', key)
    .gte('first_attempt_at', windowStart)
    .maybeSingle();

  if (!record) {
    await supabase.from('rate_limits').delete().eq('key', key);
    await supabase.from('rate_limits').insert({ key, attempts: 1, first_attempt_at: now.toISOString() });
    return { allowed: true };
  }

  if (record.attempts >= maxAttempts) {
    const blockedUntil = new Date(now.getTime() + blockMinutes * 60 * 1000).toISOString();
    await supabase.from('rate_limits').update({ blocked_until: blockedUntil }).eq('id', record.id);
    return { allowed: false, retryAfter: blockMinutes * 60 };
  }

  await supabase.from('rate_limits').update({ attempts: record.attempts + 1 }).eq('id', record.id);
  return { allowed: true };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();

    if (!phone || !/^\+7\d{10}$/.test(phone)) {
      return new Response(JSON.stringify({ error: 'Неверный формат номера. Используйте +7XXXXXXXXXX' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Rate limit
    const phoneLimit = await checkRateLimit(supabase, `tg:${phone}`, 3, 5, 15);
    if (!phoneLimit.allowed) {
      return new Response(JSON.stringify({ 
        error: `Слишком много попыток. Повторите через ${Math.ceil((phoneLimit.retryAfter || 900) / 60)} мин.` 
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const ipLimit = await checkRateLimit(supabase, `ip:${clientIP}`, 10, 10, 30);
    if (!ipLimit.allowed) {
      return new Response(JSON.stringify({ 
        error: `Слишком много запросов. Повторите через ${Math.ceil((ipLimit.retryAfter || 1800) / 60)} мин.` 
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Delete old OTPs
    await supabase.from('phone_otp').delete().eq('phone', phone);

    // Insert new OTP with telegram channel
    const { error: insertError } = await supabase.from('phone_otp').insert({
      phone,
      code,
      expires_at: expiresAt,
      channel: 'telegram',
    });

    if (insertError) throw new Error(`DB error: ${insertError.message}`);

    // Send code via Telegram Bot
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')!;
    
    // Find chat_id by phone — we need the user to have started the bot first
    // We'll look up the chat_id from previous interactions stored in phone_otp
    // For first-time users, we search by phone in profiles or use the bot's getUpdates
    
    // Strategy: Use the phone number to find a telegram_chat_id stored from previous bot interactions
    const { data: existingChat } = await supabase
      .from('phone_otp')
      .select('telegram_chat_id')
      .eq('phone', phone)
      .not('telegram_chat_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // We already deleted old OTPs above, so check a separate mapping
    // Better approach: store telegram mappings in a dedicated lookup
    // For now, we'll use getUpdates to find users who sent /start with their phone
    
    // Actually, we need a different flow for Telegram:
    // 1. User enters phone on the website
    // 2. We generate an OTP and a unique link to the bot: t.me/botname?start=CODE
    // 3. User opens the bot link, bot receives /start CODE
    // 4. Bot webhook saves the chat_id paired with the code
    // 5. Then we send the actual OTP code to that chat
    
    // Simpler approach: User must first link their phone via the bot
    // Even simpler: We generate a deep link token, user clicks it, bot gets chat_id
    
    // Let's use the simplest approach:
    // Generate a link token, user opens t.me/bot?start=LINK_TOKEN
    // The webhook pairs link_token with chat_id
    // Then we send the OTP to that chat_id

    const linkToken = crypto.randomUUID().replace(/-/g, '').slice(0, 16);

    // Store the link token with the OTP
    await supabase.from('phone_otp').update({ 
      telegram_chat_id: `pending:${linkToken}` 
    }).eq('phone', phone).eq('code', code);

    // Get bot username
    const botInfoRes = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const botInfo = await botInfoRes.json();
    const botUsername = botInfo.result?.username || 'your_bot';

    return new Response(JSON.stringify({ 
      success: true,
      telegram_link: `https://t.me/${botUsername}?start=${linkToken}`,
      bot_username: botUsername,
      link_token: linkToken,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Ошибка Telegram' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
