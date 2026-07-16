import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Eye } from "lucide-react";

const ReplayViewCount = ({ replayId }: { replayId: string }) => {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  const viewRecorded = useRef(false);

  const fetchCount = async () => {
    const { count: c } = await supabase
      .from("replay_views")
      .select("*", { count: "exact", head: true })
      .eq("replay_id", replayId);
    setCount(c ?? 0);
  };

  // Record view (only once per session per replay), then refetch count
  useEffect(() => {
    if (!user || viewRecorded.current) return;
    viewRecorded.current = true;
    (async () => {
      await supabase
        .from("replay_views")
        .upsert({ replay_id: replayId, user_id: user.id }, { onConflict: "replay_id,user_id" });
      await fetchCount();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, replayId]);

  // Initial fetch + realtime subscription (refetch to avoid double count)
  useEffect(() => {
    fetchCount();

    const channel = supabase
      .channel(`views-${replayId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "replay_views", filter: `replay_id=eq.${replayId}` },
        () => {
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replayId]);

  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Eye className="w-4 h-4" />
      <span>{count} penonton</span>
    </div>
  );
};

export default ReplayViewCount;
