import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useReplays } from "@/hooks/useReplays";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Copy, Check, Key, Link2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const ReplayInfo = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { replays, loading } = useReplays();
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [generatedUrls, setGeneratedUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin) {
      navigate("/", { replace: true });
      return;
    }
  }, [user, isAdmin, authLoading, navigate]);

  const generateUnlockUrl = async (replayId: string) => {
    setGeneratingId(replayId);
    try {
      const { data, error } = await supabase
        .from("replay_unlock_tokens")
        .insert({ replay_id: replayId })
        .select("token")
        .single();

      if (error) throw error;

      const url = `${window.location.origin}/unlock/${data.token}`;
      setGeneratedUrls(prev => ({ ...prev, [replayId]: url }));
      toast.success("URL kunci berhasil dibuat!");
    } catch (err: any) {
      toast.error("Gagal membuat URL kunci: " + err.message);
    }
    setGeneratingId(null);
  };

  const getWatchUrl = (replayId: string) => {
    return `${window.location.origin}/watch/${replayId}`;
  };

  const copyInfo = (replay: any) => {
    const watchUrl = getWatchUrl(replay.id);
    const unlockUrl = generatedUrls[replay.id];
    
    let text = `🎬 Info Replay Hub Replay\n\n📌 Judul: ${replay.title}\n🎭 Tipe: ${replay.type}\n📅 Waktu Show: ${new Date(replay.show_time).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}\n🔗 Link Replay: ${watchUrl}\n${replay.is_free ? "✅ Gratis" : "🔒 Berbayar"}`;
    
    if (!replay.is_free && unlockUrl) {
      text += `\n🔑 URL Kunci: ${unlockUrl}\n\n⚠️ URL kunci hanya bisa digunakan 1x dan berlaku 24 jam!\n⚠️ JANGAN membagikan URL kunci ini kepada orang lain!`;
    } else if (!replay.is_free) {
      text += `\n\n⚠️ Klik ikon 🔑 untuk membuat URL kunci terlebih dahulu!`;
    }

    navigator.clipboard.writeText(text);
    setCopiedId(replay.id);
    toast.success("Info replay disalin!");
    setTimeout(() => setCopiedId(null), 2000);
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
              Hub <span className="text-gradient">Replay</span> — Info Replay
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
          <p className="text-sm text-yellow-500 font-medium">URL kunci bersifat sekali pakai & berlaku 24 jam!</p>
        </div>

        <h2 className="text-lg font-display font-bold text-foreground mb-4">
          Semua Replay ({replays.length})
        </h2>

        <div className="space-y-3">
          {replays.map((r) => (
            <div key={r.id} className="glass-card p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">{r.title}</h3>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${r.is_free ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
                    {r.is_free ? "Gratis" : "Berbayar"}
                  </span>
                  {!r.is_free && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => generateUnlockUrl(r.id)}
                      disabled={generatingId === r.id}
                      className="text-xs px-2"
                      title="Buat URL Kunci"
                    >
                      {generatingId === r.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Key className="w-3.5 h-3.5 text-primary" />
                      )}
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => copyInfo(r)} className="text-xs">
                    {copiedId === r.id ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                    {copiedId === r.id ? "Tersalin" : "Salin Info"}
                  </Button>
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="flex items-center gap-1.5">
                  <span className="text-muted-foreground/60">Tipe:</span> {r.type}
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="text-muted-foreground/60">Waktu:</span> {new Date(r.show_time).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                <p className="flex items-center gap-1.5 break-all">
                  <Link2 className="w-3 h-3 shrink-0" />
                  {getWatchUrl(r.id)}
                </p>
                {generatedUrls[r.id] && (
                  <p className="flex items-center gap-1.5 break-all font-mono text-primary">
                    <Key className="w-3 h-3 shrink-0" />
                    {generatedUrls[r.id]}
                  </p>
                )}
              </div>
            </div>
          ))}
          {replays.length === 0 && (
            <p className="text-muted-foreground text-center py-8">Belum ada replay tersedia.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReplayInfo;
