import { useState, useEffect } from 'react';
import { useBannerStore } from '../../../../stores/useBannerStore';

interface FooterBannerProps {
  className?: string;
}

export default function FooterBanner({ className = '' }: FooterBannerProps) {
  const { fetchBanners, incrementClickCount } = useBannerStore();
  const [banner, setBanner] = useState<any>(null);

  useEffect(() => {
    const loadBanner = async () => {
      try {
        await fetchBanners('footer', true);
        const storeBanners = useBannerStore.getState().banners;
        const footerBanners = storeBanners.filter((b: any) => 
          b.position === 'footer' && b.isActive
        );
        
        if (footerBanners.length > 0) {
          setBanner(footerBanners[0]);
        }
      } catch (error) {
        console.error('Failed to load footer banner:', error);
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

  if (!banner) return null;

  return (
    <div className={`w-full ${className}`}>
      <div 
        onClick={handleClick}
        className="bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white rounded-2xl cursor-pointer group transition-all duration-300 hover:scale-[1.02] shadow-2xl overflow-hidden"
      >
        <div className="relative">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity duration-500"
            style={{ backgroundImage: `url(${banner.imageUrl})` }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>
          
          {/* Content */}
          <div className="relative px-8 py-8 md:px-12 md:py-12">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                {/* Left Content */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Badge */}
                  <div className="flex items-center gap-4">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider">
                      📄 Footer Banner
                    </span>
                    <span className="bg-red-500 px-3 py-1 rounded-full text-xs font-bold">
                      #{banner.priority}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight">
                    <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {banner.title}
                    </span>
                  </h2>
                  
                  {/* Description */}
                  {banner.description && (
                    <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl">
                      {banner.description}
                    </p>
                  )}
                </div>
                
                {/* Right CTA */}
                <div className="lg:col-span-1 flex justify-center lg:justify-end">
                  <div className="text-center lg:text-right">
                    <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 group-hover:scale-110 shadow-lg hover:shadow-xl">
                      <span>{banner.buttonText || 'Khám phá ngay'}</span>
                      <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                    
                    {/* Additional Info */}
                    <div className="mt-4 text-sm text-gray-400">
                      <p>Nhấn để xem chi tiết</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-lg animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
      </div>
    </div>
  );
}
