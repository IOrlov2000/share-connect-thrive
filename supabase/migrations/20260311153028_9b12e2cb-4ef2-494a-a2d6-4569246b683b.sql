CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  notified_to text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow edge function (service role) to insert
CREATE POLICY "Service role can insert subscriptions"
ON public.subscriptions FOR INSERT
WITH CHECK (true);
