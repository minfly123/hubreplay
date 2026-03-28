import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, Play, Home, ListVideo, LogOut, Users, CreditCard, KeyRound, ShieldCheck, HelpCircle, Gift, UserCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface AppNavigationProps {
  onOpenWelcome?: () => void;
}

const AppNavigation = ({ onOpenWelcome }: AppNavigationProps) => {
  const { user, isAdmin, isSuperAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const go = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const goAdmin = (path: string, requireSuperAdmin = false) => {
    if (requireSuperAdmin && !isSuperAdmin) {
      toast.error("Akses ditolak! Hanya untuk Super Admin.");
      return;
    }
    go(path);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-card border-border">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-foreground">
                  <div className="w-7 h-7 rounded-md gradient-primary flex items-center justify-center">
                    <Play className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                  Hub <span className="text-gradient">Replay</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                <button
                  onClick={() => go("/")}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive("/") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
                >
                  <Home className="w-4 h-4" />
                  Home
                </button>
                <button
                  onClick={() => go("/group")}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive("/group") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
                >
                  <ListVideo className="w-4 h-4" />
                  Group
                </button>
                <button
                  onClick={() => go("/profile")}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive("/profile") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
                >
                  <UserCircle className="w-4 h-4" />
                  Profil
                </button>
                <button
                  onClick={() => go("/ai")}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive("/ai") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
                >
                  <Sparkles className="w-4 h-4" />
                  Hr-Ai
                </button>

                {isAdmin && (
                  <>
                    <div className="my-2 border-t border-border" />
                    <p className="px-3 text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Admin</p>
                    <button onClick={() => go("/people")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                      <Users className="w-4 h-4" />
                      Pengguna
                    </button>
                    <button onClick={() => go("/membership/admin")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                      <CreditCard className="w-4 h-4" />
                      Membership
                    </button>
                    <button onClick={() => go("/replay-info")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                      <KeyRound className="w-4 h-4" />
                      Info Replay
                    </button>
                    <button onClick={() => go("/gift/admin")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                      <Gift className="w-4 h-4" />
                      Gift
                    </button>
                    <button
                      onClick={() => goAdmin("/role/admin", true)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Aktivasi Role
                      {!isSuperAdmin && <span className="ml-auto text-xs text-destructive">🔒</span>}
                    </button>
                  </>
                )}

                <div className="my-2 border-t border-border" />
                {onOpenWelcome && (
                  <button
                    onClick={() => { onOpenWelcome(); setOpen(false); }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Bantuan
                  </button>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center glow-primary">
              <Play className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-display font-bold text-foreground">
              Hub <span className="text-gradient">Replay</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:block">
            {user?.email}
          </span>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AppNavigation;
