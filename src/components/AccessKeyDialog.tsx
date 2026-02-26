import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Key } from "lucide-react";
import { toast } from "sonner";

interface AccessKeyDialogProps {
  open: boolean;
  onClose: () => void;
  onUnlock: (key: string) => boolean;
  title: string;
  isMasterKey?: boolean;
}

const AccessKeyDialog = ({ open, onClose, onUnlock, title, isMasterKey }: AccessKeyDialogProps) => {
  const [key, setKey] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onUnlock(key);
    if (success) {
      toast.success(isMasterKey ? "Master key berhasil! Semua show terbuka." : "Kunci akses berhasil!");
      setKey("");
      onClose();
    } else {
      toast.error("Kunci akses salah!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="glass-card border-border sm:max-w-md" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2 text-foreground">
            <Lock className="w-5 h-5 text-primary" />
            {isMasterKey ? "Master Key" : "Kunci Akses"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isMasterKey
              ? "Masukkan master key untuk membuka semua show sekaligus."
              : `Masukkan kunci akses untuk "${title}"`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder={isMasterKey ? "Master key..." : "Kunci akses..."}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="pl-10 bg-secondary border-border"
              required
            />
          </div>
          <Button type="submit" className="w-full gradient-primary text-primary-foreground glow-primary">
            Buka Kunci
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AccessKeyDialog;
