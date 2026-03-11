CREATE TABLE public.phone_otp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.phone_otp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON public.phone_otp
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);