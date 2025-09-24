import React from 'react';
import CategoryBanner from './home/sections/CategoryBanner';
import SaleBanner from './home/sections/SaleBanner';
import FeaturedBanner from './home/sections/FeaturedBanner';

interface DynamicBannerProps {
  filterType: 'all' | 'sale' | 'featured';
  categoryId?: string;
  className?: string;
}

const DynamicBanner: React.FC<DynamicBannerProps> = ({
  filterType,
  categoryId,
  className = '',
}) => {
  switch (filterType) {
    case 'sale':
      return <SaleBanner className={className} />;

    case 'featured':
      return <FeaturedBanner className={className} />;

    case 'all':
    default:
      return <CategoryBanner categoryId={categoryId} className={className} />;
  }
};

export default DynamicBanner;
