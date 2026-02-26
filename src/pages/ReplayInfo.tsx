import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useReplays } from "@/hooks/useReplays";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Copy, Check, Key, Link2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const ReplayInfo = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { replays, loading } = useReplays();
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin) {
      navigate("/", { replace: true });
      return;
    }
  }, [user, isAdmin, authLoading, navigate]);

  const getWatchUrl = (replayId: string) => {
    return `${window.location.origin}/watch/${replayId}`;
  };

  const copyInfo = (replay: any) => {
    const watchUrl = getWatchUrl(replay.id);
    const text = `🎬 Info Replay Hub Replay\n\n📌 Judul: ${replay.title}\n🎭 Tipe: ${replay.type}\n📅 Waktu Show: ${new Date(replay.show_time).toLocaleString("id-ID")}\n🔗 Link Replay: ${watchUrl}\n🔑 Kunci Akses: ${replay.access_key}\n${replay.is_free ? "✅ Gratis" : "🔒 Berbayar"}\n\n⚠️ JANGAN membagikan kunci akses ini kepada siapapun!`;
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
          <p className="text-sm text-yellow-500 font-medium">Jangan membagikan kunci akses kepada siapapun!</p>
        </div>

        <h2 className="text-lg font-display font-bold text-foreground mb-4">
          Semua Replay ({replays.length})
        </h2>

        <div className="space-y-3">
          {replays.map((r) => (
            <div key={r.id} className="glass-card p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">{r.title}</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${r.is_free ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
                    {r.is_free ? "Gratis" : "Berbayar"}
                  </span>
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
                  <span className="text-muted-foreground/60">Waktu:</span> {new Date(r.show_time).toLocaleString("id-ID")}
                </p>
                <p className="flex items-center gap-1.5 break-all">
                  <Link2 className="w-3 h-3 shrink-0" />
                  {getWatchUrl(r.id)}
                </p>
                <p className="flex items-center gap-1.5 font-mono">
                  <Key className="w-3 h-3 shrink-0" />
                  {r.access_key}
                </p>
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
