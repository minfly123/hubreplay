import { Play } from "lucide-react";

const LoadingSpinner = ({ fullScreen = true }: { fullScreen?: boolean }) => {
  const spinner = (
    <div
      className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center animate-spin"
      style={{ animationDuration: "1.2s" }}
    >
      <Play className="w-6 h-6 text-primary-foreground" />
    </div>
  );

  if (!fullScreen) return spinner;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;
