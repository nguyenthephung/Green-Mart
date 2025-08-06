import { useState, useEffect } from 'react';
import { useBannerStore } from '../../../../stores/useBannerStore';

interface PromoBannerProps {
  className?: string;
}

export default function PromoBanner({ className = '' }: PromoBannerProps) {
  const { fetchBanners, incrementClickCount } = useBannerStore();
  const [banners, setBanners] = useState<any[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const loadBanners = async () => {
      try {
        await fetchBanners('promo', true);
        const storeBanners = useBannerStore.getState().banners;
        const promoBanners = storeBanners
          .filter((b: any) => b.position === 'promo' && b.isActive)
          .sort((a: any, b: any) => (a.priority || 999) - (b.priority || 999));
        
        setBanners(promoBanners);
      } catch (error) {
        console.error('Failed to load promo banners:', error);
      }
    };

    loadBanners();
  }, [fetchBanners]);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const handleClick = async (banner: any) => {
    try {
      await incrementClickCount(banner._id);
      if (banner.linkUrl) {
        window.open(banner.linkUrl, '_blank');
      }
    } catch (error) {
      console.error('Error tracking banner click:', error);
    }
  };

  if (banners.length === 0) return null;

  const banner = banners[currentBanner];

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 group">
        <div className="relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.3'%3E%3Cpath d='M20 20c0 5.5-4.5 10-10 10s-10-4.5-10-10 4.5-10 10-10 10 4.5 10 10zM30 20c0 5.5-4.5 10-10 10s-10-4.5-10-10 4.5-10 10-10 10 4.5 10 10z'/%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>

          {/* Content */}
          <div className="relative px-8 py-8 md:px-12 md:py-12">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Left Content */}
              <div className="flex-1 text-white text-center lg:text-left">
                {/* Badge */}
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                  <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider">
                    🎯 Khuyến Mãi Đặc Biệt
                  </span>
                  <span className="bg-yellow-400 text-orange-900 px-3 py-1 rounded-full text-xs font-bold">
                    #{banner.priority}
                  </span>
                  {banners.length > 1 && (
                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs">
                      {currentBanner + 1}/{banners.length}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-4 leading-tight">
                  {banner.title}
                </h2>

                {/* Description */}
                {banner.description && (
                  <p className="text-lg md:text-xl text-white/90 mb-6 leading-relaxed max-w-2xl">
                    {banner.description}
                  </p>
                )}

                {/* CTA Button */}
                <button
                  onClick={() => handleClick(banner)}
                  className="inline-flex items-center gap-3 bg-white text-orange-600 hover:text-orange-700 px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl group/btn"
                >
                  <span>{banner.buttonText || 'Mua Ngay'}</span>
                  <svg className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>

              {/* Right Image */}
              <div className="flex-shrink-0">
                <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Image Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                  
                  {/* Floating Badge */}
                  <div className="absolute -top-3 -right-3 bg-yellow-400 text-orange-900 p-3 rounded-full font-bold text-sm shadow-lg animate-bounce">
                    HOT!
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Indicators */}
            {banners.length > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentBanner(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentBanner 
                        ? 'bg-white scale-125' 
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 bg-yellow-400/20 rounded-full blur-lg animate-pulse" style={{animationDelay: '1.5s'}}></div>
        </div>
      </div>
    </div>
  );
}
