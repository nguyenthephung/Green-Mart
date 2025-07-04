import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { products } from '../../data/Guest/Home'; 
import ProductCard from '../../components/Guest/home/ProductCard'; 
import { useCart } from '../../reduxSlice/CartContext';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchPage: React.FC = () => {
  const query = useQuery();
  const searchTerm = query.get('search')?.toLowerCase().trim() || '';

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm)
    );
  }, [searchTerm]);

  const { addToCart } = useCart();

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h2 className="text-2xl font-semibold mb-4">
        Kết quả tìm kiếm cho: <span className="text-green-600">"{searchTerm}"</span>
      </h2>

      {filteredProducts.length === 0 ? (
        <p className="text-gray-600">Không tìm thấy sản phẩm phù hợp.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => addToCart({
                id: Number(product.id),
                name: product.name,
                price: product.price,
                image: product.image
              })}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
