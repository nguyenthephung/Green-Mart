import React from 'react';
import { Link } from 'react-router-dom';
import { FireIcon } from '@heroicons/react/24/solid';
import ProductCard from '../ProductCard';

interface SaleSectionProps {
  saleProducts: any[];
  handleAddToCart: (product: any, event?: React.MouseEvent) => void;
}

const SaleSection: React.FC<SaleSectionProps> = ({ saleProducts, handleAddToCart }) => {
  if (!saleProducts.length) return null;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
      <div className="text-center mb-12 min-h-[200px] flex flex-col justify-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-white font-bold text-lg shadow-xl mb-4">
          <FireIcon className="w-7 h-7 animate-pulse" />
          <span>Ưu Đãi Hôm Nay</span>
          <div className="w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
        </div>
        <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-4 leading-tight">
          Flash Sale
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
          Cơ hội vàng! Giảm giá sốc chỉ có hôm nay. Nhanh tay trước khi hết hàng!
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {saleProducts.map((product) => (
          <div key={product.id} className="relative transform-gpu">
            <div className="absolute top-1 left-1 z-20">
              <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-1.5 py-0.5 rounded-md text-xs font-bold shadow-lg">
                🔥 SALE
              </span>
            </div>
            <ProductCard 
              product={product} 
              onAddToCart={handleAddToCart} 
              showSaleBadge={false}
            />
          </div>
        ))}
      </div>
      <div className="text-center mt-12">
        <Link 
          to="/category?sale=true"
          className="inline-flex items-center gap-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-transform duration-300 shadow-xl"
        >
          Xem Tất Cả Ưu Đãi
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default SaleSection;
