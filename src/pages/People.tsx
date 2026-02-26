import { useEffect, useState } from "react";
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
import { ArrowLeft, Play, Users, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface ProfileWithRole {
  id: string;
  user_id: string;
  email: string | null;
  created_at: string;
  role: string;
}

const ROLE_LABELS: Record<string, string> = {
  user: "Member",
  admin: "Admin",
  super_admin: "Super Admin",
};

const People = () => {
  const { user, isAdmin, isSuperAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<ProfileWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin) {
      navigate("/", { replace: true });
      return;
    }
    fetchProfiles();

    // Realtime for role changes
    const channel = supabase
      .channel("people-roles")
      .on("postgres_changes", { event: "*", schema: "public", table: "user_roles" }, () => fetchProfiles())
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => fetchProfiles())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, isAdmin, authLoading, navigate]);

  const fetchProfiles = async () => {
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!profilesData) { setLoading(false); return; }

    // Fetch roles
    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("user_id, role");

    const roleMap: Record<string, string> = {};
    if (rolesData) {
      rolesData.forEach(r => { roleMap[r.user_id] = r.role; });
    }

    setProfiles(profilesData.map(p => ({
      ...p,
      role: roleMap[p.user_id] || "user",
    })));
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!isSuperAdmin) {
      toast.error("Akses ditolak! Hanya untuk Super Admin.");
      return;
    }

    const { error } = await supabase.functions.invoke("manage-role", {
      body: { target_user_id: userId, new_role: newRole },
    });

    if (error) {
      toast.error("Gagal mengubah role.");
    } else {
      toast.success("Role berhasil diubah!");
      fetchProfiles();
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

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
              Hub <span className="text-gradient">Replay</span>
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-display font-bold text-foreground">
            Pengguna Terdaftar
          </h1>
          <span className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full">
            {profiles.length} akun
          </span>
        </div>

        <div className="space-y-2">
          {profiles.map((p, i) => (
            <div key={p.id} className="glass-card p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs text-muted-foreground w-8 shrink-0">{i + 1}.</span>
                <div className="min-w-0">
                  <p className="text-foreground text-sm font-medium truncate">{p.email || "No email"}</p>
                  <p className="text-muted-foreground text-xs">
                    Bergabung: {new Date(p.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isSuperAdmin ? (
                  <Select
                    value={p.role}
                    onValueChange={(val) => handleRoleChange(p.user_id, val)}
                  >
                    <SelectTrigger className="w-[130px] h-8 text-xs bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    {ROLE_LABELS[p.role] || "Member"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default People;
