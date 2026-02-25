import { Replay } from "@/hooks/useReplays";
import { Play, Lock, Calendar, Tag } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface ReplayCardProps {
  replay: Replay;
  isUnlocked: boolean;
  onWatch: (replay: Replay) => void;
}

const getYoutubeThumbnail = (url: string) => {
  const match = url.match(/(?:live\/|v=|youtu\.be\/)([^?&]+)/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : "";
};

const ReplayCard = ({ replay, isUnlocked, onWatch }: ReplayCardProps) => {
  return (
    <div
      className="glass-card overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:glow-primary animate-fade-in"
      onClick={() => onWatch(replay)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={getYoutubeThumbnail(replay.youtube_url)}
          alt={replay.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-background/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {isUnlocked ? (
            <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center glow-primary">
              <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-secondary/80 flex items-center justify-center">
              <Lock className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>
        {replay.is_free ? (
          <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-xs text-primary-foreground font-medium">Gratis</span>
          </div>
        ) : !isUnlocked ? (
          <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
            <Lock className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Terkunci</span>
          </div>
        ) : null}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-foreground text-lg mb-2 line-clamp-1">
          {replay.title}
        </h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" />
            {replay.type}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {format(new Date(replay.show_time), "d MMM yyyy", { locale: id })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReplayCard;
