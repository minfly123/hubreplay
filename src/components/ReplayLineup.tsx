import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Member {
  id: string;
  name: string;
  url_key: string;
}

interface ReplayLineupProps {
  replayId: string;
  replayTitle: string;
  showTime: string;
}

const normalize = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]/g, "").trim();

const ReplayLineup = ({ replayId, replayTitle, showTime }: ReplayLineupProps) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // 1. Try cached
      const { data: cached } = await supabase
        .from("replay_lineups")
        .select("members")
        .eq("replay_id", replayId)
        .maybeSingle();

      if (cached && Array.isArray(cached.members) && cached.members.length > 0) {
        setMembers(cached.members as unknown as Member[]);
        setLoading(false);
        return;
      }

      // 2. Try fetch from API + match
      try {
        const url = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/jkt48-schedule?group=jkt48`;
        const res = await fetch(url, {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        });
        if (!res.ok) throw new Error("API failed");
        const data = await res.json();
        const list: any[] = data.theater || [];

        const targetTitle = normalize(replayTitle);
        const targetDate = new Date(showTime).toISOString().slice(0, 10);

        const match = list.find((s) => {
          const titleMatch = normalize(s.title) === targetTitle ||
            normalize(s.title).includes(targetTitle) ||
            targetTitle.includes(normalize(s.title));
          const dateMatch = new Date(s.start_date).toISOString().slice(0, 10) === targetDate;
          return titleMatch && dateMatch;
        }) || list.find((s) => normalize(s.title) === targetTitle);

        if (match && match.members && match.members.length > 0) {
          setMembers(match.members);
          // Save to cache
          await supabase.from("replay_lineups").upsert(
            {
              replay_id: replayId,
              show_external_id: match.id,
              show_title: match.title,
              show_team: match.team,
              show_date: match.start_date,
              banner: match.banner,
              poster: match.poster,
              members: match.members,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "replay_id" }
          );
        }
      } catch (e) {
        console.error("Lineup fetch failed:", e);
      }
      setLoading(false);
    };
    load();
  }, [replayId, replayTitle, showTime]);

  if (loading || members.length === 0) return null;

  return (
    <div className="mt-2 mb-4 p-3 rounded-lg bg-secondary/40 border border-border">
      <p className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
        <Users className="w-3 h-3 text-primary" />
        Line-Up ({members.length} member)
      </p>
      <div className="flex flex-wrap gap-1">
        {members.map((m) => (
          <Badge
            key={m.id}
            variant="outline"
            className="text-[10px] px-1.5 py-0 h-5 border-primary/30 text-foreground bg-primary/5"
          >
            {m.name}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default ReplayLineup;
