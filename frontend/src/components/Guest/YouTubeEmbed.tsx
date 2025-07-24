import React from 'react';
import { X } from 'lucide-react';

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  onClose?: () => void;
  className?: string;
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ 
  videoId, 
  title = "Video",
  onClose,
  className = ""
}) => {
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1`;
  
  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      {/* Close button nếu có */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-20 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
        >
          <X size={20} />
        </button>
      )}
      
      {/* YouTube iframe */}
      <iframe
        src={embedUrl}
        title={title}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
};

export default YouTubeEmbed;
