import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function checkRateLimit(supabase: any, key: string, maxAttempts = 3, windowMinutes = 5, blockMinutes = 15): Promise<{ allowed: boolean; retryAfter?: number }> {
  const now = new Date();

  // Check if blocked
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

  // Get recent attempts within window
  const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000).toISOString();
  const { data: record } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('key', key)
    .gte('first_attempt_at', windowStart)
    .maybeSingle();

  if (!record) {
    // First attempt - create record
    await supabase.from('rate_limits').delete().eq('key', key);
    await supabase.from('rate_limits').insert({ key, attempts: 1, first_attempt_at: now.toISOString() });
    return { allowed: true };
  }

  if (record.attempts >= maxAttempts) {
    // Block the key
    const blockedUntil = new Date(now.getTime() + blockMinutes * 60 * 1000).toISOString();
    await supabase.from('rate_limits').update({ blocked_until: blockedUntil }).eq('id', record.id);
    return { allowed: false, retryAfter: blockMinutes * 60 };
  }

  // Increment attempts
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

    // Rate limit by phone number (3 attempts per 5 minutes, block for 15 min)
    const phoneLimit = await checkRateLimit(supabase, `sms:${phone}`, 3, 5, 15);
    if (!phoneLimit.allowed) {
      return new Response(JSON.stringify({ 
        error: `Слишком много попыток. Повторите через ${Math.ceil((phoneLimit.retryAfter || 900) / 60)} мин.` 
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Rate limit by IP (10 attempts per 10 minutes)
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

    // Delete old OTPs for this phone
    await supabase.from('phone_otp').delete().eq('phone', phone);

    // Insert new OTP
    const { error: insertError } = await supabase.from('phone_otp').insert({
      phone,
      code,
      expires_at: expiresAt,
      channel: 'sms',
    });

    if (insertError) {
      throw new Error(`DB error: ${insertError.message}`);
    }

    // Send voice call via SMSC.ru (bypasses SMS text restrictions)
    const smscLogin = Deno.env.get('SMSC_LOGIN')!;
    const smscPassword = Deno.env.get('SMSC_PASSWORD')!;

    const phoneDigits = phone.replace('+', '');
    // Voice message reads digits one by one
    const spokenCode = code.split('').join('. ');
    const message = `Ваш код подтверждения: ${spokenCode}. Повторяю: ${spokenCode}.`;

    const params = new URLSearchParams({
      login: smscLogin,
      psw: smscPassword,
      phones: phoneDigits,
      mes: message,
      fmt: '3',
      charset: 'utf-8',
      call: '1',
      voice: 'w',
    });

    const smsResponse = await fetch(`https://smsc.ru/sys/send.php?${params.toString()}`);
    const smsData = await smsResponse.json();
    console.log('SMSC response:', JSON.stringify(smsData));

    if (smsData.error) {
      throw new Error(`SMSC error: ${smsData.error} (code: ${smsData.error_code})`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Ошибка отправки SMS' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
