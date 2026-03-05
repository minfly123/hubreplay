import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Home from "./Home";
import SplashScreen, { shouldShowSplash } from "@/components/SplashScreen";
import LoadingSpinner from "@/components/LoadingSpinner";

const Index = () => {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(() => shouldShowSplash());

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
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
