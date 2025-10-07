import { useLocation } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import ProductCard from '../../components/Guest/home/ProductCard';
import { useCartStore } from '../../stores/useCartStore';
import { useProductStore } from '../../stores/useProductStore';
import { useResponsive } from '../../hooks/useResponsive';
import { useSEO } from '../../hooks/useSEO';
import BannerManager from '../../components/Guest/BannerManager';
import LazySection from '../../components/LazySection';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchPage: React.FC = () => {
  const location = useLocation();
  const query = useQuery();
  const searchTerm = query.get('search')?.toLowerCase().trim() || '';

  // SEO optimization
  useSEO({ 
    page: 'search', 
    data: { searchTerm } 
  });

  // Responsive hook
  const { isMobile } = useResponsive();

  // All hooks must be inside the component
  const fetchAllProducts = useProductStore(state => state.fetchAll);
  const products = useProductStore(state => state.products);
  const addToCart = useCartStore(state => state.addToCart);

  useEffect(() => {
    fetchAllProducts();
  }, [location.pathname]);

  const filteredProducts = useMemo(() => {
    return products.filter(
      product => product.status === 'active' && product.name.toLowerCase().includes(searchTerm)
    );
  }, [products, searchTerm]);

  // Handler for add to cart (logic giống CategoryPage)
  const handleAddToCart = (item: any) => {
    // Đảm bảo _id là string, unit luôn là string
    const productForCart = { ...item, _id: String(item._id), unit: item.unit || '' };
    addToCart({
      id: String(productForCart._id),
      name: productForCart.name,
      price:
        typeof productForCart.salePrice === 'number'
          ? productForCart.salePrice
          : productForCart.price,
      image: productForCart.image,
      unit: productForCart.unit,
      quantity: productForCart.type === 'weight' ? 0 : 1,
      type: productForCart.type,
      weight: productForCart.type === 'weight' ? 1 : undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Banner Manager */}
      <BannerManager page="search" />

      {/* Hero Section */}
      <section className="bg-green-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-12 lg:py-16">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Kết quả tìm kiếm
            </h1>
            {searchTerm && (
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300">
                Từ khóa: <span className="font-semibold text-green-600">"{searchTerm}"</span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-6 lg:py-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 lg:py-16">
            <div className="text-4xl sm:text-5xl lg:text-6xl mb-4">🔍</div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-600 dark:text-gray-300 mb-2">
              Không tìm thấy sản phẩm
            </h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
              Thử tìm kiếm với từ khóa khác
            </p>
          </div>
        ) : (
          <LazySection
            threshold={0.1}
            rootMargin="100px"
            placeholder={
              <div
                className={`grid gap-4 lg:gap-6 ${
                  isMobile ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                }`}
              >
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="bg-gray-200 animate-pulse rounded-xl h-64" />
                ))}
              </div>
            }
          >
            <div
              className={`grid gap-4 lg:gap-6 ${
                isMobile ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
              }`}
            >
              {filteredProducts.map(product => {
                // Không cho chỉnh khối lượng, luôn quantity=1
                const { descriptionImages, ...rest } = product;
                const productForCart = {
                  ...rest,
                  _id: String(product._id),
                  unit: product.unit || '',
                };
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
                      totalRatings: product.totalRatings,
                    }}
                    quantity={1}
                    onAddToCart={() => handleAddToCart(productForCart)}
                    showSaleBadge={true}
                  />
                );
              })}
            </div>
          </LazySection>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
