import { useState } from "react";
import { Play } from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

function getYouTubeId(url: string) {
  // Handle various YouTube URL formats including Shorts
  const patterns = [
    // YouTube Shorts: youtube.com/shorts/VIDEO_ID
    /youtube\.com\/shorts\/([^"&?\/\s]{11})/,
    // Standard YouTube: youtube.com/watch?v=VIDEO_ID
    /youtube\.com\/watch\?v=([^"&?\/\s]{11})/,
    // YouTube embed: youtube.com/embed/VIDEO_ID
    /youtube\.com\/embed\/([^"&?\/\s]{11})/,
    // YouTube short URL: youtu.be/VIDEO_ID
    /youtu\.be\/([^"&?\/\s]{11})/,
    // YouTube with other parameters: youtube.com/.../VIDEO_ID
    /youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)([^"&?\/\s]{11})/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return '';
}

function getVimeoId(url: string) {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : '';
}

interface ProductVideoProps {
  videoUrl: string;
  thumbnailUrl?: string;
  productName: string;
}

export const ProductVideo = ({ videoUrl, thumbnailUrl, productName }: ProductVideoProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const youtubeId = getYouTubeId(videoUrl);
  const vimeoId = getVimeoId(videoUrl);
  const isYouTube = youtubeId !== '';
  const isVimeo = vimeoId !== '';
  const isDirectVideo = !isYouTube && !isVimeo;

  return (
    <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden shadow-lg">
      {!isPlaying ? (
        <>
          <OptimizedImage
            src={thumbnailUrl || (isYouTube ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : (isVimeo ? `https://vumbnail.com/${vimeoId}.jpg` : ''))}
            alt={`${productName} video thumbnail`}
            className="w-full h-full object-cover"
            loading="eager"
            priority={true}
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <button
              onClick={() => setIsPlaying(true)}
              className="bg-primary/90 hover:bg-primary text-primary-foreground rounded-full p-4 transition-all duration-200 hover:scale-110 shadow-lg"
            >
              <Play className="w-8 h-8 ml-1" />
            </button>
          </div>
          <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
            VIDEO
          </div>
        </>
      ) : (
        <>
          {isYouTube && (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0&playsinline=1&rel=0&modestbranding=1&showinfo=0&controls=1&disablekb=0&fs=1&cc_load_policy=0&iv_load_policy=3&autohide=0`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
          {isVimeo && (
            <iframe
              src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=0&playsinline=1&title=0&byline=0&portrait=0&controls=1&responsive=1`}
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          )}
          {isDirectVideo && (
            <video
              src={videoUrl}
              className="w-full h-full"
              controls
              autoPlay
              playsInline
            />
          )}
        </>
      )}
    </div>
  );
};
