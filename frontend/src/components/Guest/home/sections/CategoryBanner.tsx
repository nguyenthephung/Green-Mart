import { useState, useEffect } from 'react';
import { useBannerStore } from '../../../../stores/useBannerStore';
import { useCategoryStore } from '../../../../stores/useCategoryStore';
import { Link } from 'react-router-dom';

interface CategoryBannerProps {
  categoryId?: string;
  className?: string;
}

export default function CategoryBanner({ categoryId, className = '' }: CategoryBannerProps) {
  const { fetchBanners, incrementClickCount } = useBannerStore();
  const { categories } = useCategoryStore();
  const [categoryBanners, setCategoryBanners] = useState<any[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    const loadBanners = async () => {
      try {
        await fetchBanners('category', true);
        const storeBanners = useBannerStore.getState().banners;
        
        // Get all active category banners
        let banners = storeBanners.filter((b: any) => 
          b.position === 'category' && b.isActive
        );
        
        // If categoryId is specified, filter by that category
        if (categoryId) {
          banners = banners.filter((b: any) => b.categoryId === categoryId);
        }
        
        // Sort by priority
        banners.sort((a: any, b: any) => (a.priority || 999) - (b.priority || 999));
        setCategoryBanners(banners);
      } catch (error) {
        console.error('Failed to load category banners:', error);
      }
    };

    loadBanners();
  }, [fetchBanners, categoryId]);

  // Auto-rotate banners every 5 seconds
  useEffect(() => {
    if (categoryBanners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % categoryBanners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [categoryBanners.length]);

  const handleClick = async (banner: any) => {
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

  if (categoryBanners.length === 0) return null;

  const activeBanner = categoryBanners[currentBannerIndex];
  const linkedCategory = categories.find(cat => cat.id === activeBanner.categoryId);

  return (
    <div className={`w-full ${className}`}>
      <div 
        onClick={() => handleClick(activeBanner)}
        className="bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 rounded-2xl cursor-pointer group transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl overflow-hidden"
      >
        <div className="relative p-6">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.3'%3E%3Cpath d='M25 25m-8 0a8,8 0 1,1 16,0a8,8 0 1,1 -16,0'/%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>

          <div className="relative flex items-center justify-between">
            {/* Content */}
            <div className="flex-1 text-white">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold mb-3">
                <span>🗂️ Danh Mục</span>
                {linkedCategory && <span>• {linkedCategory.name}</span>}
              </div>

              {/* Title */}
              <h3 className="text-xl md:text-2xl font-bold mb-2">
                {activeBanner.title}
              </h3>

              {/* Description */}
              {activeBanner.description && (
                <p className="text-white/90 text-sm mb-4 max-w-md">
                  {activeBanner.description}
                </p>
              )}

              {/* CTA */}
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center gap-2 text-white group-hover:gap-3 transition-all">
                  <span className="font-semibold">{activeBanner.buttonText || 'Xem danh mục'}</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                
                {linkedCategory && (
                  <Link
                    to={`/category/${linkedCategory.name.toLowerCase()}`}
                    className="text-white/80 hover:text-white font-medium text-sm border border-white/30 px-3 py-1 rounded-lg hover:bg-white/10 transition-all duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Xem danh mục
                  </Link>
                )}
              </div>
            </div>

            {/* Image */}
            <div className="flex-shrink-0 ml-4">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-300">
                <img
                  src={activeBanner.imageUrl}
                  alt={activeBanner.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Progress Indicators */}
          {categoryBanners.length > 1 && (
            <div className="absolute bottom-4 left-6 flex gap-2">
              {categoryBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentBannerIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentBannerIndex 
                      ? 'bg-white scale-125' 
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Banner Count */}
          {categoryBanners.length > 1 && (
            <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
              {currentBannerIndex + 1}/{categoryBanners.length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
