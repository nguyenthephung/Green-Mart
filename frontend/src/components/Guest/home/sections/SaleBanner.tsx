import { useState, useEffect } from 'react';
import { useBannerStore } from '../../../../stores/useBannerStore';

interface SaleBannerProps {
  className?: string;
}

export default function SaleBanner({ className = '' }: SaleBannerProps) {
  const { fetchBanners, incrementClickCount } = useBannerStore();
  const [banners, setBanners] = useState<any[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const loadBanners = async () => {
      try {
        await fetchBanners('sale', true);
        const storeBanners = useBannerStore.getState().banners;
        const saleBanners = storeBanners
          .filter((b: any) => b.position === 'sale' && b.isActive)
          .sort((a: any, b: any) => (a.priority || 999) - (b.priority || 999));
        
        setBanners(saleBanners);
      } catch (error) {
        console.error('Failed to load sale banners:', error);
      }
    };

    loadBanners();
  }, [fetchBanners]);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 3000);
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
      <div className="bg-gradient-to-r from-red-500 via-pink-500 to-rose-600 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group relative">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-red-400/50 to-pink-400/50 animate-pulse"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.4'%3E%3Cpath d='M20 0l4 16h16l-12 8 4 16-12-8-12 8 4-16-12-8h16z'/%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Left Content */}
            <div className="flex-1 text-white text-center md:text-left">
              {/* Sale Badge */}
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <span className="bg-yellow-400 text-red-900 px-4 py-2 rounded-full text-sm font-black uppercase tracking-wider animate-bounce">
                  🔥 SALE HOT
                </span>
                {banners.length > 1 && (
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                    {currentBanner + 1}/{banners.length}
                  </span>
                )}
              </div>

              {/* Title with Animation */}
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-black mb-4 leading-tight animate-pulse">
                {banner.title}
              </h3>

              {/* Description */}
              {banner.description && (
                <p className="text-lg text-white/95 mb-6 leading-relaxed max-w-2xl">
                  {banner.description}
                </p>
              )}

              {/* CTA Button */}
              <button
                onClick={() => handleClick(banner)}
                className="inline-flex items-center gap-3 bg-white text-red-600 hover:text-red-700 px-8 py-4 rounded-2xl text-lg font-black transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl group/btn transform hover:rotate-1"
              >
                <span>{banner.buttonText || 'MUA NGAY'}</span>
                <svg className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>

            {/* Right Image */}
            <div className="flex-shrink-0 relative">
              <div className="w-56 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-2xl group-hover:scale-110 transition-transform duration-500 relative">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Sale Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-red-600/30 to-transparent"></div>
                
                {/* Sale Badge on Image */}
                <div className="absolute -top-3 -right-3 bg-yellow-400 text-red-900 px-4 py-2 rounded-full font-black text-sm shadow-lg rotate-12 animate-pulse">
                  SALE!
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-2 -left-2 w-8 h-8 bg-yellow-400 rounded-full animate-ping"></div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-white rounded-full animate-bounce"></div>
            </div>
          </div>

          {/* Progress Indicators */}
          {banners.length > 1 && (
            <div className="flex justify-center mt-6 gap-2">
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

        {/* Corner Decorations */}
        <div className="absolute top-4 right-4 w-16 h-16 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/20 rounded-full blur-lg animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
    </div>
  );
}
