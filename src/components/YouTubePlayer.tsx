import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, Maximize, Minimize, Volume2, VolumeX, Settings } from "lucide-react";
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
const QUALITY_ORDER = ["highres", "hd2160", "hd1440", "hd1080", "hd720", "large", "medium", "small", "tiny"];
const QUALITIES: Record<string, string> = {
  highres: "4320p (8K)",
  hd2160: "2160p (4K)",
  hd1440: "1440p",
  hd1080: "1080p",
  hd720: "720p",
  large: "480p",
  medium: "360p",
  small: "240p",
  tiny: "144p",
  auto: "Auto",
};

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
  const [quality, setQuality] = useState("auto");
  const [availableQualities, setAvailableQualities] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [ready, setReady] = useState(false);
  const hideTimeoutRef = useRef<number | null>(null);

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
          origin: window.location.origin,
        },
        events: {
          onReady: (e: any) => {
            setDuration(e.target.getDuration());
            setReady(true);
            const q = e.target.getAvailableQualityLevels();
            setAvailableQualities(q.length ? q : ["auto"]);
          },
          onStateChange: (e: any) => {
            setPlaying(e.data === window.YT.PlayerState.PLAYING);
            if (e.data === window.YT.PlayerState.PLAYING) {
              setDuration(playerRef.current.getDuration());
            }
          },
        },
      });
    });

    return () => {
      if (playerRef.current?.destroy) playerRef.current.destroy();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [videoId, loadYTAPI]);

  // Time tracking
  useEffect(() => {
    if (playing) {
      intervalRef.current = window.setInterval(() => {
        if (playerRef.current?.getCurrentTime) {
          setCurrentTime(playerRef.current.getCurrentTime());
        }
      }, 250);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing]);

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

  // When playing state changes, manage timer
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

  const seek = (val: number[]) => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(val[0], true);
    setCurrentTime(val[0]);
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
    if (q === "auto") {
      playerRef.current.setPlaybackQualityRange?.("small", "hd1080");
    } else {
      playerRef.current.setPlaybackQuality(q);
    }
    setQuality(q);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
      // Force landscape orientation on mobile
      try {
        (screen.orientation as any)?.lock?.("landscape");
      } catch {}
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
      try {
        screen.orientation?.unlock?.();
      } catch {}
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

  // Click on video area: only show/hide controls, never toggle play
  const handleOverlayClick = (e: React.MouseEvent) => {
    // Don't do anything if clicking on controls area
    if ((e.target as HTMLElement).closest(".player-controls")) return;
    if ((e.target as HTMLElement).closest(".center-play-btn")) return;

    if (!showControls) {
      // Show controls
      revealControls();
    } else {
      // Hide controls
      setShowControls(false);
    }
  };

  // Sort qualities from best to worst
  const sortedQualities = availableQualities
    .filter((q) => q !== "auto" && QUALITIES[q])
    .sort((a, b) => QUALITY_ORDER.indexOf(a) - QUALITY_ORDER.indexOf(b));

  if (!videoId) return <div className="text-muted-foreground p-4">Invalid URL</div>;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-lg overflow-hidden bg-black select-none"
      onMouseMove={revealControls}
      onMouseLeave={() => playing && setShowControls(false)}
      onClick={handleOverlayClick}
    >
      {/* YouTube iframe wrapper */}
      <div className="yt-wrapper absolute inset-0 w-full h-full pointer-events-none" />

      {/* Clickable overlay to capture clicks away from YT */}
      <div className="absolute inset-0 z-10" />

      {/* Center play/pause button - visible when controls are shown */}
      {ready && showControls && (
        <div className="center-play-btn absolute inset-0 z-20 flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
              revealControls();
            }}
            className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm hover:bg-black/70 transition-colors"
          >
            {playing ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" />
            )}
          </button>
        </div>
      )}

      {/* Center play button when paused and controls hidden */}
      {ready && !playing && !showControls && (
        <div className="center-play-btn absolute inset-0 z-20 flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              revealControls();
            }}
            className="w-16 h-16 rounded-full bg-primary/80 flex items-center justify-center backdrop-blur-sm"
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
      >
        {/* Progress bar */}
        <div className="px-3 pt-2">
          <Slider
            min={0}
            max={duration || 1}
            step={0.5}
            value={[currentTime]}
            onValueChange={seek}
            className="w-full [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:border-primary [&_.bg-primary]:bg-primary"
          />
        </div>

        <div className="flex items-center justify-between px-3 py-2 gap-2">
          {/* Left controls */}
          <div className="flex items-center gap-2">
            <button onClick={togglePlay} className="text-white hover:text-primary transition-colors">
              {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            <button onClick={toggleMute} className="text-white hover:text-primary transition-colors">
              {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <div className="w-20 hidden sm:block">
              <Slider
                min={0}
                max={100}
                step={1}
                value={[muted ? 0 : volume]}
                onValueChange={changeVolume}
                className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
              />
            </div>

            <span className="text-white/80 text-xs font-mono ml-1">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right controls */}
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
                  <DropdownMenuSubTrigger>
                    Kualitas ({QUALITIES[quality] || quality})
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onClick={() => changeQuality("auto")}
                      className={quality === "auto" ? "bg-accent" : ""}
                    >
                      Auto
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {sortedQualities.map((q) => (
                      <DropdownMenuItem
                        key={q}
                        onClick={() => changeQuality(q)}
                        className={quality === q ? "bg-accent" : ""}
                      >
                        {QUALITIES[q]}
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
