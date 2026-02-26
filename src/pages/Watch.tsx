import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMembership } from "@/hooks/useMembership";
import YouTubePlayer from "@/components/YouTubePlayer";
import AccessKeyDialog from "@/components/AccessKeyDialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Tag, Play } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import type { Replay } from "@/hooks/useReplays";

const UNLOCKED_STORAGE_KEY = "hub_replay_unlocked_ids";

const getUnlockedIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(UNLOCKED_STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
};

const saveUnlockedId = (id: string) => {
  const ids = getUnlockedIds();
  ids.add(id);
  localStorage.setItem(UNLOCKED_STORAGE_KEY, JSON.stringify([...ids]));
};

const Watch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { isActive: hasMembership } = useMembership();
  const [replay, setReplay] = useState<Replay | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Wake Lock - prevent screen from sleeping
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
        }
      } catch {}
    };
    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      wakeLockRef.current?.release().catch(() => {});
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const fetchReplay = async () => {
      const { data } = await supabase
        .from("replays")
        .select("*")
        .eq("id", id)
        .single();
      if (data) setReplay(data);
      setLoading(false);
    };
    fetchReplay();
  }, [id]);

  useEffect(() => {
    if (!replay) return;
    if (isAdmin || hasMembership || replay.is_free || (id && getUnlockedIds().has(id))) {
      setUnlocked(true);
    } else {
      setShowDialog(true);
    }
  }, [isAdmin, id, replay, hasMembership]);

  const handleUnlock = (key: string): boolean => {
    if (!replay) return false;
    if (key === replay.access_key) {
      setUnlocked(true);
      saveUnlockedId(replay.id);
      return true;
    }
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!replay) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Replay tidak ditemukan.</p>
        <Button variant="outline" onClick={() => navigate("/")}>Kembali</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md gradient-primary flex items-center justify-center">
              <Play className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground text-sm">
              Hub <span className="text-gradient">Replay</span>
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-5xl">
        {unlocked ? (
          <div className="animate-fade-in">
            <YouTubePlayer url={replay.youtube_url} />
            <div className="mt-6">
              <h1 className="text-2xl font-display font-bold text-foreground mb-3">
                {replay.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  {replay.type}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(replay.show_time), "d MMMM yyyy, HH:mm", { locale: idLocale })}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Play className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-2">
              Masukkan Kunci Akses
            </h2>
            <p className="text-muted-foreground mb-4">
              Show ini memerlukan kunci akses untuk ditonton.
            </p>
            <Button
              onClick={() => setShowDialog(true)}
              className="gradient-primary text-primary-foreground glow-primary"
            >
              Masukkan Kunci
            </Button>
          </div>
        )}
      </main>

      <AccessKeyDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        onUnlock={handleUnlock}
        title={replay.title}
      />
    </div>
  );
};

export default Watch;
