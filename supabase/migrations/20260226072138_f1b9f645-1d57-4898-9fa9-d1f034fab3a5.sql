
-- Fix RESTRICTIVE policies to PERMISSIVE for proper access

-- app_settings
DROP POLICY IF EXISTS "Admins can manage settings" ON public.app_settings;
DROP POLICY IF EXISTS "Anyone authenticated can read settings" ON public.app_settings;

CREATE POLICY "Admins can manage settings" ON public.app_settings FOR ALL TO authenticated USING (public.is_at_least_admin(auth.uid())) WITH CHECK (public.is_at_least_admin(auth.uid()));
CREATE POLICY "Anyone authenticated can read settings" ON public.app_settings FOR SELECT TO authenticated USING (true);

-- memberships
DROP POLICY IF EXISTS "Admins can manage memberships" ON public.memberships;
DROP POLICY IF EXISTS "Authenticated users can read by token" ON public.memberships;
DROP POLICY IF EXISTS "Users can activate membership" ON public.memberships;

CREATE POLICY "Admins can manage memberships" ON public.memberships FOR ALL TO authenticated USING (public.is_at_least_admin(auth.uid())) WITH CHECK (public.is_at_least_admin(auth.uid()));
CREATE POLICY "Authenticated users can read by token" ON public.memberships FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can activate membership" ON public.memberships FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL AND is_used = false) WITH CHECK (activated_by = auth.uid() AND is_used = true);

-- profiles
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Admins can read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_at_least_admin(auth.uid()));
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- replays
DROP POLICY IF EXISTS "Admins can manage replays" ON public.replays;
DROP POLICY IF EXISTS "Anyone authenticated can read replays" ON public.replays;

CREATE POLICY "Admins can manage replays" ON public.replays FOR ALL TO authenticated USING (public.is_at_least_admin(auth.uid())) WITH CHECK (public.is_at_least_admin(auth.uid()));
CREATE POLICY "Anyone authenticated can read replays" ON public.replays FOR SELECT TO authenticated USING (true);

-- role_invitations
DROP POLICY IF EXISTS "Super admins can manage role invitations" ON public.role_invitations;
DROP POLICY IF EXISTS "Authenticated can read invitations" ON public.role_invitations;
DROP POLICY IF EXISTS "Users can activate invitation" ON public.role_invitations;

CREATE POLICY "Super admins can manage role invitations" ON public.role_invitations FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "Authenticated can read invitations" ON public.role_invitations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can activate invitation" ON public.role_invitations FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL AND is_used = false) WITH CHECK (activated_by = auth.uid() AND is_used = true);

-- user_roles
DROP POLICY IF EXISTS "Super admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can read all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;

CREATE POLICY "Super admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "Admins can read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.is_at_least_admin(auth.uid()));
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
