import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
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
import Lottery from "./pages/Lottery";
import NotFound from "./pages/NotFound";
import Watermark from "@/components/Watermark";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
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
            <Route path="/lottery" element={<Lottery />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Watermark />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
