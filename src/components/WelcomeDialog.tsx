import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Crown, MessageCircle, ShieldCheck } from "lucide-react";

interface WelcomeDialogProps {
  open: boolean;
  onClose: () => void;
}

const WELCOME_SHOWN_KEY = "hub_replay_welcome_shown";

export const hasSeenWelcome = () => localStorage.getItem(WELCOME_SHOWN_KEY) === "true";
export const markWelcomeSeen = () => localStorage.setItem(WELCOME_SHOWN_KEY, "true");

const WelcomeDialog = ({ open, onClose }: WelcomeDialogProps) => {
  const handleClose = () => {
    markWelcomeSeen();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-card border-border sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2 text-foreground">
            <ShieldCheck className="w-6 h-6 text-primary" />
            Selamat Datang di Arcanove48!
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Arsip Theater Online JKT48 — berikut panduan singkat untuk kamu.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="flex gap-3 items-start">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm">URL Kunci (Baru!)</h4>
              <p className="text-muted-foreground text-sm">
                Setiap show berbayar dibuka menggunakan <strong>URL kunci</strong> sekali pakai. Cukup buka linknya, dan replay terbuka permanen di akunmu.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Crown className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm">Membership</h4>
              <p className="text-muted-foreground text-sm">
                Dengan membership, <strong>semua show</strong> terbuka otomatis selama masa aktif. Tersedia paket 1 minggu, 1 bulan, atau permanen.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <MessageCircle className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm">Beli URL Kunci / Membership</h4>
              <p className="text-muted-foreground text-sm">
                Hubungi admin melalui WhatsApp untuk membeli URL kunci atau membership:
              </p>
              <a
                href="https://wa.me/62895351456586"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm font-medium mt-1 inline-block"
              >
                +62 895-3514-56586
              </a>
            </div>
          </div>
        </div>

        <Button
          onClick={handleClose}
          className="w-full mt-4 gradient-primary text-primary-foreground glow-primary"
        >
          Mengerti, Lanjutkan!
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeDialog;
