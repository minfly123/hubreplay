import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Eye } from "lucide-react";

const ReplayViewCount = ({ replayId }: { replayId: string }) => {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  const viewRecorded = useRef(false);

  // Record view (only once per session per replay)
  useEffect(() => {
    if (!user || viewRecorded.current) return;
    viewRecorded.current = true;
    supabase
      .from("replay_views")
      .upsert({ replay_id: replayId, user_id: user.id }, { onConflict: "replay_id,user_id" })
      .then(() => {});
  }, [user, replayId]);

  // Fetch count & subscribe to realtime
  useEffect(() => {
    const fetchCount = async () => {
      const { count: c } = await supabase
        .from("replay_views")
        .select("*", { count: "exact", head: true })
        .eq("replay_id", replayId);
      setCount(c ?? 0);
    };
    fetchCount();

    const channel = supabase
      .channel(`views-${replayId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "replay_views", filter: `replay_id=eq.${replayId}` },
        () => {
          setCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [replayId]);

  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Eye className="w-4 h-4" />
      <span>{count} penonton</span>
    </div>
  );
};

export default ReplayViewCount;
