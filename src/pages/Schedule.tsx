import { useEffect, useState } from "react";
import { Calendar, Clock, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AppNavigation from "@/components/AppNavigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface ShowMember {
  id: string;
  name: string;
  url_key: string;
}

interface TheaterShow {
  id: string;
  title: string;
  banner: string;
  poster: string;
  team: string;
  start_date: string;
  end_date: string;
  members?: ShowMember[];
  member_count: number;
  url: string;
}

const Countdown = ({ target }: { target: string }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const targetMs = new Date(target).getTime();
  const diff = targetMs - now;

  if (diff <= 0) {
    return (
      <span className="text-xs font-semibold text-destructive flex items-center gap-1">
        <Clock className="w-3 h-3" /> Sudah Mulai / Selesai
      </span>
    );
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return (
    <div className="flex items-center gap-1 text-xs font-mono font-semibold text-primary">
      <Clock className="w-3 h-3" />
      {days > 0 && <span>{days}h</span>}
      <span>{String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</span>
    </div>
  );
};

const Schedule = () => {
  const [shows, setShows] = useState<TheaterShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const url = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/jkt48-schedule?group=jkt48`;
        const res = await fetch(url, {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        });
        if (!res.ok) throw new Error("Gagal memuat jadwal");
        const data = await res.json();
        const sorted = (data.theater || []).sort(
          (a: TheaterShow, b: TheaterShow) =>
            new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        );
        setShows(sorted);
      } catch (e: any) {
        setErr(e.message || "Gagal memuat jadwal");
      } finally {
        setLoading(false);
      }
    };
    fetchShows();
    const interval = setInterval(fetchShows, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-foreground mb-1 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Jadwal Show JKT48
          </h1>
          <p className="text-muted-foreground text-sm">
            Daftar show theater JKT48 terbaru beserta line-up member
          </p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : err ? (
          <div className="text-center py-20 text-destructive">{err}</div>
        ) : shows.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">Tidak ada jadwal show.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shows.map((show) => (
              <Card
                key={show.id}
                className="overflow-hidden glass-card hover:border-primary/40 transition-colors"
              >
                <div className="relative aspect-video bg-secondary overflow-hidden">
                  <img
                    src={show.banner || show.poster}
                    alt={show.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = show.poster || "/placeholder.svg";
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-primary text-primary-foreground">{show.team}</Badge>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-display font-bold text-foreground text-lg leading-tight mb-1">
                      {show.title}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(show.start_date), "EEEE, d MMMM yyyy • HH:mm", {
                        locale: idLocale,
                      })}{" "}
                      WIB
                    </p>
                  </div>

                  <Countdown target={show.start_date} />

                  {show.members && show.members.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                        <Users className="w-3 h-3 text-primary" />
                        Line-Up ({show.members.length} member)
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {show.members.map((m) => (
                          <Badge
                            key={m.id}
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 h-5 border-primary/30 text-foreground bg-primary/5"
                          >
                            {m.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Schedule;
