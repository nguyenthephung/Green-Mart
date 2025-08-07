import { useState, useEffect } from 'react';
import { useBannerStore } from '../../../../stores/useBannerStore';
import { useCategoryStore } from '../../../../stores/useCategoryStore';
import { Link } from 'react-router-dom';
import BannerImage from '../../../ui/BannerImage';

interface CategoryBannerProps {
  categoryId?: string;
  className?: string;
}

export default function CategoryBanner({ categoryId, className = '' }: CategoryBannerProps) {
  const { fetchBanners, incrementClickCount } = useBannerStore();
  const { categories } = useCategoryStore();
  const [categoryBanners, setCategoryBanners] = useState<any[]>([]);

  useEffect(() => {
    const loadBanners = async () => {
      try {
        await fetchBanners('category', true);
        const storeBanners = useBannerStore.getState().banners;
        
        // Get all active category banners
        let banners = storeBanners.filter((b: any) => 
          b.position === 'category' && b.isActive
        );
        
        console.log('All category banners found:', banners);
        console.log('CategoryId filter:', categoryId);
        
        // If categoryId is specified, filter by that category
        if (categoryId) {
          banners = banners.filter((b: any) => b.categoryId === categoryId);
          console.log('Filtered banners by categoryId:', banners);
        }
        
        // Sort by priority
        banners.sort((a: any, b: any) => (a.priority || 999) - (b.priority || 999));
        console.log('Final banners to display:', banners);
        setCategoryBanners(banners);
      } catch (error) {
        console.error('Failed to load category banners:', error);
      }
    };

    loadBanners();
  }, [fetchBanners, categoryId]);

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

  // Hiển thị tất cả banners thay vì chỉ 1 banner
  return (
    <div className={`w-full ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoryBanners.map((banner, index) => {
          const linkedCategory = categories.find(cat => cat.id === banner.categoryId);
          
          return (
            <div key={banner._id || index} className="relative group">
              <div 
                className="relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => handleClick(banner)}
              >
                <BannerImage
                  src={banner.imageUrl}
                  alt={banner.title || `Banner ${index + 1}`}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6">
                  {banner.title && (
                    <h3 className="text-white text-xl font-bold mb-2 drop-shadow-lg">
                      {banner.title}
                    </h3>
                  )}
                  
                  {banner.description && (
                    <p className="text-white/90 text-sm mb-3 drop-shadow-lg line-clamp-2">
                      {banner.description}
                    </p>
                  )}

                  {(banner.linkUrl || linkedCategory) && (
                    <div className="flex gap-2">
                      {banner.linkUrl && banner.buttonText && (
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                          {banner.buttonText}
                        </button>
                      )}
                      
                      {linkedCategory && (
                        <Link
                          to={`/category/${linkedCategory.name.toLowerCase()}`}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                        >
                          Xem {linkedCategory.name}
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
