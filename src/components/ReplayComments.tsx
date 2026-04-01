import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, MessageCircle, User, Crown, Shield } from "lucide-react";
import { toast } from "sonner";
import { containsProfanity, censorText } from "@/lib/profanityFilter";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const useRelativeTime = (dates: string[], intervalMs = 15000) => {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (dates.length === 0) return;
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [dates.length, intervalMs]);
};

interface Comment {
  id: string;
  replay_id: string;
  user_id: string;
  username: string;
  content: string;
  created_at: string;
}

const ReplayComments = ({ replayId }: { replayId: string }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-refresh relative timestamps
  useRelativeTime(comments.map((c) => c.created_at));

  // Fetch username
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("username")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setUsername(data?.username ?? null));
  }, [user]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      const { data } = await supabase
        .from("comments")
        .select("*")
        .eq("replay_id", replayId)
        .order("created_at", { ascending: true });
      if (data) setComments(data);
    };
    fetchComments();

    // Realtime subscription
    const channel = supabase
      .channel(`comments-${replayId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments", filter: `replay_id=eq.${replayId}` },
        (payload) => {
          setComments((prev) => [...prev, payload.new as Comment]);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "comments", filter: `replay_id=eq.${replayId}` },
        (payload) => {
          setComments((prev) => prev.filter((c) => c.id !== (payload.old as any).id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [replayId]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleSend = async () => {
    if (!user || !username) return;
    const trimmed = content.trim();
    if (!trimmed) return;
    if (trimmed.length > 500) {
      toast.error("Komentar maksimal 500 karakter");
      return;
    }
    if (containsProfanity(trimmed)) {
      toast.error("Komentar mengandung kata-kata tidak pantas!");
      return;
    }

    setSending(true);
    const { error } = await supabase.from("comments").insert({
      replay_id: replayId,
      user_id: user.id,
      username,
      content: trimmed,
    });
    if (error) {
      toast.error("Gagal mengirim komentar");
    } else {
      setContent("");
    }
    setSending(false);
  };

  return (
    <div className="mt-8 space-y-4">
      <h3 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-primary" />
        Komentar ({comments.length})
      </h3>

      {/* Comments list */}
      <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            Belum ada komentar. Jadilah yang pertama! 💬
          </p>
        )}
        {comments.map((c) => (
          <div
            key={c.id}
            className={`flex gap-3 animate-fade-in ${c.user_id === user?.id ? "flex-row-reverse" : ""}`}
          >
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div
              className={`max-w-[75%] rounded-xl px-3.5 py-2.5 ${
                c.user_id === user?.id
                  ? "bg-primary/15 border border-primary/20"
                  : "bg-secondary/60 border border-border"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-primary">@{c.username}</span>
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: idLocale })}
                </span>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap break-words">{c.content}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!username ? (
        <div className="rounded-lg bg-secondary/50 border border-border p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Kamu harus mengatur <span className="text-primary font-medium">username</span> di halaman Profil untuk bisa berkomentar.
          </p>
        </div>
      ) : (
        <div className="flex gap-2 items-end">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tulis komentar..."
            rows={2}
            maxLength={500}
            className="flex-1 resize-none min-h-[60px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button size="sm" onClick={handleSend} disabled={sending || !content.trim()} className="h-10">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReplayComments;
