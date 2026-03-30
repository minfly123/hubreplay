import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { Replay } from "@/hooks/useReplays";

interface AdminReplayFormProps {
  editReplay?: Replay | null;
  onDone: () => void;
}

const AdminReplayForm = ({ editReplay, onDone }: AdminReplayFormProps) => {
  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [type, setType] = useState("Theater");
  const [showTime, setShowTime] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editReplay) {
      setTitle(editReplay.title);
      setYoutubeUrl(editReplay.youtube_url);
      setType(editReplay.type);
      setShowTime(new Date(editReplay.show_time).toISOString().slice(0, 10));
      setIsFree((editReplay as any).is_free ?? false);
    }
  }, [editReplay]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title: title.trim(),
      youtube_url: youtubeUrl.trim(),
      type: type.trim(),
      show_time: showTime + "T00:00:00Z",
      is_free: isFree,
    };

    if (editReplay) {
      const { error } = await supabase
        .from("replays")
        .update(payload)
        .eq("id", editReplay.id);
      if (error) toast.error(error.message);
      else toast.success("Replay berhasil diperbarui!");
    } else {
      const { error } = await supabase.from("replays").insert(payload);
      if (error) toast.error(error.message);
      else toast.success("Replay berhasil ditambahkan!");
    }

    setLoading(false);
    onDone();
    setTitle("");
    setYoutubeUrl("");
    setType("Theater");
    setShowTime("");
    setIsFree(false);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
      <h3 className="font-display font-semibold text-foreground text-lg">
        {editReplay ? "Edit Replay" : "Tambah Replay Baru"}
      </h3>
      <Input
        placeholder="Judul Replay"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="bg-secondary border-border"
        required
      />
      <Input
        placeholder="URL YouTube"
        value={youtubeUrl}
        onChange={(e) => setYoutubeUrl(e.target.value)}
        className="bg-secondary border-border"
        required
      />
      <Input
        placeholder="Type (contoh: Theater, School, Special)"
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="bg-secondary border-border"
        required
      />
      <Input
        type="date"
        value={showTime}
        onChange={(e) => setShowTime(e.target.value)}
        className="bg-secondary border-border"
        required
      />

      <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
        <Switch id="is-free" checked={isFree} onCheckedChange={setIsFree} />
        <Label htmlFor="is-free" className="text-foreground font-medium cursor-pointer">
          {isFree ? "Show Gratis (Bebas Akses)" : "Show Berbayar (Perlu URL Kunci)"}
        </Label>
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          className="gradient-primary text-primary-foreground glow-primary"
          disabled={loading}
        >
          {loading ? "Menyimpan..." : editReplay ? "Perbarui" : "Tambah"}
        </Button>
        <Button type="button" variant="outline" onClick={onDone}>
          Batal
        </Button>
      </div>
    </form>
  );
};

export default AdminReplayForm;
