CREATE POLICY "Users can update own conversations"
ON public.conversations
FOR UPDATE
TO authenticated
USING ((auth.uid() = participant_1) OR (auth.uid() = participant_2))
WITH CHECK ((auth.uid() = participant_1) OR (auth.uid() = participant_2));