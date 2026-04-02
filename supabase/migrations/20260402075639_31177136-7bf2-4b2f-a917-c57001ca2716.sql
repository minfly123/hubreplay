
-- User coins balance table
CREATE TABLE public.user_coins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  balance integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_coins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own coins" ON public.user_coins FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own coins" ON public.user_coins FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own coins" ON public.user_coins FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all coins" ON public.user_coins FOR SELECT TO authenticated USING (is_at_least_admin(auth.uid()));

-- Coin transactions log
CREATE TABLE public.coin_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  type text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions" ON public.coin_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.coin_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Lottery results table
CREATE TABLE public.lottery_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  prize_key text NOT NULL,
  prize_name text NOT NULL,
  claimed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lottery_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own lottery results" ON public.lottery_results FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own lottery results" ON public.lottery_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lottery results" ON public.lottery_results FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all lottery results" ON public.lottery_results FOR SELECT TO authenticated USING (is_at_least_admin(auth.uid()));

-- Function to safely spend coins (atomic)
CREATE OR REPLACE FUNCTION public.spend_coins(_user_id uuid, _amount integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.user_coins
  SET balance = balance - _amount, updated_at = now()
  WHERE user_id = _user_id AND balance >= _amount;
  RETURN FOUND;
END;
$$;

-- Function to add coins (atomic)
CREATE OR REPLACE FUNCTION public.add_coins(_user_id uuid, _amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_coins (user_id, balance)
  VALUES (_user_id, _amount)
  ON CONFLICT (user_id)
  DO UPDATE SET balance = user_coins.balance + _amount, updated_at = now();
END;
$$;

-- Enable realtime for coins
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_coins;
