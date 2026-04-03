CREATE POLICY "Anyone authenticated can read roles for badges"
ON public.user_roles
FOR SELECT
TO authenticated
USING (true);