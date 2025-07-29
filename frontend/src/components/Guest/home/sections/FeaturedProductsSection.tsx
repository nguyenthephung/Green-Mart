import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/24/solid';
import ProductCard from '../ProductCard';

interface FeaturedProductsSectionProps {
  featuredProducts: any[];
  handleAddToCart: (product: any, event?: React.MouseEvent) => void;
}

const FeaturedProductsSection: React.FC<FeaturedProductsSectionProps> = ({ featuredProducts, handleAddToCart }) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
    <div className="text-center mb-12">
      <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-white font-bold text-lg shadow-xl mb-4">
        <StarIcon className="w-7 h-7 animate-spin" />
        <span>Sản Phẩm Nổi Bật</span>
        <div className="w-2 h-2 bg-yellow-300 rounded-full animate-bounce"></div>
      </div>
      <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text text-transparent mb-4">
        Được Yêu Thích Nhất
      </h2>
      <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
        Những sản phẩm được khách hàng đánh giá cao và mua nhiều nhất tại GreenMart
      </p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {featuredProducts.map((product) => (
        <div key={product.id} className="relative transform-gpu">
          <div className="absolute top-1 right-1 z-20">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-1.5 py-0.5 rounded-md text-xs font-bold shadow-lg flex items-center gap-1">
              <StarIcon className="w-3 h-3" />
              HOT
            </div>
          </div>
          <ProductCard 
            product={product} 
            onAddToCart={handleAddToCart} 
            showHotBadge={false}
          />
        </div>
      ))}
    </div>
    <div className="text-center mt-12">
      <Link 
        to="/category?featured=true"
        className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-transform duration-300 shadow-xl"
      >
        Xem Tất Cả Sản Phẩm Nổi Bật
        <StarIcon className="w-5 h-5" />
      </Link>
    </div>
  </div>
);

export default FeaturedProductsSection;
