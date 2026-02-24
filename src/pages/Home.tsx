import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useReplays, Replay } from "@/hooks/useReplays";
import { supabase } from "@/integrations/supabase/client";
import ReplayCard from "@/components/ReplayCard";
import AccessKeyDialog from "@/components/AccessKeyDialog";
import AdminReplayForm from "@/components/AdminReplayForm";
import { Button } from "@/components/ui/button";
import { Play, LogOut, Shield, Plus, Trash2, Pencil, Key } from "lucide-react";
import { toast } from "sonner";

const Home = () => {
  const { user, isAdmin, signOut } = useAuth();
  const { replays, loading } = useReplays();
  const navigate = useNavigate();

  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [masterUnlocked, setMasterUnlocked] = useState(false);
  const [masterKey, setMasterKey] = useState("");
  const [selectedReplay, setSelectedReplay] = useState<Replay | null>(null);
  const [showAccessDialog, setShowAccessDialog] = useState(false);
  const [showMasterDialog, setShowMasterDialog] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [editReplay, setEditReplay] = useState<Replay | null>(null);

  useEffect(() => {
    supabase
      .from("app_settings")
      .select("value")
      .eq("key", "master_key")
      .single()
      .then(({ data }) => {
        if (data) setMasterKey(data.value);
      });
  }, []);

  const handleWatch = (replay: Replay) => {
    if (isAdmin || masterUnlocked || unlockedIds.has(replay.id)) {
      navigate(`/watch/${replay.id}`);
    } else {
      setSelectedReplay(replay);
      setShowAccessDialog(true);
    }
  };

  const handleUnlock = (key: string): boolean => {
    if (!selectedReplay) return false;
    if (key === selectedReplay.access_key) {
      setUnlockedIds((prev) => new Set([...prev, selectedReplay.id]));
      return true;
    }
    // Also check master key
    if (key === masterKey) {
      setMasterUnlocked(true);
      return true;
    }
    return false;
  };

  const handleMasterUnlock = (key: string): boolean => {
    if (key === masterKey) {
      setMasterUnlocked(true);
      return true;
    }
    return false;
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus replay ini?")) return;
    const { error } = await supabase.from("replays").delete().eq("id", id);
    if (error) toast.error(error.message);
    else toast.success("Replay berhasil dihapus!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center glow-primary">
              <Play className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-display font-bold text-foreground">
              Hub <span className="text-gradient">Replay</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                <Shield className="w-3 h-3" />
                Admin
              </span>
            )}
            {!isAdmin && !masterUnlocked && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMasterDialog(true)}
                className="text-xs"
              >
                <Key className="w-3 h-3 mr-1" />
                Master Key
              </Button>
            )}
            {masterUnlocked && !isAdmin && (
              <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                ✓ All Unlocked
              </span>
            )}
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Admin Controls */}
        {isAdmin && (
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

        {/* Replay Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold text-foreground mb-1">
            Arsip Theater
          </h2>
          <p className="text-muted-foreground text-sm">
            Tonton ulang pertunjukan theater online JKT48
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card aspect-video animate-pulse" />
            ))}
          </div>
        ) : replays.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            Belum ada replay tersedia.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {replays.map((replay) => (
              <div key={replay.id} className="relative">
                <ReplayCard
                  replay={replay}
                  isUnlocked={isAdmin || masterUnlocked || unlockedIds.has(replay.id)}
                  onWatch={handleWatch}
                />
                {isAdmin && (
                  <div className="absolute top-3 left-3 flex gap-1 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditReplay(replay);
                      }}
                      className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-primary/20 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5 text-foreground" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(replay.id);
                      }}
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

      {/* Access Key Dialog */}
      <AccessKeyDialog
        open={showAccessDialog}
        onClose={() => setShowAccessDialog(false)}
        onUnlock={handleUnlock}
        title={selectedReplay?.title ?? ""}
      />

      {/* Master Key Dialog */}
      <AccessKeyDialog
        open={showMasterDialog}
        onClose={() => setShowMasterDialog(false)}
        onUnlock={handleMasterUnlock}
        title=""
        isMasterKey
      />
    </div>
  );
};

export default Home;
