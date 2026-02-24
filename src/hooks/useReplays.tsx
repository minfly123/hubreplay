import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Replay {
  id: string;
  title: string;
  youtube_url: string;
  type: string;
  show_time: string;
  access_key: string;
  created_at: string;
  updated_at: string;
}

export const useReplays = () => {
  const [replays, setReplays] = useState<Replay[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReplays = async () => {
    const { data, error } = await supabase
      .from("replays")
      .select("*")
      .order("show_time", { ascending: false });
    if (!error && data) setReplays(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReplays();

    const channel = supabase
      .channel("replays-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "replays" },
        () => fetchReplays()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { replays, loading, refetch: fetchReplays };
};
