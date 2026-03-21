
CREATE POLICY "Users can update gift claimed_count" ON public.gifts FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);
