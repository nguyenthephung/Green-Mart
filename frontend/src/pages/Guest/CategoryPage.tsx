import { useParams } from 'react-router-dom';
import { products } from '../../data/Guest/Home';
import ProductCard from '../../components/Guest/home/ProductCard';
import { useState } from 'react';

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

const subCategoryNames: Record<string, string> = {
  'Thịt Heo': 'Thịt Heo',
  'Thịt Bò': 'Thịt Bò',
  'Thịt Gà': 'Thịt Gà',
  'Cá': 'Cá - Hải Sản',
  'Trứng': 'Trứng các loại',
  'Sữa Tươi': 'Sữa Tươi',
  'Sữa Đặc': 'Sữa Đặc',
  'Sữa Chua': 'Sữa Chua',
  // ...bổ sung các subCategory khác nếu có...
};

const allCategories = Object.keys(categoryNames);
const allSubCategories = Array.from(new Set(products.filter(p => p.subCategory).map(p => p.subCategory)));

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');
  const [selectedSub, setSelectedSub] = useState('');

  const filteredProducts = products.filter(
    (p) =>
      (!category || p.category === category) &&
      (!selectedSub || p.subCategory === selectedSub) &&
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === 'price-asc') {
      const pa = parseInt((a.salePrice || a.price).replace(/\D/g, ''));
      const pb = parseInt((b.salePrice || b.price).replace(/\D/g, ''));
      return pa - pb;
    }
    if (sort === 'price-desc') {
      const pa = parseInt((a.salePrice || a.price).replace(/\D/g, ''));
      const pb = parseInt((b.salePrice || b.price).replace(/\D/g, ''));
      return pb - pa;
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-green-700 mb-6 text-center">
          {category ? categoryNames[category] || 'Tất cả sản phẩm' : 'Tất cả sản phẩm'}
        </h1>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {allCategories.map((cat) => (
              <a
                key={cat}
                href={`/category/${cat}`}
                className={`px-4 py-2 rounded-full border font-semibold text-sm transition-all duration-200 ${
                  cat === category
                    ? 'bg-green-600 text-white border-green-700 scale-105 shadow-lg'
                    : 'text-gray-700 border-gray-300 bg-white hover:bg-green-50 hover:text-green-700'
                }`}
              >
                {categoryNames[cat]}
              </a>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-100 outline-none text-base"
            />
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 focus:border-green-600 text-base"
            >
              <option value="default">Sắp xếp</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
            </select>
          </div>
        </div>
        {/* SubCategory filter */}
        {category && allSubCategories.filter(sub => products.find(p => p.category === category && p.subCategory === sub)).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {allSubCategories.filter(sub => products.find(p => p.category === category && p.subCategory === sub)).map(sub => (
              <button
                key={sub}
                onClick={() => setSelectedSub(selectedSub === sub ? '' : sub)}
                className={`px-4 py-2 rounded-full border font-semibold text-sm transition-all duration-200 ${
                  selectedSub === sub ? 'bg-blue-600 text-white border-blue-700 scale-105 shadow-lg' : 'text-gray-700 border-gray-300 bg-white hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                {subCategoryNames[sub] || sub}
              </button>
            ))}
          </div>
        )}
        {sortedProducts.length === 0 ? (
          <div className="text-center text-gray-500 text-lg py-16">Không tìm thấy sản phẩm phù hợp.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={() => {}} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
