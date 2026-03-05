import { useState, useEffect } from "react";
import { Play } from "lucide-react";

const TOTAL_DURATION = 3200; // ~3.2s total

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [phase, setPhase] = useState<"rotate" | "text" | "fadeout">("rotate");
  const [rotation, setRotation] = useState(0);

  // Step rotation: 0 → 90 → 180 → 270 → 360, with 1s pause at each side
  useEffect(() => {
    const steps = [
      { delay: 300, rot: 90 },
      { delay: 700, rot: 180 },
      { delay: 700, rot: 270 },
      { delay: 700, rot: 360 },
    ];
    const timers: number[] = [];
    let cumulative = 0;

    steps.forEach(({ delay, rot }) => {
      cumulative += delay;
      timers.push(window.setTimeout(() => setRotation(rot), cumulative));
    });

    // After rotation done, show text
    cumulative += 500;
    timers.push(window.setTimeout(() => setPhase("text"), cumulative));

    // Fade out
    cumulative += 900;
    timers.push(window.setTimeout(() => setPhase("fadeout"), cumulative));

    // Finish
    cumulative += 500;
    timers.push(window.setTimeout(() => onFinish(), cumulative));

    return () => timers.forEach(clearTimeout);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-background flex items-center justify-center transition-opacity duration-500 ${
        phase === "fadeout" ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Rotating square logo */}
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

        {/* Text reveal */}
        <div
          className="overflow-hidden"
          style={{
            width: phase === "rotate" ? "0px" : "160px",
            opacity: phase === "rotate" ? 0 : 1,
            transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease",
          }}
        >
          <span className="font-display font-bold text-2xl whitespace-nowrap">
            <span className="text-foreground">Hub</span>{" "}
            <span className="text-gradient">Replay</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
