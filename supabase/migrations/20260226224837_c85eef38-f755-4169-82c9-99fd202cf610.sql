
-- Only super_admin can manage replays (not admin)
DROP POLICY IF EXISTS "Admins can manage replays" ON public.replays;
CREATE POLICY "Super admins can manage replays"
ON public.replays
FOR ALL
TO authenticated
USING (is_super_admin(auth.uid()))
WITH CHECK (is_super_admin(auth.uid()));
