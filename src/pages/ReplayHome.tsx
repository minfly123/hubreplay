import { useAuth } from "@/hooks/useAuth";
import Home from "./Home";
import LoadingSpinner from "@/components/LoadingSpinner";

const ReplayHome = () => {
  const { loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return <Home />;
};

export default ReplayHome;
