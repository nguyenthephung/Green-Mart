import React, { useState, useEffect } from 'react';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { useBannerStore } from '../../../../stores/useBannerStore';
import BannerImage from '../../../ui/BannerImage';

interface HeroSectionProps {
  isScrolling: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({ isScrolling }) => {
  const { fetchBanners, incrementClickCount } = useBannerStore();
  const [heroBanners, setHeroBanners] = useState<any[]>([]);
  const [currentHeroBanner, setCurrentHeroBanner] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHeroBanners = async () => {
      try {
        setIsLoading(true);
        await fetchBanners('hero', true);
        const state = useBannerStore.getState();
        const herobanners = state.banners.filter((b: any) => 
          b.position === 'hero' && b.isActive
        );
        // Sort by priority (lower number = higher priority)
        herobanners.sort((a: any, b: any) => a.priority - b.priority);
        setHeroBanners(herobanners);
      } catch (error) {
  // ...existing code (đã xóa log)...
      } finally {
        setIsLoading(false);
      }
    };

    loadHeroBanners();
  }, [fetchBanners]);

  // Auto-rotate hero banners if multiple exist
  useEffect(() => {
    if (heroBanners.length > 1) {
      const interval = setInterval(() => {
        setCurrentHeroBanner((prev) => (prev + 1) % heroBanners.length);
      }, 6000); // Change every 6 seconds
      return () => clearInterval(interval);
    }
  }, [heroBanners.length]);

  const handleBannerClick = async (e?: React.MouseEvent) => {
    // Ngăn sự kiện nổi bọt nếu click từ button
    if (e) e.stopPropagation();
    const activeBanner = heroBanners[currentHeroBanner];
    if (activeBanner) {
      try {
        await incrementClickCount(activeBanner._id);
        if (activeBanner.linkUrl) {
          window.location.href = activeBanner.linkUrl;
        }
      } catch (error) {
  // ...existing code (đã xóa log)...
      }
    }
  };

  // Only show database banners, no fallback to default slides
  const activeBanner = heroBanners[currentHeroBanner];

  return (
  <div
    className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden mb-16 carousel-container"
    style={{
      marginTop: 0,
      paddingTop: 0,
    }}
  >
    {heroBanners.length > 0 && activeBanner ? (
      /* Hero Banner Mode - Only Database Banners */
      <div
        className="absolute inset-0 transition-all duration-1000 cursor-pointer"
        // Xóa onClick ở div để tránh double count
      >
        <BannerImage
          src={activeBanner.imageUrl}
          alt={activeBanner.title}
          className="absolute inset-0 w-full h-full"
          fallbackIcon="🏆"
          fallbackText="Hero Banner"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30"></div>
        
        {/* Hero Banner Content */}
        <div className="absolute inset-0 flex items-center justify-center text-white text-center p-6">
          <div className="max-w-6xl mx-auto">
            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black drop-shadow-2xl mb-6 leading-tight">
              <span className="bg-gradient-to-r from-emerald-300 to-green-200 bg-clip-text text-transparent">
                {activeBanner.title}
              </span>
            </h1>
            
            {/* Description */}
            {activeBanner.description && (
              <p className="text-xl md:text-2xl mb-8 drop-shadow-lg font-light text-green-100 max-w-3xl mx-auto leading-relaxed">
                {activeBanner.description}
              </p>
            )}
            
            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleBannerClick}
                className="group bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-4 rounded-2xl shadow-2xl hover:shadow-emerald-500/25 hover:scale-105 transition-all duration-300 text-lg font-bold tracking-wide flex items-center gap-3"
              >
                <SparklesIcon className={`w-6 h-6 ${isScrolling ? '' : 'animate-pulse'}`} />
                {activeBanner.buttonText || 'Khám Phá Ngay'}
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* Banner Info */}
          </div>
        </div>
        
        {/* Banner Navigation Dots */}
        {heroBanners.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
            {heroBanners.map((_, idx) => (
              <button
                key={idx}
                className={`transition-all duration-300 ${idx === currentHeroBanner ? 'w-8 h-3 bg-emerald-400 rounded-full' : 'w-3 h-3 bg-white/50 rounded-full hover:bg-white/70'}`}
                onClick={() => setCurrentHeroBanner(idx)}
                aria-label={`Chuyển đến banner ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    ) : (
      /* Loading or no banners - show default gradient */
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
        {!isLoading && (
          <div className="text-center text-white p-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Green Mart
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Nơi mua sắm xanh cho cuộc sống tốt đẹp hơn
            </p>
          </div>
        )}
      </div>
    )}

    {/* Navigation Arrows - Only for Database Banners */}
    {heroBanners.length > 1 && (
      <>
        <button
          className="absolute left-6 top-1/2 -translate-y-1/2 z-40 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-full p-3 shadow-xl transition-all border border-white/20"
          onClick={() => {
            setCurrentHeroBanner((currentHeroBanner - 1 + heroBanners.length) % heroBanners.length);
          }}
          aria-label="Banner trước"
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          className="absolute right-6 top-1/2 -translate-y-1/2 z-40 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-full p-3 shadow-xl transition-all border border-white/20"
          onClick={() => {
            setCurrentHeroBanner((currentHeroBanner + 1) % heroBanners.length);
          }}
          aria-label="Banner sau"
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </>
    )}
  </div>
  );
};

export default HeroSection;
