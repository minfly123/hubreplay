import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useReplays } from "@/hooks/useReplays";
import AppNavigation from "@/components/AppNavigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Gift as GiftIcon, Copy, Trash2, Search, Check } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface GiftRow {
  id: string;
  replay_id: string;
  token: string;
  max_winners: number;
  claimed_count: number;
  created_at: string;
}

const Gift = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { replays } = useReplays();
  const [gifts, setGifts] = useState<GiftRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [selectedReplay, setSelectedReplay] = useState("");
  const [winnerCount, setWinnerCount] = useState(1);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/", { replace: true });
    }
  }, [authLoading, isAdmin, navigate]);

  const fetchGifts = async () => {
    const { data } = await supabase
      .from("gifts")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setGifts(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchGifts();
  }, [isAdmin]);

  const handleCreate = async () => {
    if (!selectedReplay) {
      toast.error("Pilih replay terlebih dahulu!");
      return;
    }
    if (winnerCount < 1) {
      toast.error("Jumlah pemenang minimal 1!");
      return;
    }
    setCreating(true);
    const { error } = await supabase.from("gifts").insert({
      replay_id: selectedReplay,
      max_winners: winnerCount,
      created_by: (await supabase.auth.getUser()).data.user!.id,
    });
    if (error) {
      toast.error("Gagal membuat gift!");
    } else {
      toast.success("Gift berhasil dibuat!");
      setSelectedReplay("");
      setWinnerCount(1);
      fetchGifts();
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("gifts").delete().eq("id", id);
    if (!error) {
      toast.success("Gift dihapus!");
      fetchGifts();
    }
  };

  const copyInfo = (gift: GiftRow) => {
    const replay = replays.find((r) => r.id === gift.replay_id);
    const url = `${window.location.origin}/gift/${gift.token}`;
    const text = `🎁 GIFT REPLAY\n\n🎬 ${replay?.title || "Replay"}\n🔗 ${url}\n👥 Slot: ${gift.max_winners - gift.claimed_count}/${gift.max_winners}`;
    navigator.clipboard.writeText(text);
    toast.success("Info gift tersalin!");
  };

  const filteredReplays = replays.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.type.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || loading) return <LoadingSpinner />;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation />
      <main className="container mx-auto px-4 py-6 max-w-3xl">
        <h2 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-2">
          <GiftIcon className="w-6 h-6 text-primary" />
          Gift Replay
        </h2>

        {/* Create form */}
        <div className="bg-card border border-border rounded-xl p-5 mb-8 space-y-4">
          <h3 className="font-semibold text-foreground">Buat Gift Baru</h3>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari replay..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1 border border-border rounded-lg p-2">
            {filteredReplays.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">Tidak ada replay</p>
            )}
            {filteredReplays.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedReplay(r.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedReplay === r.id
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">{r.title}</span>
                  {selectedReplay === r.id && <Check className="w-4 h-4 shrink-0" />}
                </div>
                <span className="text-xs text-muted-foreground">{r.type}</span>
              </button>
            ))}
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Jumlah Pemenang</label>
            <Input
              type="number"
              min={1}
              value={winnerCount}
              onChange={(e) => setWinnerCount(Number(e.target.value))}
            />
          </div>

          <Button onClick={handleCreate} disabled={creating} className="w-full">
            {creating ? "Membuat..." : "Generate Gift"}
          </Button>
        </div>

        {/* List */}
        <h3 className="font-semibold text-foreground mb-3">Daftar Gift</h3>
        <div className="space-y-3">
          {gifts.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Belum ada gift</p>
          )}
          {gifts.map((gift) => {
            const replay = replays.find((r) => r.id === gift.replay_id);
            const slotsLeft = gift.max_winners - gift.claimed_count;
            return (
              <div key={gift.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{replay?.title || "Replay"}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Slot: {slotsLeft}/{gift.max_winners} •{" "}
                      {format(new Date(gift.created_at), "d MMM yyyy", { locale: idLocale })}
                    </p>
                    {slotsLeft <= 0 && (
                      <span className="text-xs text-destructive font-medium">Penuh</span>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => copyInfo(gift)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(gift.id)} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Gift;
