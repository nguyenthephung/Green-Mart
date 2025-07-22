import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { products } from '../../data/Guest/Home'; 
import ProductCard from '../../components/Guest/home/ProductCard'; 
import { useCartStore } from '../../stores/useCartStore';

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

  const addToCart = useCartStore(state => state.addToCart);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h2 className="text-2xl font-semibold mb-4">
        Kết quả tìm kiếm cho: <span className="text-green-600">"{searchTerm}"</span>
      </h2>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-gray-600 mb-2">Không tìm thấy sản phẩm</h3>
          <p className="text-gray-500">Thử tìm kiếm với từ khóa khác</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={(product) => addToCart({
                id: parseInt(product.id.toString()),
                name: product.name,
                price: parseFloat((product.salePrice || product.price).replace(/[^\d]/g, '')),
                image: product.image
              })}
              showSaleBadge={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
