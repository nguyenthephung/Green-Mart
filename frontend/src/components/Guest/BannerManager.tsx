import { useEffect } from 'react';
import { useBannerStore } from '../../stores/useBannerStore';

// Import all banner components
import SidebarBanner from './home/sections/SidebarBanner';
import CategoryBanner from './home/sections/CategoryBanner';
import SaleBanner from './home/sections/SaleBanner';
import FeaturedBanner from './home/sections/FeaturedBanner';

interface BannerManagerProps {
  page: 'home' | 'category' | 'search' | 'product' | 'cart' | 'checkout';
  categoryId?: string;
  className?: string;
}

export default function BannerManager({ page, categoryId, className = '' }: BannerManagerProps) {
  const { fetchBanners } = useBannerStore();

  useEffect(() => {
    const loadBanners = async () => {
      try {
        // Load all active banners
        await fetchBanners();
      } catch (error) {
        console.error('Failed to load banners:', error);
      }
    };

    loadBanners();
  }, [fetchBanners, page]);

  // Define which banners to show on each page
  const getBannersForPage = () => {
    const bannerConfig = {
      home: {
        sidebar: true,
        sale: true,
        featured: true,
        category: true,
        showInSections: true
      },
      category: {
        sidebar: true,
        category: true,
        sale: false,
        featured: false,
        showInSections: false
      },
      search: {
        sidebar: true,
        sale: true,
        featured: false,
        category: false,
        showInSections: false
      },
      product: {
        sidebar: true,
        sale: false,
        featured: true,
        category: false,
        showInSections: false
      },
      cart: {
        sidebar: false,
        sale: false,
        featured: false,
        category: false,
        showInSections: false
      },
      checkout: {
        sidebar: false,
        sale: false,
        featured: false,
        category: false,
        showInSections: false
      }
    };

    return bannerConfig[page] || {};
  };

  const config = getBannersForPage();

  return (
    <div className={`banner-manager ${className}`}>
      {/* Sidebar Banner - Shows on most pages except cart/checkout */}
      {config.sidebar && <SidebarBanner />}
      
      {/* Page-specific banners in content area */}
      <div className="banner-content space-y-8">
        {/* Sale Banner - Hot sales and deals */}
        {config.sale && (
          <div className="max-w-7xl mx-auto px-4 py-4">
            <SaleBanner className="shadow-lg" />
          </div>
        )}
        
        {/* Category Banner - Category-specific promotions */}
        {config.category && (
          <div className="max-w-7xl mx-auto px-4 py-4">
            <CategoryBanner categoryId={categoryId} className="shadow-lg" />
          </div>
        )}
        
        {/* Featured Banner - Highlight featured products */}
        {config.featured && (
          <div className="max-w-7xl mx-auto px-4 py-4">
            <FeaturedBanner className="shadow-lg" />
          </div>
        )}
      </div>
    </div>
  );
}
