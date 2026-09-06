CREATE TABLE public.event_gallery (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  type text NOT NULL,
  event_date date NOT NULL,
  location text NOT NULL,
  image_url text NOT NULL,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.event_gallery TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_gallery TO authenticated;
GRANT ALL ON public.event_gallery TO service_role;

ALTER TABLE public.event_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view event gallery"
ON public.event_gallery FOR SELECT
USING (true);

CREATE POLICY "Admins can insert event gallery"
ON public.event_gallery FOR INSERT TO authenticated
WITH CHECK (public.is_at_least_admin(auth.uid()));

CREATE POLICY "Admins can update event gallery"
ON public.event_gallery FOR UPDATE TO authenticated
USING (public.is_at_least_admin(auth.uid()))
WITH CHECK (public.is_at_least_admin(auth.uid()));

CREATE POLICY "Admins can delete event gallery"
ON public.event_gallery FOR DELETE TO authenticated
USING (public.is_at_least_admin(auth.uid()));

CREATE TRIGGER update_event_gallery_updated_at
BEFORE UPDATE ON public.event_gallery
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.event_gallery;