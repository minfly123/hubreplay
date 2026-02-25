
-- Create memberships table
CREATE TABLE public.memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  duration text NOT NULL CHECK (duration IN ('1_week', '1_month', 'permanent')),
  created_at timestamptz NOT NULL DEFAULT now(),
  activated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  activated_at timestamptz,
  expires_at timestamptz,
  is_used boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL,
  UNIQUE(token)
);

ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage memberships"
ON public.memberships FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can read own membership"
ON public.memberships FOR SELECT
USING (activated_by = auth.uid());

CREATE POLICY "Authenticated users can read by token"
ON public.memberships FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can activate membership"
ON public.memberships FOR UPDATE
USING (auth.uid() IS NOT NULL AND is_used = false)
WITH CHECK (activated_by = auth.uid() AND is_used = true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.memberships;
