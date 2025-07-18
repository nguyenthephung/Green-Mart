import React, { useRef } from 'react';
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

 interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  showSaleBadge?: boolean;
  showHotBadge?: boolean;
}
const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const imgRef = useRef<HTMLImageElement>(null);

  const handleAddToCart = (e: React.MouseEvent) => {
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
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-xl transform transition-all duration-400 hover:shadow-2xl hover:-translate-y-2 perspective-1000 relative">
      <Link to={`/productdetail/${product.id}`}>
        <img
          ref={imgRef}
          src={product.image}
          alt={product.name}
          className="w-full h-40 object-cover rounded-lg transform transition-transform duration-300 hover:scale-105"
        />
      </Link>
      <h4 className="text-lg font-medium mt-2">{product.name}</h4>
      {product.isSale ? (
        <div className="flex items-center gap-2 mt-1">
          <span className="text-gray-400 line-through text-sm">{product.price}</span>
          <span className="text-red-600 font-bold text-lg">{product.salePrice}</span>
          <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">SALE</span>
        </div>
      ) : (
        <p className="text-gray-600">{product.price}</p>
      )}
      <button
        onClick={handleAddToCart}
        className="mt-2 w-full bg-green-600 text-white px-4 py-2 rounded-md shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
      >
        <FaShoppingCart className="mr-2" /> Thêm Vào Giỏ Hàng
      </button>
    </div>
  );
};

export default ProductCard;
