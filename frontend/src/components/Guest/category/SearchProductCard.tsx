import { ShoppingCart } from 'lucide-react';
import type { FC } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  categoryId: number;
}

const SearchProductCard: FC<{ product: Product }> = ({ product }) => {
  return (
    <div className="border p-4 rounded-xl shadow hover:shadow-lg transition">
      <h2 className="font-semibold text-lg mb-2">{product.name}</h2>
      <p className="text-gray-700 mb-2">Giá: {product.price.toLocaleString()}đ</p>
      <button className="flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">
        <ShoppingCart size={16} /> Thêm vào giỏ
      </button>
    </div>
  );
};
export default SearchProductCard;
