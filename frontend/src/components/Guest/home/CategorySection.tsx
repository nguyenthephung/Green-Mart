import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import type { Product } from './ProductCard';
interface CategorySectionProps {
  title: string;
  category: string;
  products: Product[];
  onAddToCart: (product: Product) => void;
  viewMoreLink: string;
  colorClass: string; // ví dụ "bg-red-600"
}

const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  products,
  onAddToCart,
  viewMoreLink,
  colorClass
}) => {
  return (
    <div>
      <div className="mb-4 flex justify-center">
        <div
          className="relative px-8 py-4 rounded-xl shadow-lg bg-white/80 border border-green-200 backdrop-blur-md flex items-center justify-center min-w-[220px] max-w-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:bg-white/90"
        >
          <span className="text-2xl font-bold text-green-700 drop-shadow-sm tracking-wide">
            {title}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
        ))}
      </div>
      <div className="text-center mt-4">
        <Link
          to={viewMoreLink}
          className={`inline-block ${colorClass} text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
        >
          Xem Thêm
        </Link>
      </div>
    </div>
  );
};

export default CategorySection;
