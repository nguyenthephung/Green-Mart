import React, { useEffect, useState } from 'react';
import { X, ShoppingBag, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
  title?: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, videoSrc, title = "Video Giới Thiệu" }) => {
  const [videoError, setVideoError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoMetadata, setVideoMetadata] = useState<{width: number, height: number} | null>(null);

  // Handle ESC key press
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      // Reset video state when modal opens
      setVideoError(false);
      setVideoLoading(true);
      setVideoMetadata(null);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Determine if video is portrait or landscape
  const isPortrait = videoMetadata && videoMetadata.height > videoMetadata.width;
  const videoAspectRatio = videoMetadata ? videoMetadata.width / videoMetadata.height : 16/9;

  if (!isOpen) return null;

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[10000] p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className={`relative bg-white rounded-2xl overflow-hidden mx-auto shadow-2xl transform animate-slideIn ${
        isPortrait ? 'w-full max-w-lg' : 'w-full max-w-6xl'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <h3 className="text-xl font-bold ml-2">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-all duration-200 hover:scale-110 hover:rotate-90"
            aria-label="Đóng video"
          >
            <X size={24} />
          </button>
        </div>

        {/* Video Player - Adaptive container */}
        <div className={`bg-gray-900 relative ${
          isPortrait 
            ? 'aspect-[9/16]' // Portrait aspect ratio for mobile videos
            : 'aspect-video'   // Standard 16:9 landscape
        }`}>
          {!videoError ? (
            <>
              {/* Video Element */}
              <video
                className="w-full h-full bg-black"
                controls
                preload="metadata"
                controlsList="nodownload"
                style={{
                  objectFit: 'contain'
                }}
                onLoadStart={() => {
                  console.log('Video loading started');
                  setVideoLoading(true);
                }}
                onLoadedData={() => {
                  console.log('Video data loaded');
                  setVideoLoading(false);
                }}
                onCanPlay={() => {
                  console.log('Video can play');
                  setVideoLoading(false);
                }}
                onError={(e) => {
                  console.error('Video loading error:', e);
                  console.error('Video src:', videoSrc);
                  setVideoError(true);
                  setVideoLoading(false);
                }}
                onPlay={() => console.log('Video started playing')}
                onPause={() => console.log('Video paused')}
                onLoadedMetadata={(e) => {
                  const video = e.target as HTMLVideoElement;
                  const metadata = {
                    duration: video.duration,
                    width: video.videoWidth,
                    height: video.videoHeight
                  };
                  console.log('Video metadata:', metadata);
                  setVideoMetadata({ width: video.videoWidth, height: video.videoHeight });
                }}
              >
                <source src={videoSrc} type="video/mp4" />
                
                {/* Fallback text cho trường hợp video không support */}
                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                  <div className="text-center">
                    <p className="text-xl mb-4">Trình duyệt không hỗ trợ video HTML5</p>
                    <a 
                      href={videoSrc} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 underline"
                    >
                      Tải video trực tiếp
                    </a>
                  </div>
                </div>
              </video>

              {/* Debug Panel - chỉ hiện trong development */}
              <div className="absolute top-2 right-2 bg-black/70 text-white p-2 rounded text-xs">
                <div>Src: {videoSrc.split('/').pop()}</div>
                <div>Loading: {videoLoading ? 'Yes' : 'No'}</div>
                <div>Error: {videoError ? 'Yes' : 'No'}</div>
                {videoMetadata && (
                  <div>
                    <div>Size: {videoMetadata.width}x{videoMetadata.height}</div>
                    <div>Type: {isPortrait ? 'Portrait' : 'Landscape'}</div>
                    <div>Ratio: {videoAspectRatio.toFixed(2)}</div>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Fallback khi video không load được
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-green-800 to-emerald-900 text-white">
              <Play size={64} className="mb-4 opacity-50" />
              <h3 className="text-2xl font-bold mb-2">Video không khả dụng</h3>
              <p className="text-center mb-4 px-4">
                Xin lỗi, video giới thiệu hiện tại không thể phát. <br/>
                Hãy khám phá sản phẩm của chúng tôi ngay bây giờ!
              </p>
              <div className="text-sm text-green-200 mb-4">
                Đường dẫn: {videoSrc}
              </div>
              <button 
                onClick={() => window.open(videoSrc, '_blank')}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors border border-white/30"
              >
                Thử mở video trực tiếp
              </button>
            </div>
          )}
          
          {/* Loading overlay */}
          {videoLoading && !videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <div className="text-white text-center">
                <div className="w-12 h-12 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-lg font-medium">Đang tải video...</p>
                <p className="text-sm opacity-75 mt-1">Vui lòng chờ trong giây lát</p>
              </div>
            </div>
          )}
          
          {/* Video info overlay */}
          {!videoLoading && !videoError && (
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
              <p className="font-medium">🎥 {title}</p>
              <p className="opacity-75">Click ▶️ để xem video giới thiệu GreenMart</p>
            </div>
          )}
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

export default VideoModal;
