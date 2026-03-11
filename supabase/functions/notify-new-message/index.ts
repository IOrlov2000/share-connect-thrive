import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok');
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

    // Get Telegram chat_id for recipient
    const { data: tgChat } = await supabase
      .from('telegram_chats')
      .select('chat_id')
      .eq('user_id', recipientId)
      .maybeSingle();

    if (!tgChat?.chat_id) return new Response('ok');

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

    const message = `💬 <b>Новое сообщение</b>\n\nОт: ${senderName}\n\n${preview}`;

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: tgChat.chat_id,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    console.log(`Notification sent to chat ${tgChat.chat_id}`);
    return new Response('ok');
  } catch (error) {
    console.error('Notification error:', error);
    return new Response('ok');
  }
});
