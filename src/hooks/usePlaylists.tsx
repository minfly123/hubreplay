import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Playlist {
  id: string;
  name: string;
  created_by: string;
  token: string;
  created_at: string;
  updated_at: string;
}

export interface PlaylistItem {
  id: string;
  playlist_id: string;
  replay_id: string;
  added_at: string;
}

export interface UserPlaylist {
  id: string;
  user_id: string;
  playlist_id: string;
  custom_name: string | null;
  added_at: string;
}

export const usePlaylists = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlaylists = async () => {
    const { data } = await supabase
      .from("playlists")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setPlaylists(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPlaylists();
    const channel = supabase
      .channel("playlists-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "playlists" }, () => fetchPlaylists())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return { playlists, loading, refetch: fetchPlaylists };
};

export const useUserPlaylists = () => {
  const { user } = useAuth();
  const [userPlaylists, setUserPlaylists] = useState<(UserPlaylist & { playlist?: Playlist })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("user_playlists")
      .select("*, playlists(*)")
      .eq("user_id", user.id)
      .order("added_at", { ascending: false });
    if (data) {
      setUserPlaylists(data.map((d: any) => ({
        ...d,
        playlist: d.playlists,
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetch();
    const channel = supabase
      .channel("user-playlists-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "user_playlists" }, () => fetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return { userPlaylists, loading, refetch: fetch };
};
