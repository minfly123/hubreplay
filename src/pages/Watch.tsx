import { useEffect, useState, useRef, useCallback } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMembership } from "@/hooks/useMembership";
import YouTubePlayer, { YouTubePlayerHandle } from "@/components/YouTubePlayer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Tag, Play } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import type { Replay } from "@/hooks/useReplays";
import {
  saveProgress,
  getProgress,
  clearProgress,
  cleanupOldEntries,
  formatSecondsToTime,
} from "@/hooks/useWatchProgress";
import ReplayComments from "@/components/ReplayComments";
import ReplayRating from "@/components/ReplayRating";
import ReplayViewCount from "@/components/ReplayViewCount";
import UsernameReminderDialog from "@/components/UsernameReminderDialog";

const getYoutubeId = (url: string): string => {
  const match = url.match(/(?:live\/|v=|youtu\.be\/)([^?&]+)/);
  return match?.[1] ?? "";
};

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
  const playerRef = useRef<YouTubePlayerHandle>(null);

  // Username check
  const [hasUsername, setHasUsername] = useState<boolean | null>(null);

  // Auto-resume
  const [resumePrompt, setResumePrompt] = useState<number | null>(null);
  const lastSaveRef = useRef(0);


  // Check username
  useEffect(() => {
    if (!user) return;
    const check = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", user.id)
        .maybeSingle();
      setHasUsername(!!data?.username);
    };
    check();
  }, [user]);

  // Cleanup old entries on mount
  useEffect(() => {
    cleanupOldEntries();
  }, []);

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
      // Free shows
      if (replay.is_free) {
        setUnlocked(true);
        setChecking(false);
        return;
      }

      // Admin/Super Admin
      if (isAdmin) {
        setUnlocked(true);
        setChecking(false);
        return;
      }

      // Membership holders
      if (hasMembership) {
        setUnlocked(true);
        setChecking(false);
        return;
      }

      // Check token unlock
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

        // Check playlist access
        const { data: userPlaylists } = await supabase
          .from("user_playlists")
          .select("playlist_id")
          .eq("user_id", user.id);

        if (userPlaylists && userPlaylists.length > 0) {
          const playlistIds = userPlaylists.map((up) => up.playlist_id);
          const { data: playlistItem } = await supabase
            .from("playlist_items")
            .select("id")
            .eq("replay_id", replay.id)
            .in("playlist_id", playlistIds)
            .limit(1)
            .maybeSingle();

          if (playlistItem) {
            setUnlocked(true);
            setChecking(false);
            return;
          }
        }
      }

      // Not unlocked - redirect without popup for authorized users
      setUnlocked(false);
      setChecking(false);
      toast.error("Akses ditolak! Kamu perlu membukanya dengan URL kunci dari admin.");
      navigate("/", { replace: true });
    };

    checkAccess();
  }, [authLoading, loading, replay, isAdmin, hasMembership, user, id, navigate]);

  // Auto-resume: check saved progress when replay loads
  useEffect(() => {
    if (!replay) return;
    const videoId = getYoutubeId(replay.youtube_url);
    const saved = getProgress(videoId);
    if (saved > 5) {
      setResumePrompt(saved);
    }
  }, [replay]);

  // Save progress every ~1 second via onTimeUpdate
  const handleTimeUpdate = useCallback((time: number) => {
    if (!replay) return;
    const now = Date.now();
    if (now - lastSaveRef.current >= 1000) {
      lastSaveRef.current = now;
      const videoId = getYoutubeId(replay.youtube_url);
      saveProgress(videoId, time);
    }
  }, [replay]);


  // Handle video ended
  const handleEnded = useCallback(() => {
    if (!replay) return;
    const videoId = getYoutubeId(replay.youtube_url);
    clearProgress(videoId);
  }, [replay]);


  const handleResume = () => {
    if (resumePrompt && playerRef.current) {
      playerRef.current.seekTo(resumePrompt);
    }
    setResumePrompt(null);
  };

  const handleStartFresh = () => {
    if (replay) {
      clearProgress(getYoutubeId(replay.youtube_url));
    }
    setResumePrompt(null);
  };


  if (loading || authLoading || checking) {
    return <LoadingSpinner />;
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
    <>
      {hasUsername === false && (
        <UsernameReminderDialog
          open={true}
          onSaved={() => setHasUsername(true)}
        />
      )}
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
        <div className="animate-fade-in relative">
          <YouTubePlayer
            ref={playerRef}
            url={replay.youtube_url}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
          />

          {/* Resume prompt overlay */}
          {resumePrompt !== null && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg">
              <div className="bg-card border border-border rounded-xl p-6 shadow-2xl max-w-sm mx-4 text-center space-y-4">
                <p className="text-foreground font-medium">
                  Lanjutkan dari {formatSecondsToTime(resumePrompt)}?
                </p>
                <div className="flex gap-3 justify-center">
                  <Button size="sm" onClick={handleResume}>
                    <Play className="w-4 h-4 mr-1" />
                    Lanjutkan
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleStartFresh}>
                    Mulai Ulang
                  </Button>
                </div>
              </div>
            </div>
          )}


          <div className="mt-6">
            <h1 className="text-2xl font-display font-bold text-foreground mb-3">
              {replay.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                {replay.type}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(replay.show_time), "d MMMM yyyy", { locale: idLocale })}
              </span>
            </div>

            <ReplayRating replayId={replay.id} />
            <ReplayViewCount replayId={replay.id} />
          </div>

          <ReplayComments replayId={replay.id} />
        </div>
      </main>
    </div>
    </>
  );
};

export default Watch;
