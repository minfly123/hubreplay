-- Remove unused access_key column from replays table
ALTER TABLE public.replays DROP COLUMN access_key;