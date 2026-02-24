import { useMemo } from "react";

interface YouTubePlayerProps {
  url: string;
}

const getYoutubeId = (url: string): string => {
  const match = url.match(/(?:live\/|v=|youtu\.be\/)([^?&]+)/);
  return match?.[1] ?? "";
};

const YouTubePlayer = ({ url }: YouTubePlayerProps) => {
  const videoId = useMemo(() => getYoutubeId(url), [url]);

  if (!videoId) return <div className="text-muted-foreground p-4">Invalid URL</div>;

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-background">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&showinfo=0&controls=1&disablekb=0&fs=1&iv_load_policy=3`}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Video Player"
      />
    </div>
  );
};

export default YouTubePlayer;
