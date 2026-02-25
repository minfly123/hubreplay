import { useState, useEffect } from "react";
import { Crown, Infinity } from "lucide-react";
import type { ActiveMembership } from "@/hooks/useMembership";

interface Props {
  membership: ActiveMembership;
}

const MembershipCountdown = ({ membership }: Props) => {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    if (membership.isPermanent) return;
    const update = () => {
      const now = Date.now();
      const exp = membership.expires_at ? new Date(membership.expires_at).getTime() : 0;
      const diff = Math.max(0, exp - now);
      if (diff <= 0) { setRemaining("Habis"); return; }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setRemaining(d > 0 ? `${d}h ${h}j ${m}m ${s}d` : `${h}j ${m}m ${s}d`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [membership]);

  return (
    <div className="glass-card p-3 flex items-center gap-3 border-primary/30">
      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shrink-0">
        <Crown className="w-4 h-4 text-primary-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">Membership Aktif</p>
        {membership.isPermanent ? (
          <p className="text-xs text-primary flex items-center gap-1">
            <Infinity className="w-3 h-3" /> Permanen — Semua show terbuka
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Berakhir dalam: <span className="text-primary font-mono">{remaining}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default MembershipCountdown;
