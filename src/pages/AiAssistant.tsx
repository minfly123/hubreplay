import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Bot, User, Trash2, Sparkles } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const STORAGE_KEY = "hr_ai_chat_history";
const AUDIO_URL = "https://files.catbox.moe/zt1lz1.mp3";

const loadHistory = (): Message[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveHistory = (msgs: Message[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
};

// Detect audio tags in AI response
const AUDIO_MARKER = "[AUDIO:";

const renderMessageContent = (content: string) => {
  // Check for audio markers like [AUDIO:url]
  const parts: React.ReactNode[] = [];
  let remaining = content;
  let idx = 0;

  while (remaining.includes(AUDIO_MARKER)) {
    const start = remaining.indexOf(AUDIO_MARKER);
    const end = remaining.indexOf("]", start);
    if (end === -1) break;

    // Text before audio
    if (start > 0) {
      const textBefore = remaining.substring(0, start);
      parts.push(
        <div key={`text-${idx}`} className="prose prose-sm prose-invert max-w-none [&>p]:m-0 [&>ul]:mt-1 [&>ol]:mt-1">
          <ReactMarkdown>{textBefore}</ReactMarkdown>
        </div>
      );
    }

    const url = remaining.substring(start + AUDIO_MARKER.length, end);
    parts.push(
      <div key={`audio-${idx}`} className="my-2 bg-background/50 rounded-lg p-2 border border-border">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-primary font-medium">🎵 Music</span>
        </div>
        <audio controls className="w-full h-10" preload="none">
          <source src={url} type="audio/mpeg" />
        </audio>
      </div>
    );

    remaining = remaining.substring(end + 1);
    idx++;
  }

  if (remaining.trim()) {
    parts.push(
      <div key={`text-end-${idx}`} className="prose prose-sm prose-invert max-w-none [&>p]:m-0 [&>ul]:mt-1 [&>ol]:mt-1">
        <ReactMarkdown>{remaining}</ReactMarkdown>
      </div>
    );
  }

  return parts.length > 0 ? <>{parts}</> : (
    <div className="prose prose-sm prose-invert max-w-none [&>p]:m-0 [&>ul]:mt-1 [&>ol]:mt-1">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

const AiAssistant = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(loadHistory);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = { role: "user", content: trimmed, timestamp: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const chatHistory = newMessages.map((m) => ({ role: m.role, content: m.content }));

      const resp = await supabase.functions.invoke("hr-ai-chat", {
        body: { 
          messages: chatHistory,
          userTime: new Date().toLocaleString("id-ID", { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
          userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });

      if (resp.error) throw new Error(resp.error.message);

      const assistantMsg: Message = {
        role: "assistant",
        content: resp.data?.reply || "Maaf, saya tidak bisa memproses permintaan saat ini.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("AI error:", err);
      const errorMsg: Message = {
        role: "assistant",
        content: "Maaf, terjadi kesalahan. Coba lagi nanti ya! 🙏",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
    setIsLoading(false);
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  if (authLoading) return <LoadingSpinner />;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-sm font-display font-bold text-foreground leading-tight">Hr-Ai</h1>
                <p className="text-[10px] text-muted-foreground">Asisten Hub Replay</p>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={clearChat} className="text-muted-foreground">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-3xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-foreground">Halo! Saya Hr-Ai 👋</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Asisten eksekutif Hub Replay. Tanya apa saja tentang membership, replay, group, atau fitur lainnya!
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2.5 animate-fade-in ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === "assistant"
                ? "bg-gradient-to-br from-primary to-primary/60"
                : "bg-secondary"
            }`}>
              {msg.role === "assistant" ? (
                <Bot className="w-3.5 h-3.5 text-primary-foreground" />
              ) : (
                <User className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
              msg.role === "user"
                ? "bg-primary/15 border border-primary/20"
                : "bg-secondary/60 border border-border"
            }`}>
              {msg.role === "assistant" ? (
                <div className="text-sm text-foreground">
                  {renderMessageContent(msg.content)}
                </div>
              ) : (
                <p className="text-sm text-foreground whitespace-pre-wrap">{msg.content}</p>
              )}
              <p className="text-[10px] text-muted-foreground mt-1.5">
                {new Date(msg.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5 animate-fade-in">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <div className="bg-secondary/60 border border-border rounded-2xl px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border bg-card/50 backdrop-blur-md p-4">
        <div className="max-w-3xl mx-auto flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanya Hr-Ai..."
            rows={1}
            className="flex-1 resize-none min-h-[44px] max-h-32"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button size="sm" onClick={sendMessage} disabled={isLoading || !input.trim()} className="h-11 w-11 p-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;
