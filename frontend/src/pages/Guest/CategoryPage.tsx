import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import type { Product } from '../../types/Product';
import { useProductStore } from '../../stores/useProductStore';
import { useCategoryStore } from '../../stores/useCategoryStore';
import { useUserStore } from '../../stores/useUserStore';
import { useFlashSaleStore } from '../../stores/useFlashSaleStore';
import { useResponsive } from '../../hooks/useResponsive';
import LazySection from '../../components/LazySection';

// Extend AddressInfo locally to match actual usage
type AddressInfo = {
  address: string;
  district?: string;
  ward?: string;
  wardName?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  isSelected?: boolean;
  fullName?: string;
};
import { useState, useMemo, useEffect } from 'react';
import { useCartStore } from '../../stores/useCartStore';
import { StarIcon, FireIcon } from '@heroicons/react/24/solid';
import ProductCard from '../../components/Guest/home/ProductCard';

export default function CategoryPage() {
  // All hooks must be inside the component
  const fetchAllProducts = useProductStore(state => state.fetchAll);
  const location = useLocation();

  // Responsive hook
  const { isMobile } = useResponsive();

  // Lấy user và addresses từ store
  const user = useUserStore(state => state.user);
  const addresses = useUserStore(state => state.addresses as AddressInfo[]);
  const { category } = useParams<{ category: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const addToCart = useCartStore(state => state.addToCart);
  const categories = useCategoryStore(state => state.categories);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');

  // Flash Sale store
  const { fetchActiveFlashSales, getFlashSaleForProduct } = useFlashSaleStore();

  // Load Flash Sale data when component mounts
  useEffect(() => {
    fetchActiveFlashSales();
  }, [fetchActiveFlashSales]);

  // Fetch products when route changes (e.g. after add product)
  useEffect(() => {
    fetchAllProducts();
  }, [location.pathname]);

  // Initialize filterType based on URL parameters
  const [filterType, setFilterType] = useState<'all' | 'sale' | 'featured'>(() => {
    if (searchParams.get('sale') === 'true') return 'sale';
    if (searchParams.get('featured') === 'true') return 'featured';
    return 'all';
  });

  // Use admin product store
  const products = useProductStore(state => state.products);

  // Tìm parent category từ URL param - có thể là parent hoặc sub
  const currentParentCategory = useMemo(() => {
    if (!category) return null;

    // Trước tiên kiểm tra xem category có phải là parent category không
    const directParent = categories.find(cat => cat.name === category);
    if (directParent) return directParent;

    // Nếu không, tìm parent category có chứa category này trong subs
    return categories.find(cat => Array.isArray(cat.subs) && cat.subs.includes(category));
  }, [category, categories]);

  // Lấy subcategories của parent category hiện tại
  const currentSubcategories = useMemo(() => {
    if (currentParentCategory) {
      return currentParentCategory.subs || [];
    }
    return [];
  }, [currentParentCategory]);

  // Memoize filtered products for performance
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        if (p.status !== 'active') return false;
        let categoryMatch = true;
        if (category) {
          // Kiểm tra xem category param có phải là parent category không
          const isParentCategory = categories.some(cat => cat.name === category);

          if (isParentCategory) {
            // Nếu là parent category, hiển thị tất cả sản phẩm của các subcategory
            const parentCat = categories.find(cat => cat.name === category);
            if (parentCat && parentCat.subs) {
              categoryMatch = parentCat.subs.includes(p.category);
            }
          } else {
            // Nếu là subcategory, so sánh trực tiếp
            categoryMatch = p.category === category;
          }
        }
        // Nếu không có category param, hiển thị tất cả sản phẩm active
        const searchMatch = p.name?.toLowerCase().includes(search.toLowerCase());
        let typeMatch = true;
        if (filterType === 'sale') typeMatch = !!p.isSale;
        else if (filterType === 'featured') typeMatch = !!(p as any).isFeatured;
        return categoryMatch && searchMatch && typeMatch;
      })
      .sort((a, b) => {
        const priceA =
          typeof (a as any).salePrice === 'number' ? (a as any).salePrice : (a as any).price;
        const priceB =
          typeof (b as any).salePrice === 'number' ? (b as any).salePrice : (b as any).price;
        if (sort === 'price-asc') {
          return priceA - priceB;
        }
        if (sort === 'price-desc') {
          return priceB - priceA;
        }
        return 0;
      });
  }, [products, category, search, filterType, sort, categories]);

  // Handle add to cart with Flash Sale support
  // Thêm vào giỏ hàng luôn với số lượng mặc định 1
  const handleAddToCart = (item: Product) => {
    const productId = String(item._id);

    // Check if product is in Flash Sale
    const flashSaleInfo = getFlashSaleForProduct(productId);

    // Use Flash Sale price if available, otherwise use regular pricing logic
    let price: number;
    if (flashSaleInfo) {
      price = flashSaleInfo.product.flashSalePrice;
    } else {
      price = typeof item.salePrice === 'number' ? item.salePrice : item.price;
    }

    addToCart({
      id: productId,
      name: item.name,
      price,
      image: item.image,
      unit: item.unit || '',
      quantity: item.type === 'weight' ? 0 : 1,
      type: item.type,
      weight: item.type === 'weight' ? 1 : undefined,
      // Include Flash Sale info if applicable
      flashSale: flashSaleInfo
        ? {
            flashSaleId: flashSaleInfo.flashSale._id,
            isFlashSale: true,
            originalPrice: flashSaleInfo.product.originalPrice,
            discountPercentage: flashSaleInfo.product.discountPercentage,
          }
        : undefined,
    });
  };

  // Lấy địa chỉ đang chọn (nếu có)
  const selectedAddress =
    addresses && addresses.length > 0 ? addresses.find(a => a.isSelected) || addresses[0] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        {/* Page Header */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-4 leading-tight overflow-hidden">
            {category
              ? // Nếu category param là parent category, hiển thị tên parent
                categories.some(cat => cat.name === category)
                ? category
                : // Nếu là subcategory, hiển thị cả parent và sub
                  currentParentCategory
                  ? `${currentParentCategory.name} - ${category}`
                  : category
              : 'Tất Cả Sản Phẩm'}
          </h1>
          <p className="text-gray-600 text-lg">
            {category
              ? categories.some(cat => cat.name === category)
                ? `Khám phá tất cả sản phẩm ${category.toLowerCase()}`
                : `Khám phá ${category.toLowerCase()}`
              : 'Khám phá bộ sưu tập tươi ngon chất lượng cao'}
          </p>
          {/* Hiển thị tên user và địa chỉ giao hàng nếu có */}
          {user && (
            <div className="mt-2 text-base text-gray-500">
              Xin chào,{' '}
              <span className="font-semibold text-emerald-700">{user.name || user.email}</span>
              {selectedAddress && (
                <>
                  {' '}
                  • Giao đến:{' '}
                  <span className="font-semibold text-green-700">
                    {selectedAddress.fullName ? selectedAddress.fullName : ''}
                    {selectedAddress.wardName || selectedAddress.ward
                      ? `, ${selectedAddress.wardName || selectedAddress.ward}`
                      : ''}
                    {selectedAddress.district ? `, ${selectedAddress.district}` : ''}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          {/* Special Product Type Filters */}
          <div className="flex flex-wrap gap-4 mb-6 justify-center">
            <button
              onClick={() => setFilterType('all')}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                filterType === 'all'
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg scale-105'
                  : 'bg-app-card dark:bg-app-card text-gray-700 dark:text-gray-200 hover:bg-app-secondary dark:hover:bg-app-secondary'
              }`}
            >
              Tất Cả Sản Phẩm
            </button>
            <button
              onClick={() => setFilterType('sale')}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
                filterType === 'sale'
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg scale-105'
                  : 'bg-app-card dark:bg-app-card text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-app-secondary hover:text-red-600 dark:hover:text-red-400'
              }`}
            >
              <FireIcon className="w-5 h-5" />
              Sản Phẩm Sale
            </button>
            <button
              onClick={() => setFilterType('featured')}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
                filterType === 'featured'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg scale-105'
                  : 'bg-app-card dark:bg-app-card text-gray-700 dark:text-gray-200 hover:bg-yellow-50 dark:hover:bg-app-secondary hover:text-yellow-600 dark:hover:text-yellow-400'
              }`}
            >
              <StarIcon className="w-5 h-5" />
              Sản Phẩm Nổi Bật
            </button>
          </div>

          {/* Category Navigation */}
          <div className="mb-6">
            {/* Parent Categories */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Danh mục chính:</h3>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => navigate('/category')}
                  className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-200 ${
                    !category
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-lg'
                      : 'text-gray-700 border border-gray-300 bg-white hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  Tất Cả
                </button>
                {categories.map(cat => (
                  <button
                    key={cat._id}
                    onClick={() => {
                      // Navigate to parent category để hiển thị tất cả sản phẩm của parent
                      navigate(`/category/${cat.name}`);
                    }}
                    className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-200 ${
                      category === cat.name || currentParentCategory?._id === cat._id
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-lg'
                        : 'text-gray-700 border border-gray-300 bg-white hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    {cat.icon ? `${cat.icon} ` : ''}
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Subcategories - chỉ hiện khi có parent category được chọn */}
            {currentParentCategory && currentSubcategories.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Danh mục con:</h3>
                <div className="flex flex-wrap gap-3 justify-center">
                  {currentSubcategories.map(sub => (
                    <button
                      key={sub}
                      onClick={() => navigate(`/category/${sub}`)}
                      className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-200 ${
                        sub === category
                          ? 'bg-blue-600 text-white border-blue-700 shadow-lg'
                          : 'text-gray-700 border border-gray-300 bg-white hover:bg-blue-50 hover:text-blue-700'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search and Sort Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-base"
              />
              <svg
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 text-base bg-white"
            >
              <option value="default">Sắp xếp theo</option>
              <option value="price-asc">Giá: Thấp đến Cao</option>
              <option value="price-desc">Giá: Cao đến Thấp</option>
            </select>
          </div>
        </div>

        {/* Products Count and Status */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <p className="text-lg text-gray-700">
              <span className="font-bold text-emerald-600">{filteredProducts.length}</span> sản phẩm
              {filterType === 'sale' && (
                <span className="ml-2 px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
                  🔥 Đang Sale
                </span>
              )}
              {filterType === 'featured' && (
                <span className="ml-2 px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-semibold rounded-full">
                  ⭐ Nổi Bật
                </span>
              )}
            </p>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛍️</div>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-gray-500">Thử điều chỉnh bộ lọc hoặc tìm kiếm từ khóa khác</p>
          </div>
        ) : (
          <LazySection
            threshold={0.1}
            rootMargin="100px"
            placeholder={
              <div
                className={`grid gap-4 lg:gap-6 mb-12 ${
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
              className={`grid gap-4 lg:gap-6 mb-12 ${
                isMobile ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
              }`}
            >
              {filteredProducts.map(product => {
                // Ensure _id is string and remove descriptionImages function for handleAddToCart
                const { descriptionImages, ...rest } = product;
                const productForCart = {
                  ...rest,
                  _id: String(product._id),
                  unit: product.unit || '',
                };
                const isHot = filterType === 'featured' || product.isFeatured;
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
                    showHotBadge={isHot}
                  />
                );
              })}
            </div>
          </LazySection>
        )}
      </div>
    </div>
  );
}
