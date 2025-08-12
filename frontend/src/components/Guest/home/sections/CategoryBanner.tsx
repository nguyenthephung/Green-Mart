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

  // Hiển thị tất cả banners với thiết kế modern
  return (
    <div className={`w-full ${className}`}>
      {/* Section Header */}
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-4">
          🛍️ Khám Phá Danh Mục
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Tìm hiểu các sản phẩm tươi ngon và chất lượng theo từng danh mục
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categoryBanners.slice(0, 6).map((banner, index) => {
          const linkedCategory = categories.find(cat => cat.id === banner.categoryId);
          
          return (
            <div key={banner._id || index} className="group">
              <div 
                className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
                onClick={() => handleClick(banner)}
              >
                {/* Banner Image */}
                <div className="relative h-64 overflow-hidden">
                  <BannerImage
                    src={banner.imageUrl}
                    alt={banner.title || `Banner ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80"></div>
                  
                  {/* Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                      🔥 Hot
                    </span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  {banner.title && (
                    <h3 className="text-2xl font-bold mb-3 drop-shadow-lg">
                      {banner.title}
                    </h3>
                  )}
                  
                  {banner.description && (
                    <p className="text-white/90 mb-4 drop-shadow-lg line-clamp-2 leading-relaxed">
                      {banner.description}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {banner.linkUrl && banner.buttonText && banner.buttonText !== 'Xem thêm' && (
                      <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                        {banner.buttonText}
                      </button>
                    )}
                    
                    {linkedCategory && (
                      <Link
                        to={`/category/${linkedCategory.name.toLowerCase()}`}
                        className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 border border-white/30 hover:border-white/50"
                      >
                        {linkedCategory.name} →
                      </Link>
                    )}
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Call to Action */}
      {categoryBanners.length > 0 && (
        <div className="text-center mt-12">
          <Link
            to="/category"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span>🗂️</span>
            Xem Tất Cả Danh Mục
            <span>→</span>
          </Link>
        </div>
      )}
    </div>
  );
}
