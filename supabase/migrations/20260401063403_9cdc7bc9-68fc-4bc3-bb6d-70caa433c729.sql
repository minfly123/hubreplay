
-- Minimal storage: only stores unique user+replay combo, no extra columns
CREATE TABLE public.replay_views (
  replay_id uuid NOT NULL REFERENCES public.replays(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  viewed_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (replay_id, user_id)
);

ALTER TABLE public.replay_views ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read view counts
CREATE POLICY "Anyone authenticated can read views"
ON public.replay_views FOR SELECT TO authenticated
USING (true);

-- Users can insert own views
CREATE POLICY "Users can insert own views"
ON public.replay_views FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.replay_views;
