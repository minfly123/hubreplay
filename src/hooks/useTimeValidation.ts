import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const MAX_DRIFT_MS = 5 * 60 * 1000; // 5 minutes tolerance

export const useTimeValidation = () => {
  const [timeValid, setTimeValid] = useState(true);
  const [checking, setChecking] = useState(true);
  const [serverTime, setServerTime] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const before = Date.now();
        const resp = await supabase.functions.invoke("server-time");
        const after = Date.now();
        if (!mounted) return;

        if (resp.error || !resp.data?.serverTime) {
          // If can't reach server, allow access (don't block on network errors)
          setTimeValid(true);
          setChecking(false);
          return;
        }

        const sTime = resp.data.serverTime as number;
        const latency = (after - before) / 2;
        const clientTime = before + latency;
        const drift = Math.abs(clientTime - sTime);

        setServerTime(sTime);
        setTimeValid(drift <= MAX_DRIFT_MS);
      } catch {
        setTimeValid(true);
      }
      if (mounted) setChecking(false);
    };

    check();
    const iv = setInterval(check, 60000); // recheck every minute
    return () => { mounted = false; clearInterval(iv); };
  }, []);

  return { timeValid, checking, serverTime };
};
