import React, { useRef, memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import { Heart } from 'lucide-react';
import { useWishlistStore } from '../../../stores/useWishlistStore';
import { useUserStore } from '../../../stores/useUserStore';

export interface Product {
  id: string | number;
  name: string;
  price: string;
  salePrice?: string;
  isSale?: boolean;
  image: string;
  category: string;
  isFeatured?: boolean;
  unit?: string; // Added unit property
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  showSaleBadge?: boolean;
  showHotBadge?: boolean;
  quantity?: number;
  onQuantityChange?: (value: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = memo(({ product, onAddToCart, showSaleBadge = true, quantity = 1, onQuantityChange }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Wishlist store hooks
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const user = useUserStore(state => state.user);

  // Memoize cart handler with animation effect
  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (imgRef.current) {
      const img = imgRef.current;
      const cartIcon = document.getElementById('cart-fly-icon');
      if (cartIcon) {
        const imgRect = img.getBoundingClientRect();
        const cartRect = cartIcon.getBoundingClientRect();
        const clone = img.cloneNode(true) as HTMLImageElement;
        clone.style.position = 'fixed';
        clone.style.left = imgRect.left + 'px';
        clone.style.top = imgRect.top + 'px';
        clone.style.width = imgRect.width + 'px';
        clone.style.height = imgRect.height + 'px';
        clone.style.zIndex = '9999';
        clone.style.transition = 'all 3s cubic-bezier(.4,2,.6,1)';
        clone.style.transform = 'scale(1) rotateY(0deg)';
        document.body.appendChild(clone);
        setTimeout(() => {
          // Tính toán vị trí trung tâm của icon giỏ hàng
          const targetLeft = cartRect.left + cartRect.width / 2 - imgRect.width / 4;
          const targetTop = cartRect.top + cartRect.height / 2 - imgRect.height / 4;
          clone.style.left = targetLeft + 'px';
          clone.style.top = targetTop + 'px';
          clone.style.width = imgRect.width / 2 + 'px';
          clone.style.height = imgRect.height / 2 + 'px';
          clone.style.opacity = '0.7';
          clone.style.transform = 'scale(0.5)';
          clone.style.boxShadow = '0 8px 32px 0 rgba(34,197,94,0.4)';
        }, 10);
        setTimeout(() => {
          document.body.removeChild(clone);
        }, 2500);
      }
    }
    onAddToCart(product);
  }, [product, onAddToCart]);

  const handleWishlistToggle = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!user) {
      // Redirect to login or show login modal
      alert('Vui lòng đăng nhập để sử dụng tính năng này');
      return;
    }

    try {
      if (isInWishlist(product.id.toString())) {
        await removeFromWishlist(product.id.toString());
      } else {
        // Chuyển đổi price string thành number
        const priceStr = product.salePrice || product.price;
        const priceNumber = parseFloat(priceStr.replace(/[^\d]/g, ''));
        const originalPriceNumber = product.isSale ? parseFloat(product.price.replace(/[^\d]/g, '')) : undefined;
        await addToWishlist({
          id: product.id,
          name: product.name,
          price: priceNumber,
          originalPrice: originalPriceNumber,
          discount: product.isSale && originalPriceNumber ? Math.round((1 - priceNumber / originalPriceNumber) * 100) : undefined,
          image: product.image,
          category: product.category,
          inStock: true
        });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  }, [user, isInWishlist, removeFromWishlist, addToWishlist, product]);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl transform transition-all duration-400 hover:shadow-2xl dark:shadow-gray-900/50 hover:-translate-y-2 perspective-1000 relative flex flex-col h-full">
      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 z-10 ${
          user && isInWishlist(product.id.toString())
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-white dark:bg-gray-700 text-gray-400 dark:text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
        } shadow-md hover:shadow-lg`}
        title={user && isInWishlist(product.id.toString()) ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
      >
        <Heart size={16} className={user && isInWishlist(product.id.toString()) ? 'fill-current' : ''} />
      </button>

      <Link to={`/productdetail/${product.id}`}>
        {product.image ? (
          <img
            ref={imgRef}
            src={product.image}
            alt={product.name}
            className="w-full h-40 object-cover rounded-lg transform transition-transform duration-300 hover:scale-105"
          />
        ) : null}
      </Link>
      <h4 className="text-lg font-medium mt-2 text-gray-900 dark:text-gray-100">{product.name}</h4>
      {/* Giá và badge: luôn chiếm cùng chiều cao */}
      <div className="min-h-[38px] flex items-end">
        {product.isSale && showSaleBadge ? (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-gray-400 dark:text-gray-500 line-through text-sm">{product.price}</span>
            <span className="text-red-600 dark:text-red-400 font-bold text-lg">{product.salePrice}</span>
            <span className="ml-2 bg-red-500 dark:bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">SALE</span>
          </div>
        ) : product.isSale ? (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-gray-400 dark:text-gray-500 line-through text-sm">{product.price}</span>
            <span className="text-red-600 dark:text-red-400 font-bold text-lg">{product.salePrice}</span>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-300 mt-1">{product.price}</p>
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
          className="w-full bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white px-4 py-2 rounded-md shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gpu-accelerated"
        >
          <FaShoppingCart className="mr-2" /> Thêm Vào Giỏ Hàng
        </button>
      </div>
    </div>
  );
});

export default ProductCard;
