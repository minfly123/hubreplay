
-- Fix memberships RLS: drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Admins can manage memberships" ON public.memberships;
DROP POLICY IF EXISTS "Authenticated users can activate membership" ON public.memberships;
DROP POLICY IF EXISTS "Authenticated users can read by token" ON public.memberships;
DROP POLICY IF EXISTS "Users can read own membership" ON public.memberships;

CREATE POLICY "Admins can manage memberships"
ON public.memberships FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can read by token"
ON public.memberships FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can activate membership"
ON public.memberships FOR UPDATE
USING (auth.uid() IS NOT NULL AND is_used = false)
WITH CHECK (activated_by = auth.uid() AND is_used = true);

-- Fix app_settings RLS
DROP POLICY IF EXISTS "Admins can manage settings" ON public.app_settings;
DROP POLICY IF EXISTS "Anyone authenticated can read settings" ON public.app_settings;

CREATE POLICY "Admins can manage settings"
ON public.app_settings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone authenticated can read settings"
ON public.app_settings FOR SELECT
USING (true);

-- Fix profiles RLS
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Admins can read all profiles"
ON public.profiles FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Fix replays RLS
DROP POLICY IF EXISTS "Admins can delete replays" ON public.replays;
DROP POLICY IF EXISTS "Admins can insert replays" ON public.replays;
DROP POLICY IF EXISTS "Admins can update replays" ON public.replays;
DROP POLICY IF EXISTS "Anyone authenticated can read replays" ON public.replays;

CREATE POLICY "Admins can delete replays"
ON public.replays FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert replays"
ON public.replays FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update replays"
ON public.replays FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone authenticated can read replays"
ON public.replays FOR SELECT
USING (true);

-- Fix user_roles RLS
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can read own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);
