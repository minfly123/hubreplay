
CREATE TABLE public.gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  replay_id uuid NOT NULL REFERENCES public.replays(id) ON DELETE CASCADE,
  token text NOT NULL DEFAULT encode(extensions.gen_random_bytes(16), 'hex'),
  max_winners integer NOT NULL DEFAULT 1,
  claimed_count integer NOT NULL DEFAULT 0,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(token)
);

CREATE TABLE public.gift_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id uuid NOT NULL REFERENCES public.gifts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  claimed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(gift_id, user_id)
);

ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage gifts" ON public.gifts FOR ALL TO authenticated
  USING (is_at_least_admin(auth.uid()))
  WITH CHECK (is_at_least_admin(auth.uid()));

CREATE POLICY "Authenticated can read gifts" ON public.gifts FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage gift claims" ON public.gift_claims FOR ALL TO authenticated
  USING (is_at_least_admin(auth.uid()))
  WITH CHECK (is_at_least_admin(auth.uid()));

CREATE POLICY "Users can read own claims" ON public.gift_claims FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own claims" ON public.gift_claims FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
