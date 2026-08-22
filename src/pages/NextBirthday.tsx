import { useEffect, useState } from "react";
import { Cake, Gift, PartyPopper } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AppNavigation from "@/components/AppNavigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  fetchNextBirthdays,
  nextBirthdayMs,
  ageOnNextBirthday,
  formatBirthdate,
  formatBirthdayShort,
  memberImageCandidates,
  countdownParts,
  type BirthdayMember,
} from "@/lib/birthdayUtils";

const MemberPhoto = ({ member }: { member: BirthdayMember }) => {
  const candidates = memberImageCandidates(member.img);
  const [idx, setIdx] = useState(0);

  return (
    <div className="relative aspect-square bg-secondary overflow-hidden">
      <img
        src={candidates[idx]}
        alt={`Foto member JKT48 ${member.name}`}
        referrerPolicy="no-referrer"
        loading="lazy"
        className="w-full h-full object-cover"
        onError={() => setIdx((i) => (i < candidates.length - 1 ? i + 1 : i))}
      />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
};

const Countdown = ({ target, now }: { target: number; now: number }) => {
  const { diff, days, hours, minutes, seconds } = countdownParts(target, now);

  if (diff <= 0) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
        <PartyPopper className="w-3.5 h-3.5" />
        Hari ini ulang tahunnya! 🎉
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-xs font-mono font-semibold text-primary">
      <Cake className="w-3.5 h-3.5" />
      {days > 0 && <span>{days} hari</span>}
      <span>
        {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
        {String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
};

const NextBirthday = () => {
  const [members, setMembers] = useState<BirthdayMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const list = await fetchNextBirthdays();
        if (!active) return;
        setMembers(list);
        setErr(null);
      } catch (e: any) {
        if (active) setErr(e.message || "Gagal memuat data ulang tahun");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 60000);
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
            <Cake className="w-6 h-6 text-primary" />
            Next Birthday
          </h1>
          <p className="text-muted-foreground text-sm">
            Member JKT48 yang sebentar lagi ulang tahun — diurutkan dari yang paling dekat, update realtime.
          </p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : err ? (
          <div className="text-center py-20 text-destructive">{err}</div>
        ) : members.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            Belum ada data ulang tahun yang tersedia.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {members.map((m, i) => {
              const target = nextBirthdayMs(m.birthdate, now);
              const isToday = target - now <= 0;
              return (
                <Card
                  key={`${m.url_key}-${m.birthdate}`}
                  className={`overflow-hidden glass-card transition-colors ${
                    isToday ? "border-primary/60" : "hover:border-primary/40"
                  }`}
                >
                  <div className="relative">
                    <MemberPhoto member={m} />
                    <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] px-2">
                      #{i + 1}
                    </Badge>
                    <Badge className="absolute top-2 right-2 bg-background/85 text-foreground text-[10px] px-2">
                      {formatBirthdayShort(m.birthdate)}
                    </Badge>
                  </div>
                  <div className="p-3 sm:p-4 space-y-1.5">
                    <h3 className="font-display font-bold text-foreground text-base leading-tight">
                      {m.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Gift className="w-3 h-3" />
                      {formatBirthdate(m.birthdate)} · ke-{ageOnNextBirthday(m.birthdate, now)}
                    </p>
                    <Countdown target={target} now={now} />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default NextBirthday;
