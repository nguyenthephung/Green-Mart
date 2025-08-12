
import { useLocation } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import ProductCard from '../../components/Guest/home/ProductCard';
import { useCartStore } from '../../stores/useCartStore';
import { useProductStore } from '../../stores/useProductStore';
import BannerManager from '../../components/Guest/BannerManager';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}


const SearchPage: React.FC = () => {
  const location = useLocation();
  const query = useQuery();
  const searchTerm = query.get('search')?.toLowerCase().trim() || '';

  // All hooks must be inside the component
  const fetchAllProducts = useProductStore(state => state.fetchAll);
  const products = useProductStore(state => state.products);
  const addToCart = useCartStore(state => state.addToCart);

  useEffect(() => {
    fetchAllProducts();
  }, [location.pathname]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.status === 'active' &&
      product.name.toLowerCase().includes(searchTerm)
    );
  }, [products, searchTerm]);

  // Handler for add to cart (logic giống CategoryPage)
  const handleAddToCart = (item: any) => {
    // Đảm bảo _id là string, unit luôn là string
    const productForCart = { ...item, _id: String(item._id), unit: item.unit || "" };
    addToCart({
      id: String(productForCart._id),
      name: productForCart.name,
      price: typeof productForCart.salePrice === 'number' ? productForCart.salePrice : productForCart.price,
      image: productForCart.image,
      unit: productForCart.unit,
      quantity: productForCart.type === 'weight' ? 0 : 1,
      type: productForCart.type,
      weight: productForCart.type === 'weight' ? 1 : undefined
    });
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      {/* Banner Manager */}
      <BannerManager page="search" />
      
      <h2 className="text-2xl font-semibold mb-4">
        Kết quả tìm kiếm cho: <span className="text-green-600">"{searchTerm}"</span>
      </h2>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-2">Không tìm thấy sản phẩm</h3>
          <p className="text-gray-500 dark:text-gray-400">Thử tìm kiếm với từ khóa khác</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => {
            // Không cho chỉnh khối lượng, luôn quantity=1
            const { descriptionImages, ...rest } = product;
            const productForCart = { ...rest, _id: String(product._id), unit: product.unit || '' };
            return (
              <ProductCard
                key={String(product._id)}
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  salePrice: product.salePrice,
                  isSale: product.isSale,
                  image: product.image,
                  category: product.category,
                  unit: product.unit || '',
                  averageRating: product.averageRating,
                  totalRatings: product.totalRatings
                }}
                quantity={1}
                onAddToCart={() => handleAddToCart(productForCart)}
                showSaleBadge={true}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
