export interface BirthdayMember {
  name: string;
  birthdate: string;
  img: string;
  room_id: number;
  url_key: string;
}

export const NEXT_BIRTHDAY_API = "https://api.crstlnz.my.id/api/next_birthday?group=jkt48";

/** Ambil komponen tanggal ulang tahun dalam zona waktu Jakarta (API pakai UTC+7 offset). */
export const jakartaParts = (iso: string) => {
  const d = new Date(iso);
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [y, m, dd] = fmt.format(d).split("-").map(Number);
  return { year: y, month: m, day: dd };
};

/** Timestamp ulang tahun berikutnya (00:00 WIB) dalam ms. */
export const nextBirthdayMs = (iso: string, nowMs = Date.now()): number => {
  const { month, day } = jakartaParts(iso);
  const nowYear = Number(
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric" }).format(new Date(nowMs))
  );
  // 00:00 WIB = 17:00 UTC hari sebelumnya
  const build = (year: number) => Date.UTC(year, month - 1, day, 0, 0, 0) - 7 * 3600 * 1000;
  let ts = build(nowYear);
  // masih dianggap "hari ini" sampai 24 jam setelah mulai
  if (ts + 24 * 3600 * 1000 <= nowMs) ts = build(nowYear + 1);
  return ts;
};

export const ageOnNextBirthday = (iso: string, nowMs = Date.now()): number => {
  const { year } = jakartaParts(iso);
  const next = new Date(nextBirthdayMs(iso, nowMs));
  const nextYear = Number(
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric" }).format(next)
  );
  return nextYear - year;
};

export const formatBirthdate = (iso: string): string => {
  const { day, month, year } = jakartaParts(iso);
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  return `${day} ${months[month - 1]} ${year}`;
};

export const formatBirthdayShort = (iso: string): string => {
  const { day, month } = jakartaParts(iso);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  return `${day} ${months[month - 1]}`;
};

export const memberImageCandidates = (img?: string): string[] => {
  const proxy = (u?: string) =>
    u ? `https://images.weserv.nl/?url=${encodeURIComponent(u.replace(/^https?:\/\//, ""))}` : "";
  return [img, proxy(img), "/placeholder.svg"].filter(Boolean) as string[];
};

export const fetchNextBirthdays = async (): Promise<BirthdayMember[]> => {
  const res = await fetch(NEXT_BIRTHDAY_API, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("Gagal memuat data ulang tahun");
  const data = await res.json();
  const list: BirthdayMember[] = Array.isArray(data) ? data : data?.data || [];
  const now = Date.now();
  return list
    .filter((m) => !!m?.birthdate)
    .sort((a, b) => nextBirthdayMs(a.birthdate, now) - nextBirthdayMs(b.birthdate, now));
};

export const countdownParts = (targetMs: number, nowMs: number) => {
  const diff = Math.max(0, targetMs - nowMs);
  return {
    diff,
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};
