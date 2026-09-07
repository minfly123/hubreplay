import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppNavigation from "@/components/AppNavigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, CalendarDays, MapPin, Images } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface GalleryItem {
  id: string;
  title: string;
  type: string;
  event_date: string;
  location: string;
  image_url: string;
  created_at: string;
}

const BUCKET = "event-gallery";

const EventGallery = () => {
  const { user, isAdmin } = useAuth();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const signUrls = useCallback(async (rows: GalleryItem[]) => {
    const paths = rows.map((r) => r.image_url).filter((p) => p && !p.startsWith("http"));
    const map: Record<string, string> = {};
    rows.forEach((r) => {
      if (r.image_url?.startsWith("http")) map[r.image_url] = r.image_url;
    });
    if (paths.length) {
      const { data } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 60 * 60 * 6);
      data?.forEach((d) => {
        if (d.path && d.signedUrl) map[d.path] = d.signedUrl;
      });
    }
    setUrls(map);
  }, []);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("event_gallery")
      .select("*")
      .order("event_date", { ascending: false });
    if (error) {
      toast.error("Gagal memuat galeri event");
      setLoading(false);
      return;
    }
    const rows = (data || []) as GalleryItem[];
    setItems(rows);
    await signUrls(rows);
    setLoading(false);
  }, [signUrls]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("event-gallery-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "event_gallery" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  const resetForm = () => {
    setEditing(null);
    setTitle("");
    setType("");
    setEventDate("");
    setLocation("");
    setFile(null);
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (item: GalleryItem) => {
    setEditing(item);
    setTitle(item.title);
    setType(item.type);
    setEventDate(item.event_date);
    setLocation(item.location);
    setFile(null);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!title.trim() || !type.trim() || !eventDate || !location.trim()) {
      toast.error("Lengkapi semua kolom terlebih dahulu");
      return;
    }
    if (!editing && !file) {
      toast.error("Pilih foto dokumentasi");
      return;
    }
    setSaving(true);
    try {
      let imagePath = editing?.image_url ?? "";
      if (file) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (upErr) throw upErr;
        imagePath = path;
      }

      if (editing) {
        const { error } = await supabase
          .from("event_gallery")
          .update({
            title: title.trim(),
            type: type.trim(),
            event_date: eventDate,
            location: location.trim(),
            image_url: imagePath,
          })
          .eq("id", editing.id);
        if (error) throw error;
        toast.success("Dokumentasi diperbarui");
      } else {
        const { error } = await supabase.from("event_gallery").insert({
          title: title.trim(),
          type: type.trim(),
          event_date: eventDate,
          location: location.trim(),
          image_url: imagePath,
          created_by: user.id,
        });
        if (error) throw error;
        toast.success("Dokumentasi ditambahkan");
      }
      setOpen(false);
      resetForm();
      load();
    } catch (e: any) {
      toast.error(e?.message || "Gagal menyimpan dokumentasi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: GalleryItem) => {
    if (!confirm(`Hapus dokumentasi "${item.title}"?`)) return;
    const { error } = await supabase.from("event_gallery").delete().eq("id", item.id);
    if (error) {
      toast.error("Gagal menghapus dokumentasi");
      return;
    }
    if (item.image_url && !item.image_url.startsWith("http")) {
      await supabase.storage.from(BUCKET).remove([item.image_url]);
    }
    toast.success("Dokumentasi dihapus");
    load();
  };

  const fmtDate = (d: string) => {
    try {
      return format(new Date(`${d}T00:00:00Z`), "d MMMM yyyy", { locale: idLocale });
    } catch {
      return d;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation />
      <main className="container mx-auto px-4 py-8 space-y-6 max-w-5xl">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <Images className="w-6 h-6 text-primary" />
              Galeri Event
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Dokumentasi foto bersama seusai event komunitas Arcanove48.
            </p>
          </div>
          {isAdmin && (
            <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
              <DialogTrigger asChild>
                <Button onClick={openCreate} className="gradient-primary text-primary-foreground font-semibold shrink-0">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Tambah
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-md">
                <DialogHeader>
                  <DialogTitle>{editing ? "Edit Dokumentasi" : "Dokumentasi Baru"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Foto dokumentasi</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                    {editing && !file && (
                      <p className="text-xs text-muted-foreground">Biarkan kosong jika tidak ingin mengganti foto.</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Judul event</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Meet & Greet JKT48" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Type</Label>
                    <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="Theater / Off-air / Festival" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tanggal event</Label>
                    <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Lokasi</Label>
                    <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="fX Sudirman, Jakarta" />
                  </div>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full gradient-primary text-primary-foreground font-semibold"
                  >
                    {saving ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Tambahkan"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </header>

        {items.length === 0 ? (
          <div className="glass-card p-10 text-center text-muted-foreground">
            Belum ada dokumentasi event.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden bg-card border-border group">
                <div className="relative">
                  {urls[item.image_url] ? (
                    <img
                      src={urls[item.image_url]}
                      alt={`Dokumentasi ${item.title}`}
                      loading="lazy"
                      className="w-full h-auto object-contain bg-secondary"
                    />
                  ) : (
                    <div className="w-full aspect-video bg-secondary" />
                  )}
                  <Badge className="absolute top-3 left-3 gradient-primary text-primary-foreground border-0 shadow-lg">
                    {item.type}
                  </Badge>
                </div>
                <div className="p-4 space-y-2">
                  <h2 className="font-display font-semibold text-foreground leading-snug">{item.title}</h2>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {fmtDate(item.event_date)}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {item.location}
                  </p>
                  {isAdmin && (
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                        <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(item)}>
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Hapus
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default EventGallery;
