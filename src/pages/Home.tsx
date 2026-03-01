import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useReplays, Replay } from "@/hooks/useReplays";
import { useMembership } from "@/hooks/useMembership";
import AppNavigation from "@/components/AppNavigation";
import ReplayCard from "@/components/ReplayCard";
import AdminReplayForm from "@/components/AdminReplayForm";
import WelcomeDialog, { hasSeenWelcome } from "@/components/WelcomeDialog";
import MembershipCountdown from "@/components/MembershipCountdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Pencil, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";


const TIME_FILTERS = [
  { key: "all", label: "Semua" },
  { key: "today", label: "Hari Ini" },
  { key: "week", label: "Minggu Ini" },
  { key: "month", label: "Bulan Ini" },
  { key: "year", label: "Tahun Ini" },
];

const Home = () => {
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const { replays, loading } = useReplays();
  const { membership, isActive: hasMembership } = useMembership();
  const navigate = useNavigate();

  const [userUnlocks, setUserUnlocks] = useState<Set<string>>(new Set());
  const [playlistReplayIds, setPlaylistReplayIds] = useState<Set<string>>(new Set());
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [editReplay, setEditReplay] = useState<Replay | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTime, setFilterTime] = useState("all");

  useEffect(() => {
    if (!hasSeenWelcome()) setShowWelcome(true);
  }, []);

  // Fetch user's unlocked replays and playlist replays
  useEffect(() => {
    const fetchAccess = async () => {
      if (!user) return;
      // Unlocks
      const { data: unlockData } = await supabase
        .from("replay_unlocks")
        .select("replay_id")
        .eq("user_id", user.id);
      if (unlockData) setUserUnlocks(new Set(unlockData.map((d) => d.replay_id)));

      // Playlist replays
      const { data: userPlaylists } = await supabase
        .from("user_playlists")
        .select("playlist_id")
        .eq("user_id", user.id);
      if (userPlaylists && userPlaylists.length > 0) {
        const pIds = userPlaylists.map((up) => up.playlist_id);
        const { data: items } = await supabase
          .from("playlist_items")
          .select("replay_id")
          .in("playlist_id", pIds);
        if (items) setPlaylistReplayIds(new Set(items.map((i) => i.replay_id)));
      }
    };
    fetchAccess();
  }, [user]);

  const filteredReplays = useMemo(() => {
    const now = new Date();
    return replays.filter((r) => {
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (filterTime === "all") return true;
      const showDate = new Date(r.show_time);
      if (filterTime === "today") return showDate.toDateString() === now.toDateString();
      if (filterTime === "week") return showDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      if (filterTime === "month") return showDate.getMonth() === now.getMonth() && showDate.getFullYear() === now.getFullYear();
      if (filterTime === "year") return showDate.getFullYear() === now.getFullYear();
      return true;
    });
  }, [replays, searchQuery, filterTime]);

  const isReplayUnlocked = (replay: Replay) => {
    return isAdmin || hasMembership || replay.is_free || userUnlocks.has(replay.id) || playlistReplayIds.has(replay.id);
  };

  const handleWatch = (replay: Replay) => {
    if (replay.is_free || isReplayUnlocked(replay)) {
      navigate(`/watch/${replay.id}`);
    } else {
      toast.error("Akses ditolak! Kamu perlu membukanya dengan URL kunci.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus replay ini?")) return;
    const { error } = await supabase.from("replays").delete().eq("id", id);
    if (error) toast.error(error.message);
    else toast.success("Replay berhasil dihapus!");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation onOpenWelcome={() => setShowWelcome(true)} />

      <main className="container mx-auto px-4 py-8">
        {membership && !membership.isExpired && (
          <div className="mb-6">
            <MembershipCountdown membership={membership} />
          </div>
        )}

        {isSuperAdmin && (
          <div className="mb-8">
            {showAdminForm || editReplay ? (
              <AdminReplayForm
                editReplay={editReplay}
                onDone={() => {
                  setShowAdminForm(false);
                  setEditReplay(null);
                }}
              />
            ) : (
              <Button
                onClick={() => setShowAdminForm(true)}
                className="gradient-primary text-primary-foreground glow-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Replay
              </Button>
            )}
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold text-foreground mb-1">Arsip Theater</h2>
          <p className="text-muted-foreground text-sm">Tonton ulang pertunjukan theater online JKT48</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari judul show..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {TIME_FILTERS.map((f) => (
              <Button
                key={f.key}
                variant={filterTime === f.key ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterTime(f.key)}
                className={filterTime === f.key ? "gradient-primary text-primary-foreground" : ""}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card aspect-video animate-pulse" />
            ))}
          </div>
        ) : filteredReplays.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            {replays.length === 0 ? "Belum ada replay tersedia." : "Tidak ada hasil yang cocok."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReplays.map((replay) => (
              <div key={replay.id} className="relative">
                <ReplayCard
                  replay={replay}
                  isUnlocked={isReplayUnlocked(replay)}
                  onWatch={handleWatch}
                />
                {isSuperAdmin && (
                  <div className="absolute top-3 left-3 flex gap-1 z-10">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditReplay(replay); }}
                      className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-primary/20 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5 text-foreground" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(replay.id); }}
                      className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>



      <WelcomeDialog
        open={showWelcome}
        onClose={() => setShowWelcome(false)}
      />
    </div>
  );
};

export default Home;
