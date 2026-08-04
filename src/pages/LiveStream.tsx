import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Hls from "hls.js";
import { ArrowLeft, Radio, Clock, Monitor, Signal, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AppNavigation from "@/components/AppNavigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  fetchNowLive,
  titleFromSlug,
  formatElapsed,
  streamUrls,
  type LiveMember,
} from "@/lib/liveUtils";

const STREAM_PROXY = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/live-stream-proxy?url=`;

const proxiedStreamUrl = (url: string) => {
  if (url.startsWith(STREAM_PROXY)) return url;
  return `${STREAM_PROXY}${encodeURIComponent(url)}`;
};

const LiveStream = () => {
  const { type, urlKey } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [live, setLive] = useState<LiveMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [qualityIdx, setQualityIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const list = await fetchNowLive();
        if (!active) return;
        const found =
          list.find((l) => l.url_key === urlKey && l.type === type) ||
          list.find((l) => l.url_key === urlKey) ||
          null;
        if (!found) {
          setErr("Live sudah berakhir atau tidak ditemukan.");
          setLive(null);
        } else {
          setErr(null);
          setLive(found);
        }
      } catch (e: any) {
        if (active) setErr(e.message || "Gagal memuat data live");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [urlKey, type]);

  const streams = streamUrls(live);
  const stream = streams[qualityIdx] || streams[0];
  const playbackUrl = stream?.url ? proxiedStreamUrl(stream.url) : null;

  useEffect(() => {
    setQualityIdx(0);
  }, [urlKey, type]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playbackUrl) return;

    let hls: Hls | null = null;
    setErr(null);
    video.removeAttribute("src");
    video.load();

    if (Hls.isSupported()) {
      hls = new Hls({
        lowLatencyMode: true,
        enableWorker: true,
        backBufferLength: 30,
        liveSyncDurationCount: 3,
        manifestLoadingMaxRetry: 4,
        levelLoadingMaxRetry: 4,
        fragLoadingMaxRetry: 6,
        xhrSetup: (xhr, requestUrl) => {
          if (requestUrl.startsWith(import.meta.env.VITE_SUPABASE_URL)) {
            xhr.setRequestHeader("apikey", import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
            xhr.setRequestHeader(
              "Authorization",
              `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
            );
          }
        },
      });
      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => hls?.loadSource(playbackUrl));
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setErr(null);
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (!data.fatal) return;

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setErr("Koneksi stream terputus. Mencoba menyambungkan kembali…");
          window.setTimeout(() => hls?.startLoad(), 1000);
          return;
        }
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          setErr("Player sedang memulihkan video…");
          hls?.recoverMediaError();
          return;
        }
        setErr("Siaran sedang tidak dapat diputar. Silakan coba lagi sebentar.");
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      fetch(playbackUrl, {
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      })
        .then((response) => {
          if (!response.ok) throw new Error("Manifest tidak tersedia");
          return response.blob();
        })
        .then((manifest) => {
          video.src = URL.createObjectURL(manifest);
          video.play().catch(() => {});
        })
        .catch(() => setErr("Siaran sedang tidak dapat diputar. Silakan coba lagi sebentar."));
    } else {
      setErr("Browser tidak mendukung pemutaran HLS.");
    }

    return () => {
      hls?.destroy();
    };
  }, [playbackUrl]);

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation />
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Button variant="ghost" size="sm" onClick={() => navigate("/live")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Live Member
        </Button>

        {loading ? (
          <LoadingSpinner />
        ) : !live ? (
          <div className="text-center py-20 text-destructive">{err || "Live tidak ditemukan."}</div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden bg-black aspect-video border border-border">
              <video
                ref={videoRef}
                controls
                playsInline
                autoPlay
                muted
                className="w-full h-full"
              />
            </div>

            {!stream?.url && (
              <p className="text-xs text-destructive">
                URL stream (.m3u8) tidak tersedia untuk live ini.
              </p>
            )}
            {err && <p className="text-xs text-destructive">{err}</p>}

            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge className="bg-destructive text-destructive-foreground text-[10px]">
                  <Radio className="w-2.5 h-2.5 mr-1" /> LIVE
                </Badge>
                <Badge className="bg-primary text-primary-foreground text-[10px] uppercase">
                  {live.type}
                </Badge>
              </div>
              <h1 className="text-xl font-display font-bold text-foreground">
                {titleFromSlug(live.slug)}
              </h1>
            </div>

            {streams.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {streams.map((s, i) => (
                  <Button
                    key={`${s.label}-${i}`}
                    size="sm"
                    variant={i === qualityIdx ? "default" : "outline"}
                    onClick={() => setQualityIdx(i)}
                  >
                    {s.label} ({s.quality}p)
                  </Button>
                ))}
              </div>
            )}

            <Card className="glass-card p-4 space-y-3">
              <h2 className="font-display font-bold text-foreground text-sm">Stream Info</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Member:</span>
                  <span className="text-foreground font-medium">{live.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Signal className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Kualitas:</span>
                  <span className="text-foreground font-medium">
                    {stream ? `${stream.label} — ${stream.quality}p` : "-"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Mulai:</span>
                  <span className="text-foreground font-medium">
                    {format(new Date(live.started_at), "d MMM yyyy • HH:mm", { locale: idLocale })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Tipe Live:</span>
                  <span className="text-foreground font-medium uppercase">{live.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Durasi:</span>
                  <span className="text-foreground font-mono font-semibold">
                    {formatElapsed(live.started_at, now)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Room ID:</span>
                  <span className="text-foreground font-medium">{live.room_id}</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default LiveStream;
