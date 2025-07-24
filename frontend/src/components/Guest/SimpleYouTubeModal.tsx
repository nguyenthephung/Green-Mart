import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface SimpleYouTubeModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  title?: string;
}

const SimpleYouTubeModal: React.FC<SimpleYouTubeModalProps> = ({ 
  isOpen, 
  onClose, 
  videoId, 
  title = "Video YouTube" 
}) => {
  // Debug logging
  console.log('SimpleYouTubeModal render:', { isOpen, videoId, title });
  
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    console.log('Modal is closed, not rendering');
    return null;
  }

  console.log('Modal is OPEN, rendering with z-index 10001');

  // Thử nhiều cách embed YouTube khác nhau
  const youtubeUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=0&controls=1&showinfo=1&rel=0&iv_load_policy=3&modestbranding=0`;
  const fallbackUrl = `https://www.youtube.com/watch?v=${videoId}`;
  console.log('YouTube URL:', youtubeUrl);

  return (
    <div 
      className="fixed inset-0 bg-red-900/90 flex items-center justify-center z-[10001] p-4"
      onClick={onClose}
      style={{ zIndex: 10001 }} // Force inline style
    >
      <div 
        className="relative w-full max-w-5xl aspect-video bg-white rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Debug Info */}
        <div className="absolute top-0 left-0 bg-yellow-300 text-black p-2 z-20 text-xs">
          Video ID: {videoId} | Using: youtube-nocookie.com
        </div>
        
        {/* Header */}
        <div className="absolute top-8 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4 z-10">
          <div className="flex items-center justify-between text-white">
            <h3 className="text-lg font-semibold">{title}</h3>
            <div className="flex gap-2">
              <a 
                href={fallbackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-red-600 rounded text-sm"
              >
                Open YouTube
              </a>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* YouTube Player */}
        <iframe
          src={youtubeUrl}
          title={title}
          className="w-full h-full border-2 border-blue-500"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => console.log('✅ YouTube iframe loaded successfully')}
          onError={(e) => console.error('❌ YouTube iframe error:', e)}
        />
        
        {/* Fallback message */}
        <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-3 rounded text-sm">
          Nếu video không hiển thị, <a href={fallbackUrl} target="_blank" rel="noopener noreferrer" className="text-blue-300 underline">click để mở trên YouTube</a>
        </div>
      </div>
    </div>
  );
};

export default SimpleYouTubeModal;
