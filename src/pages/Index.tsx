import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Home from "./Home";
import SplashScreen from "@/components/SplashScreen";
import { Play } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center animate-spin" style={{ animationDuration: "1.2s" }}>
          <Play className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      <Home />
    </>
  );
};

export default Index;
