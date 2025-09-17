import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import type { Product } from '../../../types/Product';

interface CategorySectionProps {
  title: string;
  category: string;
  products: Product[];
  onAddToCart: (product: Product) => void;
  viewMoreLink: string;
  productCount: number;
  titleClass?: string;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  category,
  products,
  onAddToCart,
  viewMoreLink,
  productCount,
  titleClass = '',
}) => {
  // Số sản phẩm chưa hiển thị
  const remainingCount = Math.max(productCount - products.length, 0);
  return (
    <div>
      <div className="mb-6">
        <div
          className={`relative px-4 py-3 rounded-xl shadow-xl border-l-8 border-green-500 bg-white/90 dark:bg-gray-800/90 flex items-center gap-3 w-fit max-w-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:bg-green-50 dark:hover:bg-gray-700 ${titleClass}`}
        >
          <span className="text-2xl md:text-3xl font-extrabold text-green-800 dark:text-green-300 tracking-wide drop-shadow-sm">
            {title}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={`${category}-${product.id}`} product={product} onAddToCart={onAddToCart} />
        ))}
      </div>
      {remainingCount > 0 && (
        <div className="flex justify-center mt-6">
          <Link
            to={viewMoreLink}
            className="border border-red-500 text-red-600 dark:text-red-400 px-6 py-2 rounded-xl font-medium text-lg tracking-wide bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 flex items-center gap-2"
          >
            <span>
              Xem thêm <span className="font-bold">{remainingCount}</span> sản phẩm{' '}
              <span className="font-bold">{title}</span>
            </span>
            <svg
              width="22"
              height="22"
              fill="none"
              viewBox="0 0 24 24"
              className="text-red-500"
            >
              <path
                d="M19 9l-7 7-7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CategorySection;
