import { useState, useEffect } from "react";
import { Play } from "lucide-react";

const SPLASH_KEY = "hub_replay_last_visit";
const SPLASH_INTERVAL = 10 * 60 * 1000; // 10 minutes

export const shouldShowSplash = (): boolean => {
  const last = localStorage.getItem(SPLASH_KEY);
  if (!last) return true;
  return Date.now() - parseInt(last, 10) > SPLASH_INTERVAL;
};

export const markSplashShown = () => {
  localStorage.setItem(SPLASH_KEY, Date.now().toString());
};

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [phase, setPhase] = useState<"rotate" | "text" | "glow" | "fadeout">("rotate");
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const timers: number[] = [];
    let t = 0;

    const steps = [
      { delay: 400, rot: 90 },
      { delay: 1000, rot: 180 },
      { delay: 1000, rot: 270 },
      { delay: 1000, rot: 360 },
    ];

    steps.forEach(({ delay, rot }) => {
      t += delay;
      timers.push(window.setTimeout(() => setRotation(rot), t));
    });

    // Show text at ~3.4s
    t += 500;
    timers.push(window.setTimeout(() => setPhase("text"), t));

    // Glow sweep at ~4.2s
    t += 800;
    timers.push(window.setTimeout(() => setPhase("glow"), t));

    // Fade out at ~4.5s
    t += 600;
    timers.push(window.setTimeout(() => setPhase("fadeout"), t));

    // Finish at ~5s
    t += 500;
    timers.push(window.setTimeout(() => {
      markSplashShown();
      onFinish();
    }, t));

    return () => timers.forEach(clearTimeout);
  }, [onFinish]);

  const showText = phase !== "rotate";
  const showGlow = phase === "glow" || phase === "fadeout";

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-background flex items-center justify-center transition-opacity duration-500 ${
        phase === "fadeout" ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <Play
            className="w-6 h-6 text-primary-foreground"
            style={{
              transform: `rotate(-${rotation}deg)`,
              transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          />
        </div>

        <div
          className="overflow-hidden"
          style={{
            width: showText ? "160px" : "0px",
            opacity: showText ? 1 : 0,
            transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease",
          }}
        >
          <span className="font-display font-bold text-2xl whitespace-nowrap relative inline-block">
            <span className="text-foreground">Hub</span>{" "}
            <span className="text-gradient">Replay</span>
            {showGlow && (
              <span
                className="absolute inset-0 pointer-events-none overflow-hidden"
                aria-hidden="true"
              >
                <span
                  className="block w-full"
                  style={{
                    height: "200%",
                    background: "linear-gradient(180deg, transparent 0%, hsl(0 0% 100% / 0.6) 40%, hsl(0 0% 100% / 0.8) 50%, hsl(0 0% 100% / 0.6) 60%, transparent 100%)",
                    animation: "glowSweep 0.8s ease-out forwards",
                  }}
                />
              </span>
            )}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes glowSweep {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(50%); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
