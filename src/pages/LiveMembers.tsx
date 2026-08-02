import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Radio, Clock, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AppNavigation from "@/components/AppNavigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  fetchNowLive,
  titleFromSlug,
  imageCandidates,
  formatElapsed,
  type LiveMember,
} from "@/lib/liveUtils";

const LiveThumb = ({ live }: { live: LiveMember }) => {
  const candidates = imageCandidates(live);
  const [idx, setIdx] = useState(0);

  return (
    <div className="relative aspect-video bg-secondary overflow-hidden">
      <img
        src={candidates[idx]}
        alt={`Live ${live.name}`}
        referrerPolicy="no-referrer"
        loading="lazy"
        className="w-full h-full object-cover"
        onError={() => setIdx((i) => (i < candidates.length - 1 ? i + 1 : i))}
      />
      <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-destructive px-2 py-0.5 rounded-md">
        <span className="w-1.5 h-1.5 rounded-full bg-destructive-foreground animate-pulse" />
        <span className="text-[10px] font-bold uppercase text-destructive-foreground tracking-wide">
          Live
        </span>
      </div>
      <Badge className="absolute top-2 right-2 bg-background/80 text-foreground text-[10px] uppercase">
        {live.type}
      </Badge>
    </div>
  );
};

const Elapsed = ({ startedAt }: { startedAt: string }) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex items-center gap-1 text-xs font-mono font-semibold text-primary">
      <Clock className="w-3 h-3" />
      {formatElapsed(startedAt, now)}
    </div>
  );
};

const LiveMembers = () => {
  const navigate = useNavigate();
  const [lives, setLives] = useState<LiveMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const list = await fetchNowLive();
        if (!active) return;
        setLives(list);
        setErr(null);
      } catch (e: any) {
        if (active) setErr(e.message || "Gagal memuat data live");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 20000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-foreground mb-1 flex items-center gap-2">
            <Radio className="w-6 h-6 text-primary" />
            Live Member
          </h1>
          <p className="text-muted-foreground text-sm">
            Member JKT48 yang sedang live di IDN Live &amp; Showroom — diperbarui otomatis
          </p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : err ? (
          <div className="text-center py-20 text-destructive">{err}</div>
        ) : lives.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            Belum ada member yang live saat ini. Halaman ini akan update otomatis.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lives.map((live) => (
              <Card
                key={`${live.type}-${live.url_key}-${live.started_at}`}
                onClick={() => navigate(`/live/${live.type}/${live.url_key}`)}
                className="overflow-hidden glass-card cursor-pointer hover:border-primary/40 transition-colors"
              >
                <LiveThumb live={live} />
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5">
                      <Users className="w-2.5 h-2.5 mr-1" />
                      {live.name}
                    </Badge>
                    {live.is_premium && (
                      <Badge variant="outline" className="text-[10px] border-primary/40">
                        Premium
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-foreground text-lg leading-tight">
                    {titleFromSlug(live.slug)}
                  </h3>
                  <Elapsed startedAt={live.started_at} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default LiveMembers;
