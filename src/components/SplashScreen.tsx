import { useState, useEffect } from "react";
import { Play } from "lucide-react";

const TOTAL_DURATION = 5000; // 5s total

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [phase, setPhase] = useState<"rotate" | "text" | "glow" | "fadeout">("rotate");
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const timers: number[] = [];
    let t = 0;

    // 4 rotation steps with ~1s pause each
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
    timers.push(window.setTimeout(() => onFinish(), t));

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
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(180deg, transparent 0%, hsl(0 0% 100% / 0.4) 50%, transparent 100%)",
                  backgroundSize: "100% 200%",
                  animation: "glowSweep 0.8s ease-out forwards",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mixBlendMode: "overlay",
                }}
              />
            )}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes glowSweep {
          0% { opacity: 0; transform: translateY(-100%); }
          30% { opacity: 1; }
          100% { opacity: 0; transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
