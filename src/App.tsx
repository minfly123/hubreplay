import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useTimeValidation } from "@/hooks/useTimeValidation";
import TimeBlockScreen from "@/components/TimeBlockScreen";
import LoadingSpinner from "@/components/LoadingSpinner";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Watch from "./pages/Watch";
import Group from "./pages/Group";
import GroupInvite from "./pages/GroupInvite";
import People from "./pages/People";
import MembershipAdmin from "./pages/MembershipAdmin";
import MembershipActivate from "./pages/MembershipActivate";
import RoleAdmin from "./pages/RoleAdmin";
import RoleActivate from "./pages/RoleActivate";
import ReplayInfo from "./pages/ReplayInfo";
import ReplayUnlock from "./pages/ReplayUnlock";
import Gift from "./pages/Gift";
import GiftClaim from "./pages/GiftClaim";
import Profile from "./pages/Profile";
import AiAssistant from "./pages/AiAssistant";
import Schedule from "./pages/Schedule";
import About from "./pages/About";
import LiveMembers from "./pages/LiveMembers";
import LiveStream from "./pages/LiveStream";
import RadioPage from "./pages/RadioPage";
import NextBirthday from "./pages/NextBirthday";
import NotFound from "./pages/NotFound";
import Watermark from "@/components/Watermark";

const queryClient = new QueryClient();

const AppContent = () => {
  const { timeValid, checking } = useTimeValidation();

  if (checking) return <LoadingSpinner />;
  if (!timeValid) return <TimeBlockScreen />;

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/watch/:id" element={<Watch />} />
        <Route path="/group" element={<Group />} />
        <Route path="/group/invite/:token" element={<GroupInvite />} />
        <Route path="/people" element={<People />} />
        <Route path="/membership/admin" element={<MembershipAdmin />} />
        <Route path="/membership/:token" element={<MembershipActivate />} />
        <Route path="/role/admin" element={<RoleAdmin />} />
        <Route path="/role/:token" element={<RoleActivate />} />
        <Route path="/replay-info" element={<ReplayInfo />} />
        <Route path="/unlock/:token" element={<ReplayUnlock />} />
        <Route path="/gift/admin" element={<Gift />} />
        <Route path="/gift/:token" element={<GiftClaim />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/ai" element={<AiAssistant />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/about" element={<About />} />
        <Route path="/live" element={<LiveMembers />} />
        <Route path="/live/:type/:urlKey" element={<LiveStream />} />
        <Route path="/radio" element={<RadioPage />} />
        <Route path="/birthday" element={<NextBirthday />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Watermark />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
