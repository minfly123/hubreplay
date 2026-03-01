
-- Playlists table (created by admin/super_admin)
CREATE TABLE public.playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid NOT NULL,
  token text NOT NULL DEFAULT encode(extensions.gen_random_bytes(16), 'hex'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(token)
);

ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read playlists"
ON public.playlists FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage playlists"
ON public.playlists FOR ALL
TO authenticated
USING (is_at_least_admin(auth.uid()))
WITH CHECK (is_at_least_admin(auth.uid()));

CREATE TRIGGER update_playlists_updated_at
BEFORE UPDATE ON public.playlists
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Playlist items (which replays are in which playlist)
CREATE TABLE public.playlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  replay_id uuid NOT NULL REFERENCES public.replays(id) ON DELETE CASCADE,
  added_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(playlist_id, replay_id)
);

ALTER TABLE public.playlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read playlist items"
ON public.playlist_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage playlist items"
ON public.playlist_items FOR ALL
TO authenticated
USING (is_at_least_admin(auth.uid()))
WITH CHECK (is_at_least_admin(auth.uid()));

-- User playlists (members who have added a playlist to their account)
CREATE TABLE public.user_playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  playlist_id uuid NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  custom_name text,
  added_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, playlist_id)
);

ALTER TABLE public.user_playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own playlists"
ON public.user_playlists FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own playlists"
ON public.user_playlists FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playlists"
ON public.user_playlists FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own playlists"
ON public.user_playlists FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all user playlists"
ON public.user_playlists FOR SELECT
TO authenticated
USING (is_at_least_admin(auth.uid()));

-- Enable realtime for user_playlists
ALTER PUBLICATION supabase_realtime ADD TABLE public.playlists;
ALTER PUBLICATION supabase_realtime ADD TABLE public.playlist_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_playlists;
