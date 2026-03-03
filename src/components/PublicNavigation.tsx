import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Store, Users, LogIn } from "lucide-react";

const PublicNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center glow-primary">
            <Play className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-display font-bold text-foreground">
            Hub <span className="text-gradient">Replay</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={isActive("/auth") ? "default" : "outline"}
            onClick={() => navigate("/auth")}
            className={isActive("/auth") ? "gradient-primary text-primary-foreground" : ""}
          >
            <LogIn className="w-4 h-4 mr-1.5" />
            Login
          </Button>
        </div>
      </div>
    </header>
  );
};

export default PublicNavigation;
