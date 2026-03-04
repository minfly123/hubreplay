const STORAGE_KEY = "hub_replay_watch_progress";

interface WatchEntry {
  time: number;
  updatedAt: number;
}

type WatchStore = Record<string, WatchEntry>;

const getStore = (): WatchStore => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

const saveStore = (store: WatchStore) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

export const saveProgress = (videoId: string, time: number) => {
  const store = getStore();
  store[videoId] = { time, updatedAt: Date.now() };
  saveStore(store);
};

export const getProgress = (videoId: string): number => {
  return getStore()[videoId]?.time ?? 0;
};

export const clearProgress = (videoId: string) => {
  const store = getStore();
  delete store[videoId];
  saveStore(store);
};

/** Remove entries older than 14 days */
export const cleanupOldEntries = () => {
  const store = getStore();
  const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
  let changed = false;
  for (const key in store) {
    if (store[key].updatedAt < cutoff) {
      delete store[key];
      changed = true;
    }
  }
  if (changed) saveStore(store);
};

export const formatSecondsToTime = (s: number): string => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};
