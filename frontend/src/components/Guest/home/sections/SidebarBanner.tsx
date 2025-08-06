import { useState, useEffect } from 'react';
import { useBannerStore } from '../../../../stores/useBannerStore';

interface SidebarBannerProps {
  className?: string;
}

export default function SidebarBanner({ className = '' }: SidebarBannerProps) {
  const { fetchBanners, incrementClickCount } = useBannerStore();
  const [banner, setBanner] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const loadBanner = async () => {
      try {
        await fetchBanners('sidebar', true);
        const storeBanners = useBannerStore.getState().banners;
        const sidebarBanners = storeBanners.filter((b: any) => 
          b.position === 'sidebar' && b.isActive
        );
        
        if (sidebarBanners.length > 0) {
          const sortedBanners = sidebarBanners.sort((a: any, b: any) => (a.priority || 999) - (b.priority || 999));
          setBanner(sortedBanners[0]);
        }
      } catch (error) {
        console.error('Failed to load sidebar banner:', error);
      }
    };

    loadBanner();
  }, [fetchBanners]);

  const handleClick = async () => {
    if (banner) {
      try {
        await incrementClickCount(banner._id);
        if (banner.linkUrl) {
          window.open(banner.linkUrl, '_blank');
        }
      } catch (error) {
        console.error('Error tracking banner click:', error);
      }
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!banner || !isVisible) return null;

  return (
    <div className={`fixed right-6 top-1/2 transform -translate-y-1/2 z-40 transition-all duration-500 ${className}`}>
      <div className={`${isMinimized ? 'w-16 h-16' : 'w-80 h-auto'} transition-all duration-300`}>
        {isMinimized ? (
          // Minimized State - Simple Circle
          <div 
            onClick={handleMinimize}
            className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-2xl cursor-pointer flex items-center justify-center group hover:scale-110 transition-all duration-300 animate-pulse"
          >
            <div className="text-white text-2xl group-hover:scale-125 transition-transform">
              📢
            </div>
          </div>
        ) : (
          // Full Banner
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden group hover:scale-105 transition-all duration-300">
            {/* Header with Controls */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Quảng Cáo</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMinimize}
                  className="w-6 h-6 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-full flex items-center justify-center transition-colors"
                  title="Thu gọn"
                >
                  <span className="text-xs">−</span>
                </button>
                <button
                  onClick={handleClose}
                  className="w-6 h-6 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-colors"
                  title="Đóng"
                >
                  <span className="text-xs">×</span>
                </button>
              </div>
            </div>

            {/* Banner Content */}
            <div 
              onClick={handleClick}
              className="cursor-pointer group/content"
            >
              {/* Image Section */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover group-hover/content:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                
                {/* Floating Elements */}
                <div className="absolute top-3 left-3">
                  <span className="bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold animate-bounce">
                    HOT
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-4 space-y-3">
                {/* Title */}
                <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight line-clamp-2 group-hover/content:text-blue-600 transition-colors">
                  {banner.title}
                </h3>

                {/* Description */}
                {banner.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {banner.description}
                  </p>
                )}

                {/* CTA Button */}
                <div className="pt-2">
                  <div className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-center py-2 px-4 rounded-xl text-xs font-semibold transition-all duration-300 group-hover/content:scale-105 shadow-lg">
                    {banner.buttonText || 'Xem ngay'}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Accent */}
            <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
          </div>
        )}
      </div>
    </div>
  );
}
