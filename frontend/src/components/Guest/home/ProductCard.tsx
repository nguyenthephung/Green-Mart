import React, { useRef, memo, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import { Heart } from 'lucide-react';
import { useWishlistStore } from '../../../stores/useWishlistStore';
import { useUserStore } from '../../../stores/useUserStore';
import { useFlashSaleStore } from '../../../stores/useFlashSaleStore';
import { useAddToCartAnimation } from '../../../hooks/useAddToCartAnimation';
import StarRating from '../../ui/StarRating';
import type { Product } from '../../../types/Product';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  showSaleBadge?: boolean;
  showHotBadge?: boolean;
  quantity?: number;
  onQuantityChange?: (value: number) => void;
  imageHeight?: string; // tailwind height class, e.g. 'h-40', 'h-56'
}

const ProductCard: React.FC<ProductCardProps> = memo(({ product, onAddToCart, showSaleBadge = true, showHotBadge = false, quantity = 1, onQuantityChange, imageHeight = 'h-40' }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const { triggerAnimation } = useAddToCartAnimation();
  
  // Wishlist store hooks
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const user = useUserStore(state => state.user);
  
  // Flash Sale store hooks
  const { getFlashSaleForProduct } = useFlashSaleStore();
  
  // Check if product is in active Flash Sale
  const flashSaleInfo = useMemo(() => {
    if (!product.id) return null;
    return getFlashSaleForProduct(product.id.toString());
  }, [product.id, getFlashSaleForProduct]);
  
  // Calculate display price and discount info
  const priceInfo = useMemo(() => {
    if (flashSaleInfo) {
      const { product: flashProduct } = flashSaleInfo;
      return {
        currentPrice: flashProduct.flashSalePrice,
        originalPrice: flashProduct.originalPrice,
        isFlashSale: true,
        discountPercentage: flashProduct.discountPercentage,
        remainingStock: flashProduct.quantity - flashProduct.sold
      };
    } else if (product.isSale && product.salePrice && product.salePrice < product.price) {
      return {
        currentPrice: product.salePrice,
        originalPrice: product.price,
        isFlashSale: false,
        discountPercentage: Math.round((1 - product.salePrice / product.price) * 100),
        remainingStock: null
      };
    } else {
      return {
        currentPrice: product.price,
        originalPrice: null,
        isFlashSale: false,
        discountPercentage: 0,
        remainingStock: null
      };
    }
  }, [product, flashSaleInfo]);

  // Memoize cart handler with modern animation and Flash Sale support
  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Create product with correct price and Flash Sale info
    const productToAdd = {
      ...product,
      price: priceInfo.currentPrice, // Use Flash Sale price if available
      flashSale: flashSaleInfo ? {
        flashSaleId: flashSaleInfo.flashSale._id,
        isFlashSale: true,
        originalPrice: priceInfo.originalPrice!,
        discountPercentage: priceInfo.discountPercentage
      } : undefined
    };
    
    if (imgRef.current) {
      triggerAnimation({
        sourceElement: imgRef.current,
        onComplete: () => {
          onAddToCart(productToAdd);
        }
      });
    } else {
      onAddToCart(productToAdd);
    }
  }, [product, onAddToCart, triggerAnimation, priceInfo, flashSaleInfo]);

  const handleWishlistToggle = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!user) {
      // Redirect to login or show login modal
      alert('Vui lòng đăng nhập để sử dụng tính năng này');
      return;
    }

    try {
      if (product.id && isInWishlist(product.id.toString())) {
        await removeFromWishlist(product.id.toString());
      } else if (product.id) {
        await addToWishlist({
          id: product.id,
          name: product.name,
          price: priceInfo.currentPrice,
          originalPrice: priceInfo.originalPrice,
          discount: priceInfo.originalPrice ? priceInfo.discountPercentage : undefined,
          image: product.image,
          category: product.category,
          inStock: true
        });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  }, [user, isInWishlist, removeFromWishlist, addToWishlist, product, priceInfo]);

  return (
    <div className={`bg-white dark:bg-gray-800 p-2 sm:p-4 rounded-xl shadow-xl transform transition-all duration-400 hover:shadow-2xl dark:shadow-gray-900/50 hover:-translate-y-2 perspective-1000 relative flex flex-col h-full ${showHotBadge ? 'border-4 border-yellow-400 animate-pulse' : ''}`}> 
      {showHotBadge && (
        <div className="absolute top-2 left-2 z-20 flex items-center gap-1">
          <span className="bg-yellow-400 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg flex items-center">
            <svg className="w-4 h-4 mr-1 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z"/></svg>
            Nổi bật
          </span>
        </div>
      )}
      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 z-10 ${
          user && product.id && isInWishlist(product.id.toString())
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-white dark:bg-gray-700 text-gray-400 dark:text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
        } shadow-md hover:shadow-lg`}
        title={user && product.id && isInWishlist(product.id.toString()) ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
      >
        <Heart size={16} className={user && product.id && isInWishlist(product.id.toString()) ? 'fill-current' : ''} />
      </button>

      <Link to={`/productdetail/${product.id}`}>
        {product.image ? (
          <img
            ref={imgRef}
            src={product.image}
            alt={product.name}
            className={`w-full ${imageHeight} object-cover rounded-lg transform transition-transform duration-300 hover:scale-105`}
          />
        ) : null}
      </Link>
      <h4 className="text-sm sm:text-lg font-medium mt-2 text-gray-900 dark:text-gray-100 line-clamp-2">{product.name}</h4>
      
      {/* Rating - Always show, even when 0 */}
      <div className="mt-1">
        <StarRating 
          rating={product.averageRating || 0} 
          size="sm"
          showValue={(product.averageRating || 0) > 0}
          showCount={(product.averageRating || 0) > 0}
          count={product.totalRatings || 0}
        />
      </div>
      
      {/* Giá và badge: luôn chiếm cùng chiều cao */}
      <div className="min-h-[38px] flex items-end">
          {(priceInfo.isFlashSale && priceInfo.remainingStock !== null && priceInfo.remainingStock > 0) ? (
            <div className="flex flex-wrap items-center gap-1 mt-1 w-full">
              <span className="text-gray-400 dark:text-gray-500 line-through text-xs sm:text-sm truncate">
                {priceInfo.originalPrice?.toLocaleString('vi-VN')}đ
              </span>
              <span className="text-red-600 dark:text-red-400 font-bold text-sm sm:text-lg truncate">
                {priceInfo.currentPrice.toLocaleString('vi-VN')}đ
              </span>
              <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap animate-pulse">
                ⚡ FLASH SALE
              </span>
              {priceInfo.remainingStock !== null && (
                <span className="bg-orange-100 text-orange-800 text-xs px-1 py-0.5 rounded whitespace-nowrap">
                  Còn {priceInfo.remainingStock}
                </span>
              )}
            </div>
          ) : priceInfo.originalPrice && showSaleBadge ? (
          <div className="flex flex-wrap items-center gap-1 mt-1 w-full">
            <span className="text-gray-400 dark:text-gray-500 line-through text-xs sm:text-sm truncate">
              {priceInfo.originalPrice.toLocaleString('vi-VN')}đ
            </span>
            <span className="text-red-600 dark:text-red-400 font-bold text-sm sm:text-lg truncate">
              {priceInfo.currentPrice.toLocaleString('vi-VN')}đ
            </span>
            <span className="bg-red-500 dark:bg-red-600 text-white text-xs font-semibold px-1 py-0.5 rounded whitespace-nowrap">SALE</span>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base truncate w-full">
            {priceInfo.currentPrice.toLocaleString('vi-VN')}đ
          </p>
        )}
      </div>

      {/* Khối lượng (nếu có onQuantityChange) */}
      {onQuantityChange && (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm font-semibold text-gray-700">Khối lượng:</span>
          <input
            type="number"
            min={0.1}
            step={0.1}
            value={quantity}
            onChange={e => onQuantityChange(Math.max(0.1, Number(e.target.value)))}
            className="w-16 px-2 py-1 rounded border border-gray-300 text-right"
          />
          <span className="text-sm text-gray-500">kg</span>
        </div>
      )}

      <div className="mt-auto pt-2">
        <button
          onClick={handleAddToCart}
          className="w-full bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white px-2 sm:px-4 py-2 rounded-md shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gpu-accelerated text-xs sm:text-sm"
        >
          <FaShoppingCart className="mr-1 sm:mr-2 text-xs sm:text-sm" /> 
          <span className="hidden sm:inline">Thêm Vào Giỏ Hàng</span>
          <span className="sm:hidden">Thêm</span>
        </button>
      </div>
    </div>
  );
});

export default ProductCard;
