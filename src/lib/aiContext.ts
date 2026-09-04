import { fetchNowLive, titleFromSlug, formatElapsed } from "@/lib/liveUtils";
import { fetchNextBirthdays, formatBirthdate, nextBirthdayMs, ageOnNextBirthday, countdownParts } from "@/lib/birthdayUtils";

const THEATER_API = "https://api.crstlnz.my.id/api/theater?group=jkt48";

const fmtWib = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const liveContext = async (): Promise<string> => {
  try {
    const lives = await fetchNowLive();
    if (!lives.length) return "Saat ini TIDAK ADA member JKT48 yang sedang live (IDN Live / Showroom).";
    const now = Date.now();
    return lives
      .map((l: any, i: number) => {
        const nama = l.name || l.url_key || "-";
        const judul = l.title || titleFromSlug(l.slug || "");
        const tipe = l.type === "idn" ? "IDN Live" : "Showroom";
        const durasi = l.started_at ? formatElapsed(l.started_at, now) : "-";
        return `${i + 1}. ${nama} — ${tipe} — judul: "${judul}" — mulai: ${l.started_at ? fmtWib(l.started_at) : "-"} — sudah berjalan ${durasi} — room_id: ${l.room_id ?? "-"}`;
      })
      .join("\n");
  } catch {
    return "Data live member tidak bisa dimuat saat ini.";
  }
};

const scheduleContext = async (): Promise<string> => {
  try {
    const res = await fetch(THEATER_API, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error("failed");
    const data = await res.json();
    const nowMs = Date.now();
    const upcoming = (data.theater || [])
      .filter((s: any) => new Date(s.start_date).getTime() > nowMs)
      .sort((a: any, b: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
      .slice(0, 15);
    if (!upcoming.length) return "Belum ada jadwal show theater JKT48 yang akan datang.";
    return upcoming
      .map((s: any, i: number) => {
        const members = (s.member_lineup || s.members || [])
          .map((m: any) => (typeof m === "string" ? m : m.name))
          .filter(Boolean)
          .join(", ");
        return `${i + 1}. "${s.title || s.setlist?.name || "-"}" — ${fmtWib(s.start_date)} WIB — team: ${s.team || s.setlist?.team || "JKT48"}${members ? ` — line-up: ${members}` : " — line-up belum diumumkan"}`;
      })
      .join("\n");
  } catch {
    return "Data jadwal show tidak bisa dimuat saat ini.";
  }
};

const birthdayContext = async (): Promise<string> => {
  try {
    const list = await fetchNextBirthdays();
    if (!list.length) return "Belum ada data ulang tahun member.";
    const now = Date.now();
    return list
      .slice(0, 20)
      .map((m, i) => {
        const target = nextBirthdayMs(m.birthdate, now);
        const { days, hours, minutes } = countdownParts(target, now);
        const sisa = target - now <= 0 ? "HARI INI ulang tahunnya! 🎉" : `${days} hari ${hours} jam ${minutes} menit lagi`;
        return `${i + 1}. ${m.name} — lahir ${formatBirthdate(m.birthdate)} — akan berusia ${ageOnNextBirthday(m.birthdate, now)} — ${sisa}`;
      })
      .join("\n");
  } catch {
    return "Data ulang tahun member tidak bisa dimuat saat ini.";
  }
};

/** Kumpulkan data realtime (live, jadwal, ulang tahun) dari sisi browser untuk Arva AI. */
export const buildRealtimeContext = async (): Promise<string> => {
  const [live, schedule, birthday] = await Promise.all([
    liveContext(),
    scheduleContext(),
    birthdayContext(),
  ]);
  return [
    "=== MEMBER YANG SEDANG LIVE (REALTIME) ===",
    live,
    "",
    "=== JADWAL SHOW THEATER JKT48 MENDATANG + LINE-UP (REALTIME) ===",
    schedule,
    "",
    "=== NEXT BIRTHDAY MEMBER JKT48 (REALTIME, diurutkan terdekat) ===",
    birthday,
  ].join("\n");
};
