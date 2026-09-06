CREATE POLICY "Anyone can read event gallery images"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-gallery');

CREATE POLICY "Admins can upload event gallery images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'event-gallery' AND public.is_at_least_admin(auth.uid()));

CREATE POLICY "Admins can update event gallery images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'event-gallery' AND public.is_at_least_admin(auth.uid()));

CREATE POLICY "Admins can delete event gallery images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'event-gallery' AND public.is_at_least_admin(auth.uid()));