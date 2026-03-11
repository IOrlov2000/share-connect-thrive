CREATE TABLE IF NOT EXISTS public.telegram_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  chat_id text NOT NULL,
  phone text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(phone)
);

ALTER TABLE public.telegram_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON public.telegram_chats
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Create a function to notify via edge function on new message
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _recipient_id uuid;
  _convo record;
BEGIN
  -- Get conversation
  SELECT participant_1, participant_2 INTO _convo
  FROM conversations WHERE id = NEW.conversation_id;
  
  IF _convo IS NULL THEN RETURN NEW; END IF;
  
  -- Determine recipient
  IF _convo.participant_1 = NEW.sender_id THEN
    _recipient_id := _convo.participant_2;
  ELSE
    _recipient_id := _convo.participant_1;
  END IF;

  -- Call edge function asynchronously via pg_net if available
  -- For now, we use the net.http_post approach
  PERFORM net.http_post(
    url := current_setting('app.settings.supabase_url', true) || '/functions/v1/notify-new-message',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object(
      'record', jsonb_build_object(
        'conversation_id', NEW.conversation_id,
        'sender_id', NEW.sender_id,
        'content', NEW.content
      )
    )
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Don't block message sending if notification fails
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_message_notify
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_message();