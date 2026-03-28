import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Star } from "lucide-react";
import { toast } from "sonner";

const ReplayRating = ({ replayId }: { replayId: string }) => {
  const { user } = useAuth();
  const [userRating, setUserRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [saving, setSaving] = useState(false);

  const fetchRatings = async () => {
    const { data } = await supabase
      .from("ratings")
      .select("rating")
      .eq("replay_id", replayId);
    if (data && data.length > 0) {
      const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
      setAvgRating(Math.round(avg * 10) / 10);
      setTotalRatings(data.length);
    }
  };

  // Fetch user's rating and average
  useEffect(() => {
    fetchRatings();
    if (!user) return;
    supabase
      .from("ratings")
      .select("rating")
      .eq("replay_id", replayId)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setUserRating(data.rating);
      });

    // Realtime
    const channel = supabase
      .channel(`ratings-${replayId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "ratings", filter: `replay_id=eq.${replayId}` }, () => {
        fetchRatings();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [replayId, user]);

  const handleRate = async (value: number) => {
    if (!user || saving) return;
    setSaving(true);
    if (userRating > 0) {
      // Update
      await supabase
        .from("ratings")
        .update({ rating: value, updated_at: new Date().toISOString() })
        .eq("replay_id", replayId)
        .eq("user_id", user.id);
    } else {
      // Insert
      const { error } = await supabase.from("ratings").insert({
        replay_id: replayId,
        user_id: user.id,
        rating: value,
      });
      if (error) {
        toast.error("Gagal menyimpan rating");
        setSaving(false);
        return;
      }
    }
    setUserRating(value);
    fetchRatings();
    toast.success(`Rating ${value}/5 tersimpan!`);
    setSaving(false);
  };

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            disabled={saving}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={`w-5 h-5 transition-colors ${
                (hovered || userRating) >= star
                  ? "text-amber-400 fill-amber-400"
                  : "text-muted-foreground/40"
              }`}
            />
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-semibold text-amber-400">{avgRating > 0 ? avgRating : "—"}</span>
        <span>/ 5</span>
        <span className="text-xs">({totalRatings} rating)</span>
      </div>
    </div>
  );
};

export default ReplayRating;
