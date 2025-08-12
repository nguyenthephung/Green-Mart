import { useState, useEffect } from 'react';
import { useBannerStore } from '../../../../stores/useBannerStore';

interface FeaturedBannerProps {
  className?: string;
}

export default function FeaturedBanner({ className = '' }: FeaturedBannerProps) {
  const { fetchBanners, incrementClickCount } = useBannerStore();
  const [banners, setBanners] = useState<any[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const loadBanners = async () => {
      try {
        await fetchBanners('featured', true);
        const storeBanners = useBannerStore.getState().banners;
        const featuredBanners = storeBanners
          .filter((b: any) => b.position === 'featured' && b.isActive)
          .sort((a: any, b: any) => (a.priority || 999) - (b.priority || 999));
        
        setBanners(featuredBanners);
      } catch (error) {
        console.error('Failed to load featured banners:', error);
      }
    };

    loadBanners();
  }, [fetchBanners]);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 5000);
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
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group">
        <div className="relative p-6 md:p-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cstar cx='30' cy='30' r='8'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>

          <div className="relative flex flex-col md:flex-row items-center gap-6">
            {/* Content */}
            <div className="flex-1 text-white text-center md:text-left">
              {/* Badge */}
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <span className="bg-yellow-400 text-purple-900 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider">
                  ⭐ Nổi Bật
                </span>
                {banners.length > 1 && (
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs">
                    {currentBanner + 1}/{banners.length}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-black mb-3 leading-tight">
                {banner.title}
              </h3>

              {/* Description */}
              {banner.description && (
                <p className="text-lg text-white/90 mb-4 leading-relaxed max-w-xl">
                  {banner.description}
                </p>
              )}

              {/* CTA Button */}
              <button
                onClick={() => handleClick(banner)}
                className="inline-flex items-center gap-3 bg-white text-purple-700 hover:text-purple-800 px-6 py-3 rounded-xl text-base font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span>{banner.buttonText || 'Khám phá'}</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>

            {/* Image */}
            <div className="flex-shrink-0">
              <div className="w-56 h-40 md:w-80 md:h-56 rounded-xl overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Progress Indicators */}
          {banners.length > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBanner(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentBanner 
                      ? 'bg-white scale-125' 
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
