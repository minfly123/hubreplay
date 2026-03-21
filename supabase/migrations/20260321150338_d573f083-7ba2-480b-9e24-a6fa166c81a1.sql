
DROP POLICY "Users can update gift claimed_count" ON public.gifts;

CREATE POLICY "Authenticated can update gift claimed_count" ON public.gifts FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (claimed_count <= max_winners);
