import { useState, useEffect } from 'react';
import { useBannerStore } from '../../../../stores/useBannerStore';

interface SectionBannerProps {
  sectionType: 'sale' | 'categories' | 'featured';
  categoryId?: string; // For category-specific banners
  className?: string;
}

export default function SectionBanner({ sectionType, categoryId, className = '' }: SectionBannerProps) {
  const { fetchBanners, incrementClickCount } = useBannerStore();
  const [banner, setBanner] = useState<any>(null);

  useEffect(() => {
    const loadBanner = async () => {
      try {
        await fetchBanners(sectionType, true);
        const storeBanners = useBannerStore.getState().banners;
        const sectionBanners = storeBanners.filter((b: any) => {
          // Match position and categoryId if provided
          let matches = b.position === sectionType && b.isActive;
          if (categoryId && b.categoryId) {
            matches = matches && b.categoryId === categoryId;
          }
          return matches;
        });
        
        if (sectionBanners.length > 0) {
          setBanner(sectionBanners[0]);
        }
      } catch (error) {
        console.error('Failed to load section banner:', error);
      }
    };

    loadBanner();
  }, [fetchBanners, sectionType, categoryId]);

  const handleClick = async () => {
    if (banner) {
      try {
        await incrementClickCount(banner._id);
        if (banner.buttonLink) {
          window.location.href = banner.buttonLink;
        }
      } catch (error) {
        console.error('Error tracking banner click:', error);
      }
    }
  };

  if (!banner) return null;

  const getSectionStyle = (position: string) => {
    switch (position) {
      case 'sale':
        return {
          gradient: 'from-red-500 via-pink-500 to-orange-500',
          textColor: 'text-white',
          accent: '🔥',
          pattern: 'sale'
        };
      case 'featured':
        return {
          gradient: 'from-purple-600 via-indigo-600 to-blue-600',
          textColor: 'text-white',
          accent: '⭐',
          pattern: 'featured'
        };
      case 'promo':
        return {
          gradient: 'from-green-500 via-emerald-500 to-teal-500',
          textColor: 'text-white',
          accent: '🎯',
          pattern: 'promo'
        };
      default:
        return {
          gradient: 'from-blue-500 via-indigo-500 to-purple-600',
          textColor: 'text-white',
          accent: '✨',
          pattern: 'default'
        };
    }
  };

  const sectionStyle = getSectionStyle(sectionType);

  return (
    <div className={`relative overflow-hidden rounded-3xl cursor-pointer group transition-all duration-500 hover:scale-105 hover:shadow-2xl ${className}`}>
      {/* Dynamic Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${banner.backgroundColor || sectionStyle.gradient} opacity-95`} />
      
      {/* Animated Pattern Overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 animate-pulse" style={{
          backgroundImage: sectionStyle.pattern === 'sale' 
            ? `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpolygon points='30,0 45,25 30,50 15,25'/%3E%3C/g%3E%3C/svg%3E")`
            : sectionStyle.pattern === 'featured'
            ? `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 0l6.18 12.36L40 14.64l-10 9.8 2.36 13.56L20 32l-12.36 6L10 24.44l-10-9.8 13.82-2.28z'/%3E%3C/g%3E%3C/svg%3E")`
            : `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='25' cy='25' r='20'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Floating Decorative Elements */}
      <div className="absolute top-4 right-4 animate-bounce">
        <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl shadow-lg">
          {sectionStyle.accent}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative px-8 py-8 sm:px-10 sm:py-10" onClick={handleClick}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0 space-y-3">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-lg">{sectionStyle.accent}</span>
              <span className={`text-sm font-bold ${sectionStyle.textColor} uppercase tracking-wider`}>
                {sectionType === 'sale' ? 'Flash Sale' : sectionType === 'featured' ? 'Nổi Bật' : 'Khuyến Mãi'}
              </span>
            </div>
            
            {/* Title */}
            <h3 className={`text-2xl sm:text-3xl font-black ${banner.textColor || sectionStyle.textColor} mb-2 line-clamp-2 leading-tight`}>
              {banner.title}
            </h3>
            
            {/* Description */}
            {banner.description && (
              <p className={`text-base ${banner.textColor || sectionStyle.textColor} opacity-90 line-clamp-2 leading-relaxed`}>
                {banner.description}
              </p>
            )}
          </div>
          
          {/* Enhanced CTA Button */}
          <div className="ml-6 flex-shrink-0">
            <div className="group-hover:scale-110 transition-all duration-300">
              <div className="bg-white/90 hover:bg-white text-gray-900 px-6 py-3 rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/20 flex items-center gap-2 group-hover:gap-3 transition-all">
                <span>{banner.buttonText || 'Khám phá'}</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {banner.startDate && (
          <div className="mt-4 flex items-center gap-2 text-sm text-white/80">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span>Bắt đầu: {new Date(banner.startDate).toLocaleDateString('vi-VN')}</span>
          </div>
        )}
      </div>

      {/* Hover Shine Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-full group-hover:-translate-x-full transition-transform duration-1000" />
      </div>
    </div>
  );
}
