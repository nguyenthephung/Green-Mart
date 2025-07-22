import React, { useEffect, useState } from 'react';
import { X, ShoppingBag, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface YouTubeVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  title?: string;
}

const YouTubeVideoModal: React.FC<YouTubeVideoModalProps> = ({ 
  isOpen, 
  onClose, 
  videoId, 
  title = "Video Giới Thiệu" 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Debug logging
  console.log('YouTubeVideoModal render:', { isOpen, videoId, title });

  // Handle ESC key press
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
      setIsLoading(true);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const youtubeUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&showinfo=0&modestbranding=1&controls=1&fs=1&cc_load_policy=0&iv_load_policy=3&autohide=0`;
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[10000] p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white rounded-2xl overflow-hidden w-full max-w-6xl mx-auto shadow-2xl transform animate-slideIn">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-600 to-red-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-6 bg-white rounded-sm flex items-center justify-center">
              <span className="text-red-600 font-bold text-xs">▶</span>
            </div>
            <h3 className="text-xl font-bold">{title}</h3>
            <span className="text-sm opacity-75">YouTube</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-white/20 transition-all duration-200"
              title="Mở trên YouTube"
            >
              <ExternalLink size={20} />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition-all duration-200 hover:scale-110 hover:rotate-90"
              aria-label="Đóng video"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* YouTube Video Player */}
        <div className="aspect-video bg-black relative">
          {/* YouTube Iframe */}
          <iframe
            src={youtubeUrl}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={() => {
              console.log('YouTube iframe loaded');
              setIsLoading(false);
            }}
            onError={(e) => {
              console.error('YouTube iframe error:', e);
              setIsLoading(false);
            }}
          />

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
              <div className="text-white text-center">
                <div className="w-12 h-12 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-lg font-medium">Đang tải video YouTube...</p>
                <p className="text-sm opacity-75 mt-1">Kết nối với máy chủ</p>
              </div>
            </div>
          )}

          {/* Debug Panel */}
          <div className="absolute top-2 right-2 bg-black/70 text-white p-2 rounded text-xs z-20">
            <div>ID: {videoId}</div>
            <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
            <div>URL: youtube.com/embed/{videoId}</div>
          </div>

          {/* Fallback when iframe fails */}
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center text-white" style={{zIndex: -1}}>
            <div className="text-center">
              <p className="text-lg mb-2">Video đang tải...</p>
              <p className="text-sm opacity-75">Nếu không hiển thị, hãy thử:</p>
              <a 
                href={watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline text-sm"
              >
                Xem trực tiếp trên YouTube
              </a>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-6 bg-gradient-to-r from-gray-50 to-green-50">
          <div className="text-center space-y-4">
            <p className="text-gray-700 text-sm leading-relaxed">
              Khám phá hành trình của GreenMart - Nơi mang đến những sản phẩm tươi ngon, 
              chất lượng cao từ thiên nhiên đến tận nhà bạn.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                to="/category"
                onClick={onClose}
                className="group bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 font-semibold"
              >
                <ShoppingBag size={20} />
                Mua Sắm Ngay
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              
              <a
                href={watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 hover:text-red-800 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors font-medium flex items-center gap-2"
              >
                <ExternalLink size={16} />
                Xem trên YouTube
              </a>
              
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Đóng Video
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeVideoModal;
