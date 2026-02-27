import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMembership } from "@/hooks/useMembership";
import YouTubePlayer from "@/components/YouTubePlayer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Tag, Play } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import type { Replay } from "@/hooks/useReplays";

const Watch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { isActive: hasMembership } = useMembership();
  const [replay, setReplay] = useState<Replay | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Wake Lock
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
      if (document.visibilityState === "visible") requestWakeLock();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      wakeLockRef.current?.release().catch(() => {});
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Fetch replay
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

  // Check access
  useEffect(() => {
    if (authLoading || loading || !replay) return;

    const checkAccess = async () => {
      // Free shows: always unlocked
      if (replay.is_free) {
        setUnlocked(true);
        setChecking(false);
        return;
      }

      // Admin/Super Admin: always unlocked
      if (isAdmin) {
        setUnlocked(true);
        setChecking(false);
        return;
      }

      // Membership holders: always unlocked
      if (hasMembership) {
        setUnlocked(true);
        setChecking(false);
        return;
      }

      // Check if user has unlocked this replay via token
      if (user) {
        const { data } = await supabase
          .from("replay_unlocks")
          .select("id")
          .eq("replay_id", replay.id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (data) {
          setUnlocked(true);
          setChecking(false);
          return;
        }
      }

      // Not unlocked - show denial
      setUnlocked(false);
      setChecking(false);

      // Show alert and redirect
      window.alert("Akses ditolak!\n\nKamu perlu membukanya dengan URL kunci. Minta URL kunci dari admin untuk menonton replay ini.");
      navigate("/", { replace: true });
    };

    checkAccess();
  }, [authLoading, loading, replay, isAdmin, hasMembership, user, id, navigate]);

  if (loading || authLoading || checking) {
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

  if (!unlocked) return null;

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
                {format(new Date(replay.show_time), "d MMMM yyyy", { locale: idLocale })}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Watch;
