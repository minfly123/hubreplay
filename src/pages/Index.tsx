import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import LiveMembers from "./LiveMembers";
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
      <LiveMembers />
    </>
  );
};

export default Index;
