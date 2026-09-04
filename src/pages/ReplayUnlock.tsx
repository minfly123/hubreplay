import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle, XCircle, Loader2, Lock } from "lucide-react";

const ReplayUnlock = () => {
  const { token } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "used" | "expired" | "unlocking" | "done">("loading");
  const [replayTitle, setReplayTitle] = useState("");
  const [replayId, setReplayId] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(`/auth?redirect=/unlock/${token}`, { replace: true });
      return;
    }
    if (user && token) {
      checkToken();
    }
  }, [user, authLoading, token]);

  const checkToken = async () => {
    if (!token || !user) { setStatus("invalid"); return; }

    const { data, error } = await supabase
      .from("replay_unlock_tokens")
      .select("*, replays(title)")
      .eq("token", token)
      .maybeSingle();

    if (error || !data) { setStatus("invalid"); return; }
    if (data.is_used) { setStatus("used"); return; }
    if (new Date(data.expires_at).getTime() <= Date.now()) { setStatus("expired"); return; }

    setReplayTitle((data as any).replays?.title || "Unknown");
    setReplayId(data.replay_id);
    setStatus("valid");
  };

  const handleUnlock = async () => {
    if (!user || !token) return;
    setStatus("unlocking");

    // 1. Mark token as used
    const { error: tokenErr } = await supabase
      .from("replay_unlock_tokens")
      .update({ is_used: true, used_by: user.id, used_at: new Date().toISOString() })
      .eq("token", token)
      .eq("is_used", false);

    if (tokenErr) {
      setStatus("invalid");
      return;
    }

    // 2. Get token data to find replay_id
    const { data: tokenData } = await supabase
      .from("replay_unlock_tokens")
      .select("id, replay_id")
      .eq("token", token)
      .single();

    if (!tokenData) { setStatus("invalid"); return; }

    // 3. Insert unlock record
    await supabase
      .from("replay_unlocks")
      .upsert({
        replay_id: tokenData.replay_id,
        user_id: user.id,
        token_id: tokenData.id,
      }, { onConflict: "replay_id,user_id" });

    // 4. Grant 200 bonus coins for replay unlock
    await supabase.rpc("add_coins", { _user_id: user.id, _amount: 200 });
    await supabase.from("coin_transactions").insert({
      user_id: user.id,
      amount: 200,
      type: "replay_unlock_bonus",
      description: "Bonus 200 koin dari aktivasi replay",
    });

    setStatus("done");

    // Redirect to watch after short delay
    setTimeout(() => {
      navigate(`/watch/${tokenData.replay_id}`, { replace: true });
    }, 1500);
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            Kembali
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md gradient-primary flex items-center justify-center">
              <Play className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground text-sm">
              Arca<span className="text-gradient">nove48</span> — Buka Kunci
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-md text-center">
        {status === "loading" && (
          <div className="space-y-3">
            <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
            <p className="text-muted-foreground">Memverifikasi URL kunci...</p>
          </div>
        )}

        {status === "invalid" && (
          <div className="space-y-3">
            <XCircle className="w-12 h-12 text-destructive mx-auto" />
            <p className="text-foreground font-medium">URL kunci tidak valid!</p>
            <p className="text-sm text-muted-foreground">URL ini mungkin sudah tidak berlaku atau salah.</p>
            <Button variant="outline" onClick={() => navigate("/")}>Kembali ke Beranda</Button>
          </div>
        )}

        {status === "used" && (
          <div className="space-y-3">
            <XCircle className="w-12 h-12 text-destructive mx-auto" />
            <p className="text-foreground font-medium">URL kunci sudah digunakan!</p>
            <p className="text-sm text-muted-foreground">Setiap URL kunci hanya dapat digunakan 1 kali.</p>
            <Button variant="outline" onClick={() => navigate("/")}>Kembali ke Beranda</Button>
          </div>
        )}

        {status === "expired" && (
          <div className="space-y-3">
            <XCircle className="w-12 h-12 text-yellow-500 mx-auto" />
            <p className="text-foreground font-medium">URL kunci sudah kadaluarsa!</p>
            <p className="text-sm text-muted-foreground">Minta URL kunci baru dari admin.</p>
            <Button variant="outline" onClick={() => navigate("/")}>Kembali ke Beranda</Button>
          </div>
        )}

        {status === "valid" && (
          <div className="space-y-4">
            <Lock className="w-12 h-12 text-primary mx-auto" />
            <p className="text-foreground font-medium text-lg">Buka Kunci Replay</p>
            <div className="bg-secondary/50 rounded-lg p-4 text-left">
              <p className="text-sm text-muted-foreground">Show:</p>
              <p className="text-foreground font-semibold">{replayTitle}</p>
            </div>
            <p className="text-sm text-muted-foreground">Klik tombol di bawah untuk membuka replay ini. URL kunci ini hanya bisa digunakan 1 kali.</p>
            <Button onClick={handleUnlock} className="w-full gradient-primary text-primary-foreground glow-primary">
              Buka Kunci Sekarang
            </Button>
          </div>
        )}

        {status === "unlocking" && (
          <div className="space-y-3">
            <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
            <p className="text-muted-foreground">Membuka kunci...</p>
          </div>
        )}

        {status === "done" && (
          <div className="space-y-3">
            <CheckCircle className="w-12 h-12 text-primary mx-auto" />
            <p className="text-foreground font-medium">Berhasil dibuka!</p>
            <p className="text-sm text-muted-foreground">Mengalihkan ke replay...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ReplayUnlock;
