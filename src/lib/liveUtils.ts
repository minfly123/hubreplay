export interface LiveStreamUrl {
  label: string;
  quality: number;
  url: string;
}

export interface LiveMember {
  name: string;
  img: string;
  img_alt?: string;
  url_key: string;
  slug: string;
  room_id: number;
  is_graduate?: boolean;
  is_group?: boolean;
  started_at: string;
  streaming_url_list?: LiveStreamUrl[];
  is_premium?: boolean;
  group?: string;
  type: string;
}

export const NOW_LIVE_API = "https://api.crstlnz.my.id/api/now_live?group=jkt48";

/**
 * Judul diambil dari slug: "-" dianggap spasi.
 * Token angka dengan 6 digit atau lebih (mis. 260726200118) dibuang.
 */
export const titleFromSlug = (slug: string): string => {
  if (!slug) return "Live Streaming";
  const words = slug
    .split("-")
    .map((w) => w.trim())
    .filter(Boolean)
    .filter((w) => !(/^\d+$/.test(w) && w.length >= 6));

  const title = words
    .map((w) => (/^\d+$/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");

  return title || "Live Streaming";
};

export const imageCandidates = (live: {
  img?: string;
  img_alt?: string;
}): string[] => {
  const proxy = (u?: string) =>
    u ? `https://images.weserv.nl/?url=${encodeURIComponent(u.replace(/^https?:\/\//, ""))}` : "";
  return [live.img, live.img_alt, proxy(live.img), proxy(live.img_alt), "/placeholder.svg"].filter(
    Boolean
  ) as string[];
};

/**
 * Ambil semua kandidat URL .m3u8 milik satu member dari berbagai bentuk payload API.
 */
export const streamUrls = (live?: LiveMember | null): LiveStreamUrl[] => {
  if (!live) return [];
  const raw: any = live as any;
  const pools: any[] = [
    raw.streaming_url_list,
    raw.streaming_url_list_dvr,
    raw.streams,
    raw.url ? [{ label: "Original", quality: 1080, url: raw.url }] : null,
  ].filter(Boolean);

  const list: LiveStreamUrl[] = [];
  for (const pool of pools) {
    for (const s of pool as any[]) {
      const url: string | undefined = s?.url || s?.streaming_url || s?.src;
      if (!url || !url.includes(".m3u8")) continue;
      if (list.some((x) => x.url === url)) continue;
      list.push({
        label: s?.label || s?.quality_name || "Original",
        quality: Number(s?.quality) || 1080,
        url,
      });
    }
  }
  return list;
};

export const fetchNowLive = async (): Promise<LiveMember[]> => {
  const res = await fetch(NOW_LIVE_API, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("Gagal memuat data live");
  const data = await res.json();
  const list: LiveMember[] = Array.isArray(data) ? data : data?.data || data?.now_live || [];
  return list.filter((l) => !!l && !!l.url_key);
};

export const formatElapsed = (startedAt: string, nowMs: number): string => {
  const diff = Math.max(0, nowMs - new Date(startedAt).getTime());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff / 60000) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
};
