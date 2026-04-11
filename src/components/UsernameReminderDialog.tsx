import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AtSign, Check } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Props {
  open: boolean;
  onSaved: () => void;
}

const UsernameReminderDialog = ({ open, onSaved }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    const trimmed = username.trim();
    if (!trimmed || trimmed.length < 3) {
      toast.error("Username minimal 3 karakter");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      toast.error("Username hanya boleh huruf, angka, dan underscore");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ username: trimmed })
      .eq("user_id", user.id);
    if (error) {
      if (error.code === "23505") {
        toast.error("Username sudah dipakai, pilih yang lain");
      } else {
        toast.error("Gagal menyimpan username");
      }
    } else {
      toast.success("Username berhasil disimpan!");
      onSaved();
    }
    setSaving(false);
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-sm" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AtSign className="w-5 h-5 text-primary" />
            Username Diperlukan
          </DialogTitle>
          <DialogDescription>
            Kamu harus mengatur username terlebih dahulu sebelum menonton replay. Ini diperlukan untuk fitur komentar dan identitas di platform.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Masukkan username (min. 3 karakter)"
            maxLength={20}
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              <Check className="w-4 h-4 mr-1" />
              {saving ? "Menyimpan..." : "Simpan Username"}
            </Button>
          </div>
          <button
            onClick={() => navigate("/profile")}
            className="w-full text-xs text-muted-foreground underline hover:text-foreground transition-colors"
          >
            Atau atur di halaman Profil →
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UsernameReminderDialog;
