import React from 'react';
import CategorySection from '../CategorySection';

interface CategorySectionConfig {
  title: string;
  category: string;
  id: string; // Add id field
  titleClass: string;
  viewMoreLink: string;
  productCount: number;
}

interface CategoriesSectionProps {
  getProductsByCategory: (category: string) => any[];
  handleAddToCart: (product: any, event?: React.MouseEvent) => void;
  products: any[];
  sections: CategorySectionConfig[];
}

const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  getProductsByCategory,
  handleAddToCart,
  sections,
}) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
    <div className="text-center mb-16 min-h-[200px] flex flex-col justify-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-700 dark:text-emerald-300 font-semibold mb-4">
        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
        Danh Mục Sản Phẩm
      </div>
      <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-6 leading-tight">
        Tươi Ngon Từ Thiên Nhiên
      </h2>
      <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto">
        Khám phá bộ sưu tập đa dạng các sản phẩm tươi ngon, chất lượng cao được tuyển chọn kỹ lưỡng
      </p>
    </div>
    <div className="space-y-20">
      {sections.map(cfg => (
        <CategorySection
          key={cfg.id}
          title={cfg.title}
          category={cfg.category}
          products={getProductsByCategory(cfg.category)}
          onAddToCart={handleAddToCart}
          viewMoreLink={cfg.viewMoreLink}
          // heroImage prop đã bỏ
          productCount={cfg.productCount}
          titleClass={cfg.titleClass}
        />
      ))}
    </div>
  </div>
);

export default CategoriesSection;
