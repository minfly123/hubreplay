import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Home from "./Home";
import LoadingSpinner from "@/components/LoadingSpinner";

const ReplayHome = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/auth" replace />;

  return <Home />;
};

export default ReplayHome;
