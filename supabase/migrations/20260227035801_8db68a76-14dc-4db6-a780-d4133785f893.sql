
-- Table for single-use replay unlock tokens
CREATE TABLE public.replay_unlock_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  replay_id uuid NOT NULL REFERENCES public.replays(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(20), 'hex'),
  used_by uuid,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  is_used boolean NOT NULL DEFAULT false
);

ALTER TABLE public.replay_unlock_tokens ENABLE ROW LEVEL SECURITY;

-- Also track which user has unlocked which replay (persistent)
CREATE TABLE public.replay_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  replay_id uuid NOT NULL REFERENCES public.replays(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  token_id uuid REFERENCES public.replay_unlock_tokens(id) ON DELETE SET NULL,
  UNIQUE(replay_id, user_id)
);

ALTER TABLE public.replay_unlocks ENABLE ROW LEVEL SECURITY;

-- RLS for replay_unlock_tokens
CREATE POLICY "Admins can manage unlock tokens"
ON public.replay_unlock_tokens FOR ALL
USING (is_at_least_admin(auth.uid()))
WITH CHECK (is_at_least_admin(auth.uid()));

CREATE POLICY "Authenticated can read tokens"
ON public.replay_unlock_tokens FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can activate tokens"
ON public.replay_unlock_tokens FOR UPDATE
USING (auth.uid() IS NOT NULL AND is_used = false)
WITH CHECK (used_by = auth.uid() AND is_used = true);

-- RLS for replay_unlocks
CREATE POLICY "Users can read own unlocks"
ON public.replay_unlocks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own unlocks"
ON public.replay_unlocks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all unlocks"
ON public.replay_unlocks FOR SELECT
USING (is_at_least_admin(auth.uid()));

-- Enable realtime for unlock tokens
ALTER PUBLICATION supabase_realtime ADD TABLE public.replay_unlock_tokens;
ALTER PUBLICATION supabase_realtime ADD TABLE public.replay_unlocks;
