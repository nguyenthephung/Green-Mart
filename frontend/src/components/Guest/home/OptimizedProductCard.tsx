import React, { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';

export interface Product {
  id: string | number;
  name: string;
  price: string;
  salePrice?: string;
  isSale?: boolean;
  image: string;
  category: string;
  isFeatured?: boolean;
}

interface OptimizedProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  showSaleBadge?: boolean;
}

const OptimizedProductCard: React.FC<OptimizedProductCardProps> = memo(
  ({ product, onAddToCart, showSaleBadge = true }) => {
    const handleAddToCart = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onAddToCart(product);
      },
      [product, onAddToCart]
    );

    const discountPercent =
      product.salePrice && product.price
        ? Math.round(
            ((parseFloat(product.price.replace(/[^0-9]/g, '')) -
              parseFloat(product.salePrice.replace(/[^0-9]/g, ''))) /
              parseFloat(product.price.replace(/[^0-9]/g, ''))) *
              100
          )
        : 0;

    return (
      <div className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 optimized-card overflow-hidden">
        <Link to={`/product/${product.id}`} className="block">
          <div className="relative overflow-hidden rounded-t-xl">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 lazy-image loaded"
              loading="lazy"
              decoding="async"
            />

            {/* Sale Badge */}
            {showSaleBadge && product.isSale && discountPercent > 0 && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                -{discountPercent}%
              </div>
            )}

            {/* Hot Badge */}
            {product.isFeatured && (
              <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                HOT
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 text-sm">
              {product.name}
            </h3>

            <div className="flex items-center gap-2 mb-3">
              {product.salePrice ? (
                <>
                  <span className="text-lg font-bold text-red-600 dark:text-red-400">
                    {product.salePrice}
                  </span>
                  <span className="text-sm text-gray-500 line-through">{product.price}</span>
                </>
              ) : (
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {product.price}
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-4 right-4 w-10 h-10 bg-brand-green hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 gpu-accelerated"
          aria-label="Add to cart"
        >
          <FaShoppingCart className="w-4 h-4" />
        </button>
      </div>
    );
  }
);

OptimizedProductCard.displayName = 'OptimizedProductCard';

export default OptimizedProductCard;
