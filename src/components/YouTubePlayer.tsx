import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, Maximize, Minimize, Volume2, VolumeX, Settings, FastForward, Undo2, Redo2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface YouTubePlayerProps {
  url: string;
}

const getYoutubeId = (url: string): string => {
  const match = url.match(/(?:live\/|v=|youtu\.be\/)([^?&]+)/);
  return match?.[1] ?? "";
};

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const QUALITIES = [
  { label: "8K", value: "highres" },
  { label: "4K", value: "hd2160" },
  { label: "1440p", value: "hd1440" },
  { label: "1080p", value: "hd1080" },
  { label: "720p", value: "hd720" },
  { label: "480p", value: "large" },
  { label: "360p", value: "medium" },
  { label: "240p", value: "small" },
  { label: "144p", value: "tiny" },
  { label: "Auto", value: "default" },
];

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const YouTubePlayer = ({ url }: YouTubePlayerProps) => {
  const videoId = getYoutubeId(url);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [quality, setQuality] = useState("default");
  const [availableQualities, setAvailableQualities] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [ready, setReady] = useState(false);
  const hideTimeoutRef = useRef<number | null>(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const seekValueRef = useRef<number>(0);

  // Long-press 2x speed
  const [longPressActive, setLongPressActive] = useState(false);
  const longPressTimer = useRef<number | null>(null);
  const originalSpeed = useRef(1);

  // Double-tap skip
  const [skipIndicator, setSkipIndicator] = useState<{ side: "left" | "right"; key: number } | null>(null);
  const tapTimer = useRef<number | null>(null);
  const tapCount = useRef(0);
  const tapSide = useRef<"left" | "right">("right");

  const loadYTAPI = useCallback(() => {
    if (window.YT && window.YT.Player) return Promise.resolve();
    return new Promise<void>((resolve) => {
      if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const check = setInterval(() => {
          if (window.YT && window.YT.Player) { clearInterval(check); resolve(); }
        }, 100);
        return;
      }
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      window.onYouTubeIframeAPIReady = () => resolve();
      document.head.appendChild(tag);
    });
  }, []);

  useEffect(() => {
    if (!videoId) return;

    loadYTAPI().then(() => {
      const playerDiv = document.createElement("div");
      playerDiv.id = `yt-player-${videoId}`;
      const wrapper = containerRef.current?.querySelector(".yt-wrapper");
      if (wrapper) {
        wrapper.innerHTML = "";
        wrapper.appendChild(playerDiv);
      }

      playerRef.current = new window.YT.Player(playerDiv.id, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          fs: 0,
          playsinline: 1,
          autohide: 1,
          cc_load_policy: 0,
          cc_lang_pref: 'id',
          origin: window.location.origin,
        },
        events: {
          onReady: (e: any) => {
            setDuration(e.target.getDuration());
            setReady(true);
            // Get available qualities
            const quals = e.target.getAvailableQualityLevels?.() || [];
            setAvailableQualities(quals);
          },
          onStateChange: (e: any) => {
            setPlaying(e.data === window.YT.PlayerState.PLAYING);
            if (e.data === window.YT.PlayerState.PLAYING) {
              setDuration(playerRef.current.getDuration());
              const quals = playerRef.current.getAvailableQualityLevels?.() || [];
              if (quals.length) setAvailableQualities(quals);
            }
          },
          onPlaybackQualityChange: (e: any) => {
            setQuality(e.data);
          },
        },
      });
    });

    return () => {
      if (playerRef.current?.destroy) playerRef.current.destroy();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [videoId, loadYTAPI]);

  // Time tracking - pause updates while seeking
  useEffect(() => {
    if (playing && !isSeeking) {
      intervalRef.current = window.setInterval(() => {
        if (playerRef.current?.getCurrentTime) {
          setCurrentTime(playerRef.current.getCurrentTime());
        }
      }, 250);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, isSeeking]);

  // Auto-hide controls after 5 seconds
  const startHideTimer = useCallback(() => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = window.setTimeout(() => {
      if (playing) setShowControls(false);
    }, 5000);
  }, [playing]);

  const revealControls = useCallback(() => {
    setShowControls(true);
    startHideTimer();
  }, [startHideTimer]);

  useEffect(() => {
    if (playing) {
      startHideTimer();
    } else {
      setShowControls(true);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    }
  }, [playing, startHideTimer]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (playing) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  };

  // Seeking: stop time updates, track locally, commit on release
  const handleSeekStart = () => {
    setIsSeeking(true);
    seekValueRef.current = currentTime;
  };

  const handleSeekChange = (val: number[]) => {
    seekValueRef.current = val[0];
    setCurrentTime(val[0]);
  };

  const handleSeekCommit = (val: number[]) => {
    if (!playerRef.current) return;
    const seekTo = val[0];
    playerRef.current.seekTo(seekTo, true);
    setCurrentTime(seekTo);
    setIsSeeking(false);
  };

  const changeVolume = (val: number[]) => {
    if (!playerRef.current) return;
    setVolume(val[0]);
    playerRef.current.setVolume(val[0]);
    if (val[0] === 0) setMuted(true);
    else setMuted(false);
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (muted) {
      playerRef.current.unMute();
      playerRef.current.setVolume(volume || 50);
      setMuted(false);
    } else {
      playerRef.current.mute();
      setMuted(true);
    }
  };

  const changeSpeed = (s: number) => {
    if (!playerRef.current) return;
    playerRef.current.setPlaybackRate(s);
    setSpeed(s);
  };

  const changeQuality = (q: string) => {
    if (!playerRef.current) return;
    playerRef.current.setPlaybackQuality(q);
    setQuality(q);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
      try { (screen.orientation as any)?.lock?.("landscape"); } catch {}
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
      try { screen.orientation?.unlock?.(); } catch {}
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return h > 0
      ? `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
      : `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // Skip 10 seconds
  const skip = (seconds: number) => {
    if (!playerRef.current) return;
    const cur = playerRef.current.getCurrentTime();
    const target = Math.max(0, Math.min(cur + seconds, duration));
    playerRef.current.seekTo(target, true);
    setCurrentTime(target);
  };

  // Double-tap detection for skip, single tap for controls toggle
  const handleOverlayClick = (e: React.MouseEvent | React.TouchEvent) => {
    if ((e.target as HTMLElement).closest(".player-controls")) return;
    if ((e.target as HTMLElement).closest(".center-play-btn")) return;
    if (longPressActive) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = "touches" in e ? (e as React.TouchEvent).changedTouches[0].clientX : (e as React.MouseEvent).clientX;
    const side: "left" | "right" = clientX - rect.left < rect.width / 2 ? "left" : "right";

    tapCount.current++;
    tapSide.current = side;

    if (tapCount.current === 1) {
      tapTimer.current = window.setTimeout(() => {
        // Single tap: toggle controls
        if (!showControls) {
          revealControls();
        } else {
          setShowControls(false);
        }
        tapCount.current = 0;
      }, 250);
    } else if (tapCount.current === 2) {
      // Double tap: skip
      if (tapTimer.current) clearTimeout(tapTimer.current);
      tapCount.current = 0;
      const skipAmount = side === "right" ? 10 : -10;
      skip(skipAmount);
      setSkipIndicator({ side, key: Date.now() });
      revealControls();
    }
  };

  // Clear skip indicator after animation
  useEffect(() => {
    if (!skipIndicator) return;
    const t = setTimeout(() => setSkipIndicator(null), 700);
    return () => clearTimeout(t);
  }, [skipIndicator]);

  // Long press handlers for 2x speed
  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest(".player-controls")) return;
    if ((e.target as HTMLElement).closest(".center-play-btn")) return;

    longPressTimer.current = window.setTimeout(() => {
      if (!playerRef.current) return;
      originalSpeed.current = speed;
      playerRef.current.setPlaybackRate(2);
      setSpeed(2);
      setLongPressActive(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (longPressActive) {
      playerRef.current?.setPlaybackRate(originalSpeed.current);
      setSpeed(originalSpeed.current);
      setLongPressActive(false);
    }
  };

  // Mouse long press for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".player-controls")) return;
    if ((e.target as HTMLElement).closest(".center-play-btn")) return;

    longPressTimer.current = window.setTimeout(() => {
      if (!playerRef.current) return;
      originalSpeed.current = speed;
      playerRef.current.setPlaybackRate(2);
      setSpeed(2);
      setLongPressActive(true);
    }, 500);
  };

  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (longPressActive) {
      playerRef.current?.setPlaybackRate(originalSpeed.current);
      setSpeed(originalSpeed.current);
      setLongPressActive(false);
    }
  };

  // Get quality label
  const getQualityLabel = (q: string) => {
    return QUALITIES.find(x => x.value === q)?.label || "Auto";
  };

  if (!videoId) return <div className="text-muted-foreground p-4">Invalid URL</div>;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-lg overflow-hidden bg-black select-none"
      onMouseMove={revealControls}
      onMouseLeave={() => playing && setShowControls(false)}
      onClick={handleOverlayClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* YouTube iframe wrapper */}
      <div className="yt-wrapper absolute inset-0 w-full h-full pointer-events-none" />

      {/* Clickable overlay */}
      <div className="absolute inset-0 z-10" />

      {/* Long press 2x indicator */}
      {longPressActive && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-black/70 backdrop-blur-sm rounded-full px-4 py-1.5 flex items-center gap-2">
          <FastForward className="w-4 h-4 text-white" />
          <span className="text-white text-sm font-medium">2x Speed</span>
        </div>
      )}

      {/* Double-tap skip indicator */}
      {skipIndicator && (
        <div
          key={skipIndicator.key}
          className={`absolute top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-1 animate-fade-in ${
            skipIndicator.side === "right" ? "right-12" : "left-12"
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
            {skipIndicator.side === "right" ? (
              <Redo2 className="w-6 h-6 text-white" />
            ) : (
              <Undo2 className="w-6 h-6 text-white" />
            )}
          </div>
          <span className="text-white text-xs font-medium">10 detik</span>
        </div>
      )}

      {/* Center play/pause button */}
      {ready && showControls && (
        <div className="center-play-btn absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
              revealControls();
            }}
            className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm hover:bg-black/70 transition-colors pointer-events-auto"
          >
            {playing ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" />
            )}
          </button>
        </div>
      )}

      {ready && !playing && !showControls && (
        <div className="center-play-btn absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <button
            onClick={(e) => {
              e.stopPropagation();
              revealControls();
            }}
            className="w-16 h-16 rounded-full bg-primary/80 flex items-center justify-center backdrop-blur-sm pointer-events-auto"
          >
            <Play className="w-8 h-8 text-primary-foreground ml-1" />
          </button>
        </div>
      )}

      {/* Bottom controls */}
      <div
        className={`player-controls absolute bottom-0 left-0 right-0 z-30 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.85))" }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div className="px-3 pt-2">
          <Slider
            min={0}
            max={duration || 1}
            step={0.5}
            value={[currentTime]}
            onPointerDown={handleSeekStart}
            onValueChange={handleSeekChange}
            onValueCommit={handleSeekCommit}
            className="w-full [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:border-primary [&_.bg-primary]:bg-primary"
          />
        </div>

        <div className="flex items-center justify-between px-3 py-2 gap-2">
          <div className="flex items-center gap-2">
            <button onClick={togglePlay} className="text-white hover:text-primary transition-colors">
              {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button onClick={toggleMute} className="text-white hover:text-primary transition-colors">
              {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <div className="w-20 hidden sm:block">
              <Slider
                min={0} max={100} step={1}
                value={[muted ? 0 : volume]}
                onValueChange={changeVolume}
                className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
              />
            </div>
            <span className="text-white/80 text-xs font-mono ml-1">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-white hover:text-primary transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="end" className="min-w-[180px]">
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Kecepatan ({speed}x)</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {SPEEDS.map((s) => (
                      <DropdownMenuItem
                        key={s}
                        onClick={() => changeSpeed(s)}
                        className={speed === s ? "bg-accent" : ""}
                      >
                        {s}x
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Kualitas ({getQualityLabel(quality)})</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {QUALITIES.filter(q => q.value === "default" || availableQualities.includes(q.value)).map((q) => (
                      <DropdownMenuItem
                        key={q.value}
                        onClick={() => changeQuality(q.value)}
                        className={quality === q.value ? "bg-accent" : ""}
                      >
                        {q.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>

            <button onClick={toggleFullscreen} className="text-white hover:text-primary transition-colors">
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubePlayer;
