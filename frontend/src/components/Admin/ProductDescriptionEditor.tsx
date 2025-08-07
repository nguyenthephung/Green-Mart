import React, { useState, useCallback } from 'react';
import RichTextEditor from '../ui/RichTextEditor';
import type { Product } from '../../types/Product';

interface ProductDescriptionEditorProps {
  product: Partial<Product>;
  onChange: (field: keyof Product, value: any) => void;
  readOnly?: boolean;
}

const ProductDescriptionEditor: React.FC<ProductDescriptionEditorProps> = ({
  product,
  onChange,
  readOnly = false
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'rich'>('basic');

  // Handle basic description change
  const handleBasicDescriptionChange = useCallback((content: string) => {
    onChange('description', content);
  }, [onChange]);

  // Handle rich description change
  const handleRichDescriptionChange = useCallback((content: string) => {
    onChange('richDescription', {
      ...product.richDescription,
      content,
      format: 'html' as const
    });
  }, [onChange, product.richDescription]);

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-600">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('basic')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'basic'
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Mô tả cơ bản
          </button>
          <button
            onClick={() => setActiveTab('rich')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rich'
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Mô tả chi tiết
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'basic' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mô tả ngắn gọn
            </label>
            <textarea
              value={product.description || ''}
              onChange={(e) => handleBasicDescriptionChange(e.target.value)}
              placeholder="Nhập mô tả ngắn gọn về sản phẩm..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={6}
              readOnly={readOnly}
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Mô tả cơ bản sẽ hiển thị trong danh sách sản phẩm và kết quả tìm kiếm.
            </p>
          </div>
        )}

        {activeTab === 'rich' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mô tả chi tiết với định dạng
            </label>
            <RichTextEditor
              content={product.richDescription?.content || ''}
              onChange={handleRichDescriptionChange}
              placeholder="Nhập mô tả chi tiết với định dạng phong phú..."
              className="min-h-[400px]"
              readOnly={readOnly}
              maxHeight="500px"
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Mô tả chi tiết hỗ trợ định dạng HTML và sẽ hiển thị trong trang chi tiết sản phẩm.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDescriptionEditor;
