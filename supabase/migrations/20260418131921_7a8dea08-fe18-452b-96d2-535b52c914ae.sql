
CREATE TABLE IF NOT EXISTS public.replay_lineups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  replay_id UUID NOT NULL REFERENCES public.replays(id) ON DELETE CASCADE,
  show_external_id TEXT,
  show_title TEXT NOT NULL,
  show_team TEXT,
  show_date TIMESTAMPTZ,
  banner TEXT,
  poster TEXT,
  members JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(replay_id)
);

ALTER TABLE public.replay_lineups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read lineups"
  ON public.replay_lineups FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert lineups"
  ON public.replay_lineups FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update lineups"
  ON public.replay_lineups FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage lineups"
  ON public.replay_lineups FOR ALL TO authenticated
  USING (is_at_least_admin(auth.uid())) WITH CHECK (is_at_least_admin(auth.uid()));
