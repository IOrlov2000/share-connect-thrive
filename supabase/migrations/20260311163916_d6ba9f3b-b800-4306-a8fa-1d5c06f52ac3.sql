
CREATE TABLE public.exchange_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  sender_listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  receiver_listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.exchange_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exchange offers"
ON public.exchange_offers FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create exchange offers"
ON public.exchange_offers FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own exchange offers"
ON public.exchange_offers FOR UPDATE
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.exchange_offers;
