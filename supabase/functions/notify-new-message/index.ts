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
    const { record } = await req.json();
    
    if (!record || !record.conversation_id || !record.sender_id || !record.content) {
      return new Response('ok');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get conversation to find recipient
    const { data: convo } = await supabase
      .from('conversations')
      .select('participant_1, participant_2')
      .eq('id', record.conversation_id)
      .single();

    if (!convo) return new Response('ok');

    const recipientId = convo.participant_1 === record.sender_id 
      ? convo.participant_2 
      : convo.participant_1;

    // Get recipient's phone to find their Telegram chat_id
    const { data: recipientProfile } = await supabase
      .from('profiles')
      .select('phone, display_name')
      .eq('user_id', recipientId)
      .maybeSingle();

    if (!recipientProfile?.phone) return new Response('ok');

    // Find the most recent Telegram OTP record for this phone to get chat_id
    const { data: otpRecord } = await supabase
      .from('phone_otp')
      .select('telegram_chat_id')
      .eq('phone', recipientProfile.phone)
      .not('telegram_chat_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!otpRecord?.telegram_chat_id) return new Response('ok');

    // Extract chat_id from format "sent:TOKEN:CHATID" or plain number
    let chatId = otpRecord.telegram_chat_id;
    if (chatId.startsWith('sent:')) {
      const parts = chatId.split(':');
      chatId = parts[parts.length - 1];
    }
    if (chatId.startsWith('pending:')) return new Response('ok');

    // Get sender name
    const { data: senderProfile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', record.sender_id)
      .maybeSingle();

    const senderName = senderProfile?.display_name || 'Пользователь';
    const preview = record.content.length > 100 
      ? record.content.substring(0, 100) + '...' 
      : record.content;

    const siteUrl = 'https://share-connect-thrive.lovable.app';
    const message = `💬 <b>Новое сообщение</b>\n\nОт: ${senderName}\n\n${preview}`;

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    console.log(`Notification sent to chat ${chatId} for message from ${senderName}`);
    return new Response('ok');
  } catch (error) {
    console.error('Notification error:', error);
    return new Response('ok');
  }
});
