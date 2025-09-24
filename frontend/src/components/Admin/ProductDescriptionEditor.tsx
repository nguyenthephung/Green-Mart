import React, { useState, useCallback } from 'react';
import RichTextEditor from '../ui/RichTextEditor';
import RichTextEditorModal from './RichTextEditorModal';
import type { Product } from '../../types/Product';

interface ProductDescriptionEditorProps {
  product: Partial<Product>;
  onChange: (field: keyof Product, value: any) => void;
  readOnly?: boolean;
}

const ProductDescriptionEditor: React.FC<ProductDescriptionEditorProps> = ({
  product,
  onChange,
  readOnly = false,
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'rich'>('basic');
  const [showRichTextModal, setShowRichTextModal] = useState(false);
  const [modalContent, setModalContent] = useState('');

  // Handle basic description change
  const handleBasicDescriptionChange = useCallback(
    (content: string) => {
      onChange('description', content);
    },
    [onChange]
  );

  // Handle rich description change (from regular editor)
  const handleRichDescriptionChange = useCallback(
    (content: string) => {
      if (!showRichTextModal) {
        // Only update if modal is not open
        onChange('richDescription', {
          ...product.richDescription,
          content,
          format: 'html' as const,
        });
      }
    },
    [onChange, product.richDescription, showRichTextModal]
  );

  // Handle rich text modal save
  const handleRichTextSave = useCallback(
    (content: string) => {
      onChange('richDescription', {
        ...product.richDescription,
        content,
        format: 'html' as const,
      });
      setShowRichTextModal(false);
      return Promise.resolve();
    },
    [onChange, product.richDescription]
  );

  // Handle modal open
  const handleOpenModal = useCallback(() => {
    setModalContent(product.richDescription?.content || '');
    setShowRichTextModal(true);
  }, [product.richDescription?.content]);

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
              onChange={e => handleBasicDescriptionChange(e.target.value)}
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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mô tả chi tiết với định dạng
              </label>
              {!readOnly && (
                <button
                  onClick={handleOpenModal}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    />
                  </svg>
                  Mở editor toàn màn hình
                </button>
              )}
            </div>

            {/* Current content preview */}
            <div className="mb-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Nội dung hiện tại:
              </div>
              {product.richDescription?.content ? (
                <div
                  className="text-sm text-gray-800 dark:text-gray-200 max-h-32 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: product.richDescription.content }}
                />
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                  Chưa có nội dung mô tả chi tiết
                </div>
              )}
            </div>

            {/* Inline editor - only show if modal is not being used or in readOnly mode */}
            {(readOnly || !showRichTextModal) && (
              <div>
                <RichTextEditor
                  content={product.richDescription?.content || ''}
                  onChange={handleRichDescriptionChange}
                  placeholder="Nhập mô tả chi tiết với định dạng phong phú..."
                  className="min-h-[200px]"
                  readOnly={readOnly}
                  maxHeight="250px"
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  💡 Sử dụng editor toàn màn hình để soạn thảo nội dung dài một cách thuận tiện hơn.
                </p>
              </div>
            )}

            {/* Show message when modal is preferred */}
            {!readOnly && !showRichTextModal && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Hoặc sử dụng editor inline bên dưới để chỉnh sửa nhanh
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rich Text Editor Modal */}
      <RichTextEditorModal
        show={showRichTextModal}
        onClose={() => setShowRichTextModal(false)}
        onSave={handleRichTextSave}
        initialContent={modalContent}
        title="Soạn thảo mô tả chi tiết sản phẩm"
        placeholder="Nhập mô tả chi tiết với định dạng phong phú..."
      />
    </div>
  );
};

export default ProductDescriptionEditor;
