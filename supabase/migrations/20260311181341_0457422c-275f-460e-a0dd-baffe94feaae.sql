
CREATE TABLE public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  attempts integer NOT NULL DEFAULT 1,
  first_attempt_at timestamptz NOT NULL DEFAULT now(),
  blocked_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_rate_limits_key ON public.rate_limits(key);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON public.rate_limits
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

ALTER TABLE public.phone_otp ADD COLUMN IF NOT EXISTS channel text DEFAULT 'sms';
ALTER TABLE public.phone_otp ADD COLUMN IF NOT EXISTS telegram_chat_id text;
