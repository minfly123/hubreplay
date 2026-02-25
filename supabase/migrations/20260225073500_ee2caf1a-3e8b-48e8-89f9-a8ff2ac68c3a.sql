
-- Allow admins to read all profiles for /people page
CREATE POLICY "Admins can read all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
