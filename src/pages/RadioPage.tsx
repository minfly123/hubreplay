import { useEffect, useRef, useState } from "react";
import { Radio, Play, Pause, Volume2, VolumeX, Share2, MessageCircle, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import AppNavigation from "@/components/AppNavigation";
import { toast } from "sonner";

export const RADIO_STREAM_URL = "https://s2.kroyamedia.zone.id:8022/stream";
export const RADIO_NAME = "JKT48 Radio Cilacap";

const SHARE_TEXT =
  "🎧 Dengerin JKT48 Radio 24 jam nonstop di Hub Replay! Lagu-lagu JKT48 favoritmu diputar tanpa henti, langsung dari Cilacap. Gratis, tinggal klik play 👇";

const RadioPage = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);
  const [uptime, setUptime] = useState(0);
  const [bars, setBars] = useState<number[]>(Array.from({ length: 24 }, () => 20));

  // Listening timer
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setUptime((u) => u + 1), 1000);
    return () => clearInterval(t);
  }, [playing]);

  // Decorative visualizer
  useEffect(() => {
    if (!playing) {
      setBars((b) => b.map(() => 12));
      return;
    }
    const t = setInterval(() => {
      setBars((b) => b.map(() => 15 + Math.random() * 85));
    }, 160);
    return () => clearInterval(t);
  }, [playing]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = muted ? 0 : volume / 100;
  }, [volume, muted]);

  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      a.src = "";
      setPlaying(false);
      setBuffering(false);
      return;
    }
    try {
      setBuffering(true);
      // Cache-bust so Icecast always serves a fresh live position
      a.src = `${RADIO_STREAM_URL}?${Date.now()}`;
      a.volume = muted ? 0 : volume / 100;
      await a.play();
      setPlaying(true);
    } catch {
      toast.error("Gagal memutar radio. Coba lagi sebentar ya!");
      setPlaying(false);
    } finally {
      setBuffering(false);
    }
  };

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/radio` : "";
  const fullText = `${SHARE_TEXT}\n\n${shareUrl}`;

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(fullText)}`, "_blank", "noopener");
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${RADIO_NAME} — Hub Replay`, text: SHARE_TEXT, url: shareUrl });
        return;
      } catch {
        return;
      }
    }
    copyLink();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
      toast.success("Teks & link berhasil disalin!");
    } catch {
      toast.error("Gagal menyalin link");
    }
  };

  const fmt = (s: number) =>
    [Math.floor(s / 3600), Math.floor((s / 60) % 60), Math.floor(s % 60)]
      .map((n) => String(n).padStart(2, "0"))
      .join(":");

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-foreground mb-1 flex items-center gap-2">
            <Radio className="w-6 h-6 text-primary" />
            JKT48 Radio
          </h1>
          <p className="text-muted-foreground text-sm">
            Radio khas JKT48 dari Cilacap — on air 24 jam nonstop, gratis untuk semua.
          </p>
        </div>

        <section className="glass-card overflow-hidden">
          {/* Cover / visualizer */}
          <div className="relative p-8 flex flex-col items-center gap-6 bg-gradient-to-b from-primary/15 to-transparent">
            <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-[10px] uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive-foreground animate-pulse" />
              On Air
            </Badge>

            <div
              className={`w-32 h-32 rounded-3xl gradient-primary flex items-center justify-center glow-primary transition-transform duration-500 ${
                playing ? "scale-105" : "scale-100"
              }`}
            >
              <Radio className={`w-14 h-14 text-primary-foreground ${playing ? "animate-pulse" : ""}`} />
            </div>

            <div className="text-center">
              <h2 className="text-xl font-display font-bold text-foreground">{RADIO_NAME}</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Kroya Media · 128 kbps AAC · Live Stream
              </p>
            </div>

            {/* Visualizer */}
            <div className="flex items-end justify-center gap-1 h-16 w-full max-w-sm">
              {bars.map((h, i) => (
                <span
                  key={i}
                  className="flex-1 rounded-full bg-primary/70 transition-all duration-150 ease-out"
                  style={{ height: `${h}%`, opacity: playing ? 0.5 + h / 200 : 0.25 }}
                />
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="p-6 space-y-5 border-t border-border">
            <div className="flex items-center gap-4">
              <button
                onClick={toggle}
                aria-label={playing ? "Hentikan radio" : "Putar radio"}
                className="w-14 h-14 shrink-0 rounded-full gradient-primary flex items-center justify-center glow-primary hover:opacity-90 transition-opacity"
              >
                {buffering ? (
                  <Loader2 className="w-6 h-6 text-primary-foreground animate-spin" />
                ) : playing ? (
                  <Pause className="w-6 h-6 text-primary-foreground" />
                ) : (
                  <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {playing ? "Sedang memutar siaran langsung" : buffering ? "Menyambungkan..." : "Siap diputar"}
                </p>
                <p className="text-xs font-mono text-muted-foreground mt-0.5">
                  Durasi mendengarkan: {fmt(uptime)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setMuted((m) => !m)}
                aria-label={muted ? "Nyalakan suara" : "Bisukan"}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {muted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <Slider
                min={0}
                max={100}
                step={1}
                value={[muted ? 0 : volume]}
                onValueChange={(v) => {
                  setVolume(v[0]);
                  setMuted(v[0] === 0);
                }}
                className="flex-1"
              />
              <span className="text-xs font-mono text-muted-foreground w-8 text-right">
                {muted ? 0 : volume}
              </span>
            </div>

            <audio
              ref={audioRef}
              preload="none"
              onWaiting={() => setBuffering(true)}
              onPlaying={() => {
                setBuffering(false);
                setPlaying(true);
              }}
              onPause={() => setPlaying(false)}
              onError={() => {
                if (playing) toast.error("Koneksi radio terputus. Tekan play untuk menyambung ulang.");
                setBuffering(false);
                setPlaying(false);
              }}
            />
          </div>

          {/* Share */}
          <div className="p-6 border-t border-border space-y-3">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Bagikan Radio Ini</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed bg-secondary/40 rounded-lg p-3">
              {SHARE_TEXT}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={shareWhatsApp} className="gap-2">
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Button>
              <Button size="sm" variant="outline" onClick={shareNative} className="gap-2">
                <Share2 className="w-4 h-4" />
                Bagikan ke lainnya
              </Button>
              <Button size="sm" variant="ghost" onClick={copyLink} className="gap-2">
                <Copy className="w-4 h-4" />
                Salin teks + link
              </Button>
            </div>
          </div>
        </section>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Siaran disediakan oleh Kroya Media (Cilacap). Hub Replay hanya menyediakan pemutar.
        </p>
      </main>
    </div>
  );
};

export default RadioPage;
