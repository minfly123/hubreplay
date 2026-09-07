import { useEffect, useState } from "react";
import AppNavigation from "@/components/AppNavigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, PartyPopper, Users, ExternalLink } from "lucide-react";

export const WA_GROUP_URL = "https://chat.whatsapp.com/EXtrxP0C1fN3aUv22LWa9M";
const EVENT_API = "https://api.crstlnz.my.id/api/event?group=jkt48";

interface EventItem {
  id: string;
  date: string;
  code?: string;
  category?: string;
  title: string;
  url?: string;
}

const fmtWib = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
  });

export const fetchUpcomingEvents = async (): Promise<EventItem[]> => {
  const res = await fetch(EVENT_API, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("failed");
  const data = await res.json();
  const now = Date.now();
  return ((data.other_schedule || []) as EventItem[])
    .filter((e) => new Date(e.date).getTime() + 86400000 > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

const EventSchedule = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = async () => {
    try {
      setEvents(await fetchUpcomingEvents());
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation />
      <main className="container mx-auto px-4 py-8 space-y-6 max-w-3xl">
        <header>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <PartyPopper className="w-6 h-6 text-primary" />
            Event Schedule
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Jadwal event JKT48 yang akan datang. Cari teman buat pergi bareng di grup komunitas!
          </p>
        </header>

        {failed && (
          <div className="glass-card p-6 text-center text-muted-foreground">
            Gagal memuat jadwal event. Coba beberapa saat lagi.
          </div>
        )}

        {!failed && events.length === 0 && (
          <div className="glass-card p-10 text-center text-muted-foreground">
            Belum ada jadwal event mendatang.
          </div>
        )}

        <div className="space-y-4">
          {events.map((e) => (
            <Card key={e.id} className="bg-card border-border p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display font-semibold text-foreground leading-snug">{e.title}</h2>
                {e.category && (
                  <Badge className="gradient-primary text-primary-foreground border-0 shrink-0 capitalize">
                    {e.category}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-primary" />
                {fmtWib(e.date)} · {fmtTime(e.date)} WIB
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button asChild className="gradient-primary text-primary-foreground font-semibold">
                  <a href={WA_GROUP_URL} target="_blank" rel="noopener noreferrer">
                    <Users className="w-4 h-4 mr-1.5" />
                    Cari teman Event
                  </a>
                </Button>
                {e.url && (
                  <Button asChild variant="outline">
                    <a
                      href={`https://jkt48.com/news/detail/id/${e.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 mr-1.5" />
                      Detail
                    </a>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default EventSchedule;
