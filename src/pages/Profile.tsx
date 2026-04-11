import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AppNavigation from "@/components/AppNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, AtSign, Check, Pencil, Lock } from "lucide-react";
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";
import { supabase as supabaseClient } from "@/integrations/supabase/client";

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [savedUsername, setSavedUsername] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data?.username) {
        setUsername(data.username);
        setSavedUsername(data.username);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    const trimmed = username.trim();
    if (!trimmed || trimmed.length < 3) {
      toast.error("Username minimal 3 karakter");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      toast.error("Username hanya boleh huruf, angka, dan underscore");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ username: trimmed })
      .eq("user_id", user.id);
    if (error) {
      if (error.code === "23505") {
        toast.error("Username sudah dipakai, pilih yang lain");
      } else {
        toast.error("Gagal menyimpan username");
      }
    } else {
      setSavedUsername(trimmed);
      setEditing(false);
      toast.success("Username berhasil disimpan!");
    }
    setSaving(false);
  };

  if (authLoading || loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation />
      <main className="container mx-auto px-4 py-8 max-w-lg">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <User className="w-5 h-5 text-primary" />
              Profil Saya
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
                <Mail className="w-3.5 h-3.5" />
                Email
              </Label>
              <div className="px-3 py-2.5 rounded-lg bg-secondary/50 text-foreground text-sm">
                {user?.email}
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
                <AtSign className="w-3.5 h-3.5" />
                Username
              </Label>
              {savedUsername && !editing ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2.5 rounded-lg bg-secondary/50 text-foreground text-sm">
                    {savedUsername}
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    maxLength={20}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleSave} disabled={saving}>
                    <Check className="w-4 h-4 mr-1" />
                    {saving ? "..." : "Simpan"}
                  </Button>
                </div>
              )}
              {!savedUsername && (
                <p className="text-xs text-amber-400">
                  ⚠️ Kamu harus mengatur username untuk bisa berkomentar
                </p>
              )}
            </div>

            {/* Change Password */}
            <div className="space-y-2 pt-4 border-t border-border">
              <Label className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5" />
                Ganti Password
              </Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Password baru"
              />
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Konfirmasi password baru"
              />
              <Button
                size="sm"
                onClick={async () => {
                  if (!newPassword || newPassword.length < 6) {
                    toast.error("Password minimal 6 karakter");
                    return;
                  }
                  if (newPassword !== confirmPassword) {
                    toast.error("Password tidak cocok!");
                    return;
                  }
                  setChangingPassword(true);
                  const { error } = await supabase.auth.updateUser({ password: newPassword });
                  if (error) {
                    toast.error("Gagal mengubah password: " + error.message);
                  } else {
                    toast.success("Password berhasil diubah!");
                    setNewPassword("");
                    setConfirmPassword("");
                  }
                  setChangingPassword(false);
                }}
                disabled={changingPassword || !newPassword || !confirmPassword}
                className="w-full"
              >
                <Check className="w-4 h-4 mr-1" />
                {changingPassword ? "Menyimpan..." : "Simpan Password Baru"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
