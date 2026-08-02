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
import { fetchNowLive, titleFromSlug, formatElapsed, type LiveMember } from "@/lib/liveUtils";

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

  useEffect(() => {
    setQualityIdx(0);
  }, [urlKey, type]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream?.url) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({ lowLatencyMode: true, liveSyncDurationCount: 3 });
      hls.loadSource(stream.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) setErr("Stream tidak dapat dimuat. Coba pilih kualitas lain.");
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream.url;
      video.play().catch(() => {});
    } else {
      setErr("Browser tidak mendukung pemutaran HLS.");
    }

    return () => {
      hls?.destroy();
    };
  }, [stream?.url]);

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
