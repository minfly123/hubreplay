import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ListVideo, Plus, Check, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const GroupInvite = () => {
  const { token } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<any>(null);
  const [creatorEmail, setCreatorEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [alreadyAdded, setAlreadyAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }

    const fetch = async () => {
      // Get playlist by token
      const { data: pl } = await supabase
        .from("playlists")
        .select("*")
        .eq("token", token)
        .single();

      if (!pl) {
        toast.error("Playlist tidak ditemukan atau link tidak valid.");
        navigate("/group", { replace: true });
        return;
      }
      setPlaylist(pl);

      // Get creator email
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("user_id", pl.created_by)
        .single();
      if (profile) setCreatorEmail(profile.email || "");

      // Count items
      const { count } = await supabase
        .from("playlist_items")
        .select("id", { count: "exact", head: true })
        .eq("playlist_id", pl.id);
      setItemCount(count || 0);

      // Check if already added
      const { data: existing } = await supabase
        .from("user_playlists")
        .select("id")
        .eq("user_id", user!.id)
        .eq("playlist_id", pl.id)
        .maybeSingle();
      setAlreadyAdded(!!existing);
      setLoading(false);
    };
    fetch();
  }, [token, user, authLoading, navigate]);

  const handleAdd = async () => {
    if (!user || !playlist) return;
    setAdding(true);
    const { error } = await supabase.from("user_playlists").insert({
      user_id: user.id,
      playlist_id: playlist.id,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Playlist berhasil ditambahkan!");
      setAlreadyAdded(true);
    }
    setAdding(false);
  };

  if (loading || authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md w-full text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 glow-primary">
          <ListVideo className="w-8 h-8 text-primary-foreground" />
        </div>

        <h1 className="text-2xl font-display font-bold text-foreground mb-2">
          {playlist?.name}
        </h1>

        <p className="text-sm text-muted-foreground mb-1">
          Dibuat oleh: <span className="text-foreground">{creatorEmail}</span>
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          {itemCount} replay tersedia
        </p>

        {alreadyAdded ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Check className="w-5 h-5" />
              <span className="font-medium">Sudah ada di koleksimu</span>
            </div>
            <Button variant="outline" onClick={() => navigate("/group")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Lihat Group
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Button
              onClick={handleAdd}
              disabled={adding}
              className="w-full gradient-primary text-primary-foreground glow-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              {adding ? "Menambahkan..." : "Tambahkan ke Koleksi"}
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Kembali
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupInvite;
