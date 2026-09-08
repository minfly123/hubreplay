import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import PublicNavigation from "@/components/PublicNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Play, Lock } from "lucide-react";

type Status = "checking" | "ready" | "invalid";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>("checking");
  const navigate = useNavigate();

  useEffect(() => {
    let done = false;

    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      setStatus(ok ? "ready" : "invalid");
    };

    const clearUrl = () => {
      window.history.replaceState(null, "", window.location.pathname);
    };

    const run = async () => {
      // 1) Sudah ada sesi recovery aktif?
      const { data: existing } = await supabase.auth.getSession();
      if (existing.session) {
        finish(true);
        return;
      }

      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const query = new URLSearchParams(window.location.search);

      // 2) Link gaya implicit: #access_token=...&refresh_token=...
      const access_token = hash.get("access_token");
      const refresh_token = hash.get("refresh_token");
      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        clearUrl();
        finish(!error);
        return;
      }

      // 3) Link gaya PKCE: ?code=...
      const code = query.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        clearUrl();
        finish(!error);
        return;
      }

      // 4) Link gaya verify: ?token_hash=...&type=recovery (atau di hash)
      const token_hash = query.get("token_hash") || hash.get("token_hash");
      if (token_hash) {
        const { error } = await supabase.auth.verifyOtp({ token_hash, type: "recovery" });
        clearUrl();
        finish(!error);
        return;
      }

      // 5) Error dari email link
      if (hash.get("error_description") || query.get("error_description")) {
        finish(false);
        return;
      }

      finish(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) finish(true);
    });

    run();

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Kata sandi minimal 6 karakter");
      return;
    }
    if (password !== confirm) {
      toast.error("Konfirmasi kata sandi tidak sama");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Kata sandi baru berhasil disimpan!");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNavigation />
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center glow-primary">
                <Play className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Arca<span className="text-gradient">nove48</span>
              </h1>
            </div>
            <p className="text-muted-foreground text-sm">Buat kata sandi baru</p>
          </div>

          <div className="glass-card p-6">
            {status === "checking" && (
              <p className="text-sm text-muted-foreground text-center">Memeriksa link reset…</p>
            )}

            {status === "invalid" && (
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Link reset kata sandi tidak valid atau sudah kedaluwarsa. Minta link baru lewat
                  tombol "Lupa kata sandi?" di halaman masuk.
                </p>
                <Button
                  onClick={() => navigate("/auth")}
                  className="w-full gradient-primary text-primary-foreground font-semibold glow-primary"
                >
                  Ke halaman masuk
                </Button>
              </div>
            )}

            {status === "ready" && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Kata sandi baru"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-secondary border-border"
                    required
                    minLength={6}
                    autoFocus
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Ulangi kata sandi baru"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="pl-10 bg-secondary border-border"
                    required
                    minLength={6}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full gradient-primary text-primary-foreground font-semibold glow-primary"
                >
                  {loading ? "Menyimpan..." : "Simpan Kata Sandi Baru"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
