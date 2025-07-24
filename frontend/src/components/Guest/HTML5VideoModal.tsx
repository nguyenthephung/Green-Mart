import React, { useEffect, useRef } from 'react';
import { X, Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface HTML5VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
  title?: string;
  poster?: string;
}

const HTML5VideoModal: React.FC<HTML5VideoModalProps> = ({ 
  isOpen, 
  onClose, 
  videoSrc, 
  title = "Video Player",
  poster 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);

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

  // Auto play when modal opens
  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  console.log('HTML5VideoModal render:', { isOpen, videoSrc, title });

  return (
    <div 
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-[10001] p-4"
      onClick={onClose}
      style={{ zIndex: 10001 }}
    >
      <div 
        className="relative w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 z-10">
          <div className="flex items-center justify-between text-white">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Video Player */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          poster={poster}
          controls
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onVolumeChange={(e) => setIsMuted(e.currentTarget.muted)}
        >
          <source src={videoSrc} type="video/mp4" />
          <source src={videoSrc.replace('.mp4', '.webm')} type="video/webm" />
          <source src={videoSrc.replace('.mp4', '.ogg')} type="video/ogg" />
          Trình duyệt của bạn không hỗ trợ video HTML5.
        </video>

        {/* Custom Controls Overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4 text-white">
          <button
            onClick={togglePlay}
            className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          
          <button
            onClick={toggleMute}
            className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          
          <div className="flex-1 bg-black/50 rounded px-3 py-1 text-sm">
            <div>Video: {videoSrc}</div>
            <div>Status: {isPlaying ? '▶️ Playing' : '⏸️ Paused'} | Audio: {isMuted ? '🔇 Muted' : '🔊 On'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HTML5VideoModal;
