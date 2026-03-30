
CREATE OR REPLACE FUNCTION public.claim_gift(_gift_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _claimed boolean := false;
BEGIN
  -- Atomic increment only if slots available
  UPDATE public.gifts
  SET claimed_count = claimed_count + 1
  WHERE id = _gift_id
    AND claimed_count < max_winners
  RETURNING true INTO _claimed;

  RETURN COALESCE(_claimed, false);
END;
$$;
