import React from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';

export interface Product {
  id: string | number;
  name: string;
  price: string;
  image: string;
  category: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-xl transform transition-all duration-400 hover:shadow-2xl hover:-translate-y-2 perspective-1000">
      <Link to={`/productdetail/${product.id}`}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-40 object-cover rounded-lg transform transition-transform duration-300 hover:scale-105"
        />
      </Link>
      <h4 className="text-lg font-medium mt-2">{product.name}</h4>
      <p className="text-gray-600">{product.price}</p>
      <button
        onClick={() => onAddToCart(product)}
        className="mt-2 w-full bg-green-600 text-white px-4 py-2 rounded-md shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
      >
        <FaShoppingCart className="mr-2" /> Thêm Vào Giỏ Hàng
      </button>
    </div>
  );
};

export default ProductCard;
