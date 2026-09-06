import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import LiveMembers from "./LiveMembers";
import SplashScreen, { shouldShowSplash } from "@/components/SplashScreen";
import LoadingSpinner from "@/components/LoadingSpinner";

const Index = () => {
  const { loading } = useAuth();
  const [showSplash, setShowSplash] = useState(() => shouldShowSplash());

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      <LiveMembers />
    </>
  );
};

export default Index;
