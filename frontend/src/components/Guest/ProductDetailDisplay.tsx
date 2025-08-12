import React, { useState } from 'react';
import type { Product } from '../../types/Product';
import ProductRating from './ProductRating';
import ProductComments from './ProductComments';

interface ProductDetailDisplayProps {
  product: Product;
  className?: string;
}

const ProductDetailDisplay: React.FC<ProductDetailDisplayProps> = ({
  product,
  className = ""
}) => {
  // Check if product has content
  const hasDescription = product.description && product.description.trim().length > 0;
  const hasRichDescription = product.richDescription && 
    (typeof product.richDescription === 'object' 
      ? product.richDescription.content && product.richDescription.content.trim().length > 0
      : false);
  const hasSpecifications = product.specifications && Object.keys(product.specifications).length > 0;
  
  // If no description content, show reviews by default
  const defaultTab = (hasDescription || hasRichDescription) ? 'description' : 'reviews';
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>(defaultTab);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-600 px-6 pt-6">
        <nav className="flex space-x-8">
          {(hasDescription || hasRichDescription) && (
            <button
              onClick={() => setActiveTab('description')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'description'
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Mô tả sản phẩm
            </button>
          )}
          
          {hasSpecifications && (
            <button
              onClick={() => setActiveTab('specs')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'specs'
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Thông số kỹ thuật
            </button>
          )}
          
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'reviews'
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Đánh giá & Nhận xét{product.totalRatings ? ` (${product.totalRatings})` : ''}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'description' && (
          <div>
            {hasDescription && (
              <div className="prose dark:prose-invert max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Mô tả sản phẩm
                </h3>
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </div>
              </div>
            )}
            
            {hasRichDescription && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Thông tin chi tiết
                </h3>
                <div 
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: typeof product.richDescription === 'object' 
                      ? product.richDescription.content 
                      : '' 
                  }}
                />
              </div>
            )}
            
            {!hasDescription && !hasRichDescription && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-medium">Chưa có mô tả chi tiết</p>
                <p className="text-sm">Thông tin sản phẩm sẽ được cập nhật sớm</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'specs' && (
          <div>
            {hasSpecifications ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Thông số kỹ thuật
                </h3>
                <div className="grid gap-3">
                  {Object.entries(product.specifications!).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-3 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {key}
                      </span>
                      <span className="text-gray-900 dark:text-white font-semibold">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-lg font-medium">Chưa có thông số kỹ thuật</p>
                <p className="text-sm">Thông tin chi tiết sẽ được cập nhật sớm</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <ProductRating productId={product.id.toString()} />
            <ProductComments productId={product.id.toString()} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailDisplay;
