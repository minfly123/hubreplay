import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Play, Plus, Copy, Check, Trash2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface RoleInvitation {
  id: string;
  token: string;
  target_role: string;
  created_at: string;
  is_used: boolean;
  activated_by: string | null;
  activated_at: string | null;
  activated_email?: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  super_admin: "Super Admin",
};

const generateToken = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 20; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
};

const RoleAdmin = () => {
  const { user, isSuperAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<RoleInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [targetRole, setTargetRole] = useState("admin");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isSuperAdmin) {
      toast.error("Akses ditolak! Hanya untuk Super Admin.");
      navigate("/", { replace: true });
      return;
    }
    fetchInvitations();
  }, [user, isSuperAdmin, authLoading, navigate]);

  const fetchInvitations = async () => {
    const { data } = await supabase
      .from("role_invitations")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      const activatedIds = data.filter(i => i.activated_by).map(i => i.activated_by!);
      let emailMap: Record<string, string> = {};
      if (activatedIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, email")
          .in("user_id", activatedIds);
        if (profiles) {
          profiles.forEach(p => { emailMap[p.user_id] = p.email || "Unknown"; });
        }
      }
      setInvitations(data.map(i => ({
        ...i,
        activated_email: i.activated_by ? emailMap[i.activated_by] || "Unknown" : undefined,
      })));
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!user) return;
    setCreating(true);
    const token = generateToken();
    const { error } = await supabase.from("role_invitations").insert({
      token,
      target_role: targetRole as "admin" | "super_admin",
      created_by: user.id,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Link aktivasi role berhasil dibuat!");
      fetchInvitations();
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus undangan role ini?")) return;
    const { error } = await supabase.from("role_invitations").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Undangan dihapus!");
      fetchInvitations();
    }
  };

  const copyInfo = (inv: RoleInvitation) => {
    const url = `${window.location.origin}/role/${inv.token}`;
    const text = `🛡️ Aktivasi Role Arcanove48\n\n📋 Role: ${ROLE_LABELS[inv.target_role]}\n🔗 URL Aktivasi: ${url}\n\n⚠️ Jangan bagikan link ini! Hanya bisa diaktivasi 1 kali untuk 1 akun.`;
    navigator.clipboard.writeText(text);
    setCopiedId(inv.id);
    toast.success("Info disalin!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!isSuperAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md gradient-primary flex items-center justify-center">
              <Play className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground text-sm">
              Arca<span className="text-gradient">nove48</span> — Aktivasi Role
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="glass-card p-6 mb-8">
          <h2 className="text-lg font-display font-bold text-foreground mb-4">Buat Link Aktivasi Role</h2>
          <div className="flex gap-3 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-muted-foreground mb-1 block">Target Role</label>
              <Select value={targetRole} onValueChange={setTargetRole}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleCreate}
              disabled={creating}
              className="gradient-primary text-primary-foreground glow-primary"
            >
              <Plus className="w-4 h-4 mr-1" />
              {creating ? "Membuat..." : "Buat Link"}
            </Button>
          </div>
        </div>

        <h2 className="text-lg font-display font-bold text-foreground mb-4">
          Daftar Undangan Role ({invitations.length})
        </h2>
        <div className="space-y-3">
          {invitations.map((inv) => (
            <div key={inv.id} className="glass-card p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${inv.is_used ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
                    {inv.is_used ? "Digunakan" : "Belum Digunakan"}
                  </span>
                  <span className="text-xs font-medium text-foreground flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    {ROLE_LABELS[inv.target_role]}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => copyInfo(inv)} className="text-xs">
                    {copiedId === inv.id ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                    {copiedId === inv.id ? "Tersalin" : "Salin Info"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(inv.id)} className="text-xs text-destructive hover:text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground font-mono break-all">Token: {inv.token}</p>
              <p className="text-xs text-muted-foreground">URL: {window.location.origin}/role/{inv.token}</p>
              {inv.activated_email && (
                <p className="text-xs text-muted-foreground">Diaktivasi oleh: {inv.activated_email}</p>
              )}
            </div>
          ))}
          {invitations.length === 0 && (
            <p className="text-muted-foreground text-center py-8">Belum ada undangan role dibuat.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default RoleAdmin;
