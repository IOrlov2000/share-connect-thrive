import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TELEGRAM_PLACEHOLDER_USER_ID = '00000000-0000-0000-0000-000000000000';

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('8')) return `7${digits.slice(1)}`;
  return digits;
}

async function sendTelegramMessage(botToken: string, payload: Record<string, unknown>) {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const update = await req.json();
    console.log('Telegram update:', JSON.stringify(update));

    const message = update.message;
    if (!message) {
      return new Response('ok');
    }

    const chatId = String(message.chat.id);
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    if (message.contact) {
      const contact = message.contact;
      const { data: otpRecord } = await supabase
        .from('phone_otp')
        .select('*')
        .eq('verified', false)
        .gte('expires_at', new Date().toISOString())
        .like('telegram_chat_id', `confirm:%:${chatId}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!otpRecord) {
        await sendTelegramMessage(botToken, {
          chat_id: chatId,
          text: '❌ Активный запрос не найден. Вернитесь на сайт и запросите код заново.',
          reply_markup: { remove_keyboard: true },
        });
        return new Response('ok');
      }

      const linkToken = otpRecord.telegram_chat_id?.split(':')[1];
      const sharedOwnPhone = contact.user_id === message.from?.id;
      const sharedPhone = normalizePhone(contact.phone_number || '');
      const expectedPhone = normalizePhone(otpRecord.phone || '');

      if (!sharedOwnPhone || sharedPhone !== expectedPhone) {
        await supabase
          .from('phone_otp')
          .update({ telegram_chat_id: `rejected:${linkToken}:${chatId}` })
          .eq('id', otpRecord.id);

        await sendTelegramMessage(botToken, {
          chat_id: chatId,
          text: '❌ Код не отправлен. В Telegram нужно подтвердить именно свой номер, и он должен совпадать с номером, введённым на сайте.',
          reply_markup: { remove_keyboard: true },
        });
        return new Response('ok');
      }

      await supabase
        .from('phone_otp')
        .update({ telegram_chat_id: `sent:${linkToken}:${chatId}` })
        .eq('id', otpRecord.id);

      await supabase
        .from('telegram_chats')
        .upsert(
          { phone: otpRecord.phone, chat_id: chatId, user_id: TELEGRAM_PLACEHOLDER_USER_ID },
          { onConflict: 'phone' }
        );

      const otpMessage = `🔐 Ваш код подтверждения для «Всё на Всё»:\n\n<b>${otpRecord.code}</b>\n\nВведите его на сайте. Код действителен 5 минут.`;
      await sendTelegramMessage(botToken, {
        chat_id: chatId,
        text: otpMessage,
        parse_mode: 'HTML',
        reply_markup: { remove_keyboard: true },
      });

      return new Response('ok');
    }

    const text = message.text?.trim();
    if (!text) {
      return new Response('ok');
    }

    if (text.startsWith('/start ')) {
      const linkToken = text.replace('/start ', '').trim();

      const { data: otpRecord } = await supabase
        .from('phone_otp')
        .select('*')
        .eq('verified', false)
        .gte('expires_at', new Date().toISOString())
        .or(`telegram_chat_id.eq.pending:${linkToken},telegram_chat_id.like.confirm:${linkToken}:%,telegram_chat_id.like.rejected:${linkToken}:%,telegram_chat_id.like.sent:${linkToken}:%`)
        .maybeSingle();

      if (!otpRecord) {
        await sendTelegramMessage(botToken, {
          chat_id: chatId,
          text: '❌ Ссылка устарела или недействительна. Запросите код заново на сайте.',
        });
        return new Response('ok');
      }

      if (otpRecord.telegram_chat_id?.startsWith(`sent:${linkToken}:`)) {
        await sendTelegramMessage(botToken, {
          chat_id: chatId,
          text: '✅ Код уже отправлен вам в этот чат. Проверьте последние сообщения от бота.',
        });
        return new Response('ok');
      }

      await supabase
        .from('phone_otp')
        .update({ telegram_chat_id: `confirm:${linkToken}:${chatId}` })
        .eq('id', otpRecord.id);

      await sendTelegramMessage(botToken, {
        chat_id: chatId,
        text: 'Чтобы получить код, подтвердите номер через кнопку ниже. Код придёт только если номер Telegram совпадает с номером, введённым на сайте.',
        reply_markup: {
          keyboard: [[{ text: 'Подтвердить мой номер', request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });

      return new Response('ok');
    }

    if (text === '/start') {
      await sendTelegramMessage(botToken, {
        chat_id: chatId,
        text: '👋 Привет! Для входа на сайт запросите код на странице авторизации, затем откройте ссылку из сайта и подтвердите свой номер в Telegram.',
      });
    }

    return new Response('ok');
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('ok');
  }
});
