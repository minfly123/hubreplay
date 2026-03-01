import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePlaylists, useUserPlaylists, Playlist } from "@/hooks/usePlaylists";
import { useReplays, Replay } from "@/hooks/useReplays";
import AppNavigation from "@/components/AppNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Pencil, Link2, Search, ListVideo, Calendar, Tag, ChevronRight, Play } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const Group = () => {
  const { isAdmin, isSuperAdmin } = useAuth();
  const { playlists, loading: playlistsLoading } = usePlaylists();
  const { userPlaylists, loading: userPlaylistsLoading } = useUserPlaylists();
  const { replays } = useReplays();
  const navigate = useNavigate();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editPlaylist, setEditPlaylist] = useState<Playlist | null>(null);
  const [formName, setFormName] = useState("");
  const [selectedReplays, setSelectedReplays] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [viewPlaylist, setViewPlaylist] = useState<Playlist | null>(null);
  const [playlistItems, setPlaylistItems] = useState<string[]>([]);
  const [playlistReplays, setPlaylistReplays] = useState<Replay[]>([]);

  // Load playlist items when viewing
  useEffect(() => {
    if (!viewPlaylist) return;
    const fetchItems = async () => {
      const { data } = await supabase
        .from("playlist_items")
        .select("replay_id")
        .eq("playlist_id", viewPlaylist.id);
      const ids = data?.map((d) => d.replay_id) || [];
      setPlaylistItems(ids);
      setPlaylistReplays(replays.filter((r) => ids.includes(r.id)));
    };
    fetchItems();
  }, [viewPlaylist, replays]);

  // Load items for edit
  useEffect(() => {
    if (!editPlaylist) return;
    setFormName(editPlaylist.name);
    const fetchItems = async () => {
      const { data } = await supabase
        .from("playlist_items")
        .select("replay_id")
        .eq("playlist_id", editPlaylist.id);
      setSelectedReplays(new Set(data?.map((d) => d.replay_id) || []));
    };
    fetchItems();
  }, [editPlaylist]);

  const filteredReplays = replays.filter((r) => {
    const q = searchQuery.toLowerCase();
    return r.title.toLowerCase().includes(q) || r.type.toLowerCase().includes(q);
  });

  const handleCreate = async () => {
    if (!formName.trim()) { toast.error("Nama playlist harus diisi"); return; }
    const { data, error } = await supabase.from("playlists").insert({ name: formName.trim(), created_by: (await supabase.auth.getUser()).data.user!.id }).select().single();
    if (error) { toast.error(error.message); return; }
    // Insert items
    if (selectedReplays.size > 0) {
      const items = Array.from(selectedReplays).map((rid) => ({ playlist_id: data.id, replay_id: rid }));
      await supabase.from("playlist_items").insert(items);
    }
    toast.success("Playlist berhasil dibuat!");
    resetForm();
  };

  const handleUpdate = async () => {
    if (!editPlaylist || !formName.trim()) return;
    await supabase.from("playlists").update({ name: formName.trim() }).eq("id", editPlaylist.id);
    // Sync items: delete old, insert new
    await supabase.from("playlist_items").delete().eq("playlist_id", editPlaylist.id);
    if (selectedReplays.size > 0) {
      const items = Array.from(selectedReplays).map((rid) => ({ playlist_id: editPlaylist.id, replay_id: rid }));
      await supabase.from("playlist_items").insert(items);
    }
    toast.success("Playlist berhasil diperbarui!");
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus playlist ini?")) return;
    const { error } = await supabase.from("playlists").delete().eq("id", id);
    if (error) toast.error(error.message);
    else toast.success("Playlist berhasil dihapus!");
  };

  const resetForm = () => {
    setShowCreateForm(false);
    setEditPlaylist(null);
    setFormName("");
    setSelectedReplays(new Set());
    setSearchQuery("");
  };

  const copyLink = (playlist: Playlist) => {
    const url = `${window.location.origin}/group/invite/${playlist.token}`;
    const text = `🎬 Playlist: ${playlist.name}\n🔗 ${url}`;
    navigator.clipboard.writeText(text);
    toast.success("Link playlist berhasil disalin!");
  };

  const toggleReplay = (id: string) => {
    setSelectedReplays((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const isFormOpen = showCreateForm || editPlaylist;

  // Member view: show user's playlists
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavigation />
        <main className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-display font-bold text-foreground mb-1">Group Playlist</h2>
          <p className="text-muted-foreground text-sm mb-6">Playlist yang sudah kamu tambahkan</p>

          {userPlaylistsLoading ? (
            <div className="flex justify-center py-20"><div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>
          ) : userPlaylists.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <ListVideo className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>Belum ada playlist.</p>
              <p className="text-sm mt-1">Minta link playlist dari admin untuk menambahkannya.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userPlaylists.map((up) => (
                <div
                  key={up.id}
                  onClick={() => setViewPlaylist(up.playlist || null)}
                  className="glass-card p-4 cursor-pointer hover:scale-[1.02] transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <ListVideo className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-foreground">{up.custom_name || up.playlist?.name}</h3>
                        <p className="text-xs text-muted-foreground">{format(new Date(up.added_at), "d MMM yyyy", { locale: idLocale })}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View playlist dialog for member */}
          <MemberPlaylistDialog
            playlist={viewPlaylist}
            replays={playlistReplays}
            onClose={() => setViewPlaylist(null)}
            onWatch={(r) => navigate(`/watch/${r.id}`)}
            userPlaylist={userPlaylists.find((up) => up.playlist_id === viewPlaylist?.id)}
          />
        </main>
      </div>
    );
  }

  // Admin view
  return (
    <div className="min-h-screen bg-background">
      <AppNavigation />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-1">Group Playlist</h2>
            <p className="text-muted-foreground text-sm">Kelola playlist untuk dijual atau dibagikan</p>
          </div>
          {!isFormOpen && (
            <Button onClick={() => setShowCreateForm(true)} className="gradient-primary text-primary-foreground glow-primary">
              <Plus className="w-4 h-4 mr-2" />
              Buat Playlist
            </Button>
          )}
        </div>

        {isFormOpen && (
          <div className="glass-card p-6 mb-6 animate-fade-in">
            <h3 className="font-display font-bold text-foreground text-lg mb-4">
              {editPlaylist ? "Edit Playlist" : "Buat Playlist Baru"}
            </h3>
            <Input
              placeholder="Nama Playlist"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="mb-4 bg-secondary border-border"
            />
            <div className="mb-3">
              <p className="text-sm font-medium text-foreground mb-2">Pilih Replay:</p>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari judul atau tipe..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary border-border"
                />
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1 border border-border rounded-lg p-2">
                {filteredReplays.map((r) => (
                  <label key={r.id} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary cursor-pointer transition-colors">
                    <Checkbox
                      checked={selectedReplays.has(r.id)}
                      onCheckedChange={() => toggleReplay(r.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{r.type}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(r.show_time), "d MMM yyyy", { locale: idLocale })}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{selectedReplays.size} replay dipilih</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={editPlaylist ? handleUpdate : handleCreate} className="gradient-primary text-primary-foreground">
                {editPlaylist ? "Simpan" : "Buat"}
              </Button>
              <Button variant="outline" onClick={resetForm}>Batal</Button>
            </div>
          </div>
        )}

        {playlistsLoading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <ListVideo className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>Belum ada playlist.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.map((pl) => (
              <div key={pl.id} className="glass-card p-4 group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => setViewPlaylist(pl)}>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <ListVideo className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-semibold text-foreground truncate">{pl.name}</h3>
                      <p className="text-xs text-muted-foreground">{format(new Date(pl.created_at), "d MMM yyyy", { locale: idLocale })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => copyLink(pl)} className="w-8 h-8 rounded-full hover:bg-primary/10 flex items-center justify-center transition-colors" title="Salin link">
                      <Link2 className="w-4 h-4 text-primary" />
                    </button>
                    <button onClick={() => setEditPlaylist(pl)} className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors">
                      <Pencil className="w-3.5 h-3.5 text-foreground" />
                    </button>
                    <button onClick={() => handleDelete(pl.id)} className="w-8 h-8 rounded-full hover:bg-destructive/10 flex items-center justify-center transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View playlist dialog for admin */}
        <AdminPlaylistDialog
          playlist={viewPlaylist}
          replays={playlistReplays}
          onClose={() => setViewPlaylist(null)}
          onWatch={(r) => navigate(`/watch/${r.id}`)}
          onCopyLink={copyLink}
        />
      </main>
    </div>
  );
};

// Admin playlist view dialog
const AdminPlaylistDialog = ({ playlist, replays, onClose, onWatch, onCopyLink }: {
  playlist: Playlist | null; replays: Replay[]; onClose: () => void; onWatch: (r: Replay) => void; onCopyLink: (p: Playlist) => void;
}) => (
  <Dialog open={!!playlist} onOpenChange={() => onClose()}>
    <DialogContent className="bg-card border-border max-w-lg max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between">
          <span>{playlist?.name}</span>
          {playlist && (
            <button onClick={() => onCopyLink(playlist)} className="w-8 h-8 rounded-full hover:bg-primary/10 flex items-center justify-center" title="Salin link">
              <Link2 className="w-4 h-4 text-primary" />
            </button>
          )}
        </DialogTitle>
      </DialogHeader>
      {replays.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">Belum ada replay di playlist ini.</p>
      ) : (
        <div className="space-y-2">
          {replays.map((r) => (
            <div key={r.id} onClick={() => onWatch(r)} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary cursor-pointer transition-colors">
              <div className="w-8 h-8 rounded-md gradient-primary flex items-center justify-center shrink-0">
                <Play className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{r.type}</span>
                  <span>{format(new Date(r.show_time), "d MMM yyyy", { locale: idLocale })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DialogContent>
  </Dialog>
);

// Member playlist view dialog
const MemberPlaylistDialog = ({ playlist, replays, onClose, onWatch, userPlaylist }: {
  playlist: Playlist | null; replays: Replay[]; onClose: () => void; onWatch: (r: Replay) => void; userPlaylist?: any;
}) => {
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (userPlaylist) setNewName(userPlaylist.custom_name || playlist?.name || "");
  }, [userPlaylist, playlist]);

  const handleRename = async () => {
    if (!userPlaylist) return;
    await supabase.from("user_playlists").update({ custom_name: newName.trim() || null }).eq("id", userPlaylist.id);
    toast.success("Nama berhasil diubah!");
    setEditing(false);
  };

  return (
    <Dialog open={!!playlist} onOpenChange={() => onClose()}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editing ? (
              <div className="flex items-center gap-2 flex-1">
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} className="bg-secondary border-border text-sm" />
                <Button size="sm" onClick={handleRename}>OK</Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Batal</Button>
              </div>
            ) : (
              <>
                <span>{userPlaylist?.custom_name || playlist?.name}</span>
                <button onClick={() => setEditing(true)} className="w-6 h-6 rounded hover:bg-secondary flex items-center justify-center">
                  <Pencil className="w-3 h-3 text-muted-foreground" />
                </button>
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        {replays.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">Belum ada replay di playlist ini.</p>
        ) : (
          <div className="space-y-2">
            {replays.map((r) => (
              <div key={r.id} onClick={() => onWatch(r)} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary cursor-pointer transition-colors">
                <div className="w-8 h-8 rounded-md gradient-primary flex items-center justify-center shrink-0">
                  <Play className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{r.type}</span>
                    <span>{format(new Date(r.show_time), "d MMM yyyy", { locale: idLocale })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Group;
