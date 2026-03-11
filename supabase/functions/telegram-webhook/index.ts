import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const update = await req.json();
    console.log('Telegram update:', JSON.stringify(update));

    const message = update.message;
    if (!message || !message.text) {
      return new Response('ok');
    }

    const chatId = message.chat.id;
    const text = message.text.trim();

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Handle /start with link token
    if (text.startsWith('/start ')) {
      const linkToken = text.replace('/start ', '').trim();
      
      if (linkToken.length > 0) {
        // Find the OTP record with this pending link token
        const { data: otpRecord, error } = await supabase
          .from('phone_otp')
          .select('*')
          .eq('telegram_chat_id', `pending:${linkToken}`)
          .eq('verified', false)
          .gte('expires_at', new Date().toISOString())
          .maybeSingle();

        if (otpRecord) {
          // Update with real chat_id, keep link token for check function
          await supabase.from('phone_otp').update({ 
            telegram_chat_id: `sent:${linkToken}:${chatId}` 
          }).eq('id', otpRecord.id);

          // Save chat_id for future notifications (upsert by phone)
          await supabase.from('telegram_chats').upsert(
            { phone: otpRecord.phone, chat_id: String(chatId), user_id: '00000000-0000-0000-0000-000000000000' },
            { onConflict: 'phone' }
          );

          // Send the OTP code
          const otpMessage = `🔐 Ваш код подтверждения для «Всё на Всё»:\n\n<b>${otpRecord.code}</b>\n\nВведите его на сайте. Код действителен 5 минут.`;
          
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: otpMessage,
              parse_mode: 'HTML',
            }),
          });
        } else {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: '❌ Ссылка устарела или недействительна. Запросите код заново на сайте.',
            }),
          });
        }
      } else {
        // Plain /start without token
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: '👋 Привет! Я бот «Всё на Всё».\n\nДля входа на сайт запросите код на странице авторизации и нажмите на ссылку Telegram.',
          }),
        });
      }
    } else if (text === '/start') {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: '👋 Привет! Я бот «Всё на Всё».\n\nДля входа на сайт запросите код на странице авторизации и нажмите на ссылку Telegram.',
        }),
      });
    }

    return new Response('ok');
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('ok');
  }
});
