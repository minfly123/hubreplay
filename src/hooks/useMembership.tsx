import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ActiveMembership {
  id: string;
  duration: string;
  activated_at: string;
  expires_at: string | null;
  isPermanent: boolean;
  isExpired: boolean;
  remainingMs: number;
}

export const useMembership = () => {
  const { user } = useAuth();
  const [membership, setMembership] = useState<ActiveMembership | null>(null);
  const [loading, setLoading] = useState(true);

  const checkMembership = async () => {
    if (!user) { setMembership(null); setLoading(false); return; }

    const { data } = await supabase
      .from("memberships")
      .select("*")
      .eq("activated_by", user.id)
      .eq("is_used", true)
      .order("activated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) { setMembership(null); setLoading(false); return; }

    const isPermanent = data.duration === "permanent";
    const now = Date.now();
    const expiresAt = data.expires_at ? new Date(data.expires_at).getTime() : 0;
    const isExpired = !isPermanent && expiresAt <= now;
    const remainingMs = isPermanent ? Infinity : Math.max(0, expiresAt - now);

    setMembership({
      id: data.id,
      duration: data.duration,
      activated_at: data.activated_at!,
      expires_at: data.expires_at,
      isPermanent,
      isExpired,
      remainingMs,
    });
    setLoading(false);
  };

  useEffect(() => {
    checkMembership();

    // Listen for realtime changes
    const channel = supabase
      .channel("membership-status")
      .on("postgres_changes", { event: "*", schema: "public", table: "memberships" }, () => {
        checkMembership();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Countdown ticker - re-check every minute
  useEffect(() => {
    if (!membership || membership.isPermanent || membership.isExpired) return;
    const interval = setInterval(() => {
      checkMembership();
    }, 60000);
    return () => clearInterval(interval);
  }, [membership]);

  const isActive = membership ? (membership.isPermanent || !membership.isExpired) : false;

  return { membership, isActive, loading, refetch: checkMembership };
};
