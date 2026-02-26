import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle, XCircle, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  super_admin: "Super Admin",
};

const RoleActivate = () => {
  const { token } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "used" | "activating" | "done">("loading");
  const [invitation, setInvitation] = useState<any>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }
    checkToken();
  }, [user, authLoading, token]);

  const checkToken = async () => {
    if (!token) { setStatus("invalid"); return; }
    const { data, error } = await supabase
      .from("role_invitations")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (error || !data) { setStatus("invalid"); return; }
    if (data.is_used) { setStatus("used"); return; }
    setInvitation(data);
    setStatus("valid");
  };

  const handleActivate = async () => {
    if (!user || !invitation) return;
    setStatus("activating");

    // Update invitation as used
    const { error: invError } = await supabase
      .from("role_invitations")
      .update({
        is_used: true,
        activated_by: user.id,
        activated_at: new Date().toISOString(),
      })
      .eq("id", invitation.id)
      .eq("is_used", false);

    if (invError) {
      toast.error("Gagal mengaktivasi role.");
      setStatus("valid");
      return;
    }

    // Upsert role - use edge function since user can't manage user_roles directly
    const { error: roleError } = await supabase.functions.invoke("update-role", {
      body: { user_id: user.id, role: invitation.target_role, invitation_id: invitation.id },
    });

    if (roleError) {
      toast.error("Gagal memperbarui role.");
      setStatus("valid");
    } else {
      toast.success("Role berhasil diaktivasi!");
      setStatus("done");
    }
  };

  if (authLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md w-full text-center space-y-4">
        <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center mx-auto glow-primary">
          <ShieldCheck className="w-6 h-6 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-display font-bold text-foreground">Aktivasi Role</h1>

        {status === "invalid" && (
          <div className="space-y-3">
            <XCircle className="w-12 h-12 text-destructive mx-auto" />
            <p className="text-destructive font-medium">Link aktivasi tidak valid.</p>
            <Button variant="outline" onClick={() => navigate("/")}>Kembali</Button>
          </div>
        )}

        {status === "used" && (
          <div className="space-y-3">
            <XCircle className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground font-medium">Link ini sudah digunakan.</p>
            <Button variant="outline" onClick={() => navigate("/")}>Kembali</Button>
          </div>
        )}

        {status === "valid" && invitation && (
          <div className="space-y-4">
            <div className="bg-secondary/50 rounded-lg p-4 text-left space-y-2">
              <p className="text-sm text-muted-foreground">
                Role Baru: <span className="text-foreground font-medium">{ROLE_LABELS[invitation.target_role]}</span>
              </p>
              <p className="text-xs text-muted-foreground">Akun: {user?.email}</p>
            </div>
            <p className="text-sm text-muted-foreground">Klik tombol di bawah untuk mengaktivasi role ini. Hanya bisa diaktivasi 1 kali.</p>
            <Button
              onClick={handleActivate}
              className="w-full gradient-primary text-primary-foreground glow-primary"
            >
              Aktivasi Role
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
            <p className="text-primary font-medium">Role berhasil diaktivasi! 🎉</p>
            <p className="text-sm text-muted-foreground">Silakan login ulang untuk mendapatkan akses penuh.</p>
            <Button onClick={() => navigate("/")} className="gradient-primary text-primary-foreground glow-primary">
              Ke Beranda
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleActivate;
