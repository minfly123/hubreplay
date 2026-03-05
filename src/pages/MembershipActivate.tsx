import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const DURATION_LABELS: Record<string, string> = {
  "1_week": "1 Minggu",
  "1_month": "1 Bulan",
  permanent: "Permanen",
};

const MembershipActivate = () => {
  const { token } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "used" | "activating" | "done" | "has_active">("loading");
  const [membership, setMembership] = useState<any>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }
    checkToken();
  }, [user, authLoading, token]);

  const checkToken = async () => {
    if (!token || !user) { setStatus("invalid"); return; }

    // Check if user already has an active membership
    const { data: existing } = await supabase
      .from("memberships")
      .select("*")
      .eq("activated_by", user.id)
      .eq("is_used", true)
      .maybeSingle();

    if (existing) {
      const isPermanent = existing.duration === "permanent";
      const isExpired = !isPermanent && existing.expires_at && new Date(existing.expires_at).getTime() <= Date.now();
      if (!isExpired) {
        setStatus("has_active");
        return;
      }
    }

    const { data, error } = await supabase
      .from("memberships")
      .select("*")
      .eq("token", token)
      .maybeSingle();
    
    if (error || !data) { setStatus("invalid"); return; }
    if (data.is_used) { setStatus("used"); return; }
    setMembership(data);
    setStatus("valid");
  };

  const handleActivate = async () => {
    if (!user || !membership) return;
    setStatus("activating");

    const now = new Date();
    let expiresAt: string | null = null;
    if (membership.duration === "1_week") {
      expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (membership.duration === "1_month") {
      expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (membership.duration === "1_month") {
      expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    const { error } = await supabase
      .from("memberships")
      .update({
        is_used: true,
        activated_by: user.id,
        activated_at: now.toISOString(),
        expires_at: expiresAt,
      })
      .eq("id", membership.id)
      .eq("is_used", false);

    if (error) {
      toast.error("Gagal mengaktivasi membership.");
      setStatus("valid");
    } else {
      toast.success("Membership berhasil diaktivasi!");
      setStatus("done");
    }
  };

  if (authLoading || status === "loading") {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md w-full text-center space-y-4">
        <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center mx-auto glow-primary">
          <Play className="w-6 h-6 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-display font-bold text-foreground">Hub Replay Membership</h1>

        {status === "invalid" && (
          <div className="space-y-3">
            <XCircle className="w-12 h-12 text-destructive mx-auto" />
            <p className="text-destructive font-medium">Link membership tidak valid.</p>
            <Button variant="outline" onClick={() => navigate("/")}>Kembali</Button>
          </div>
        )}

        {status === "used" && (
          <div className="space-y-3">
            <XCircle className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground font-medium">Membership ini sudah digunakan.</p>
            <Button variant="outline" onClick={() => navigate("/")}>Kembali</Button>
          </div>
        )}

        {status === "has_active" && (
          <div className="space-y-3">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto" />
            <p className="text-foreground font-medium">Kamu masih memiliki membership aktif!</p>
            <p className="text-sm text-muted-foreground">Kamu tidak bisa mengaktivasi membership baru selama membership lama masih aktif.</p>
            <Button variant="outline" onClick={() => navigate("/")}>Kembali ke Beranda</Button>
          </div>
        )}

        {status === "valid" && membership && (
          <div className="space-y-4">
            <div className="bg-secondary/50 rounded-lg p-4 text-left space-y-2">
              <p className="text-sm text-muted-foreground">Durasi: <span className="text-foreground font-medium">{DURATION_LABELS[membership.duration]}</span></p>
              <p className="text-xs text-muted-foreground">Akun: {user?.email}</p>
            </div>
            <p className="text-sm text-muted-foreground">Klik tombol di bawah untuk mengaktivasi membership ini. Hanya bisa diaktivasi 1 kali.</p>
            <Button
              onClick={handleActivate}
              className="w-full gradient-primary text-primary-foreground glow-primary"
            >
              Aktivasi Membership
            </Button>
          </div>
        )}

        {status === "activating" && (
          <div className="space-y-3">
            <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
            <p className="text-muted-foreground">Mengaktivasi...</p>
          </div>
        )}

        {status === "done" && (
          <div className="space-y-3">
            <CheckCircle className="w-12 h-12 text-primary mx-auto" />
            <p className="text-primary font-medium">Membership berhasil diaktivasi! 🎉</p>
            <p className="text-sm text-muted-foreground">Semua show kini terbuka untukmu.</p>
            <Button onClick={() => navigate("/")} className="gradient-primary text-primary-foreground glow-primary">
              Mulai Menonton
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembershipActivate;
