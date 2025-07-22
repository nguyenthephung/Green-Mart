import { useParams, useSearchParams } from 'react-router-dom';
import { products } from '../../data/Guest/Home';
import { useState, useMemo } from 'react';
import { useCartStore } from '../../stores/useCartStore';
import { StarIcon, FireIcon } from '@heroicons/react/24/solid';
import ProductCard from '../../components/Guest/home/ProductCard';

const categoryNames: Record<string, string> = {
  meat: 'Thịt - Cá - Trứng - Sữa',
  vegetables: 'Rau Củ Quả',
  fruits: 'Trái Cây',
  dryfood: 'Thực Phẩm Khô',
  spices: 'Gia Vị',
  drink: 'Đồ Uống Các Loại',
  snack: 'Bánh Kẹo',
  milk: 'Sữa Các Loại',
};

const allCategories = Object.keys(categoryNames);

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [searchParams] = useSearchParams();
  const addToCart = useCartStore(state => state.addToCart);
  
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');
  const [filterType, setFilterType] = useState<'all' | 'sale' | 'featured'>('all');

  // Check URL params for special filters
  const saleFromUrl = searchParams.get('sale') === 'true';
  const featuredFromUrl = searchParams.get('featured') === 'true';

  // Set initial filter based on URL params
  useState(() => {
    if (saleFromUrl) setFilterType('sale');
    else if (featuredFromUrl) setFilterType('featured');
  });

  // Memoize filtered products for performance
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const categoryMatch = !category || p.category === category;
      const searchMatch = p.name.toLowerCase().includes(search.toLowerCase());
      
      let typeMatch = true;
      if (filterType === 'sale') typeMatch = p.isSale;
      else if (filterType === 'featured') typeMatch = p.isFeatured;
      
      return categoryMatch && searchMatch && typeMatch;
    }).sort((a, b) => {
      if (sort === 'price-asc') {
        const priceA = parseInt((a.salePrice || a.price).replace(/\D/g, ''));
        const priceB = parseInt((b.salePrice || b.price).replace(/\D/g, ''));
        return priceA - priceB;
      }
      if (sort === 'price-desc') {
        const priceA = parseInt((a.salePrice || a.price).replace(/\D/g, ''));
        const priceB = parseInt((b.salePrice || b.price).replace(/\D/g, ''));
        return priceB - priceA;
      }
      return 0;
    });
  }, [category, search, filterType, sort]);

  // Handle add to cart
  const handleAddToCart = (product: any) => {
    addToCart({
      id: Number(product.id),
      name: product.name,
      price: product.salePrice ? parseInt(product.salePrice.replace(/\D/g, '')) : parseInt(product.price.replace(/\D/g, '')),
      image: product.image
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-4">
            {category ? categoryNames[category] : 'Tất Cả Sản Phẩm'}
          </h1>
          <p className="text-gray-600 text-lg">
            Khám phá bộ sưu tập tươi ngon chất lượng cao
          </p>
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
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất Cả Sản Phẩm
            </button>
            <button
              onClick={() => setFilterType('sale')}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
                filterType === 'sale'
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600'
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
                  : 'bg-gray-100 text-gray-700 hover:bg-yellow-50 hover:text-yellow-600'
              }`}
            >
              <StarIcon className="w-5 h-5" />
              Sản Phẩm Nổi Bật
            </button>
          </div>

          {/* Category Navigation */}
          <div className="flex flex-wrap gap-3 mb-6 justify-center">
            <a
              href="/category"
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-200 ${
                !category
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-lg'
                  : 'text-gray-700 border border-gray-300 bg-white hover:bg-emerald-50 hover:text-emerald-700'
              }`}
            >
              Tất Cả
            </a>
            {allCategories.map((cat) => (
              <a
                key={cat}
                href={`/category/${cat}`}
                className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-200 ${
                  cat === category
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-lg'
                    : 'text-gray-700 border border-gray-300 bg-white hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                {categoryNames[cat]}
              </a>
            ))}
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
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                showSaleBadge={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
