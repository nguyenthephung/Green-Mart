import React, { useState, useEffect } from 'react';
import RichTextEditor from '../ui/RichTextEditor';

interface RichTextEditorModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  initialContent: string;
  title: string;
  placeholder?: string;
}

const RichTextEditorModal: React.FC<RichTextEditorModalProps> = ({
  show,
  onClose,
  onSave,
  initialContent,
  title,
  placeholder = 'Nhập nội dung...',
}) => {
  const [content, setContent] = useState(initialContent);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [isLoading, setIsLoading] = useState(false);

  // Dark mode detection
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Reset content when modal opens
  useEffect(() => {
    if (show) {
      setContent(initialContent);
    }
  }, [show, initialContent]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(content);
      onClose();
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setContent(initialContent); // Reset content when closing
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div
        className="rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl border-0"
        style={
          isDarkMode ? { backgroundColor: '#111827', color: '#fff' } : { backgroundColor: '#fff' }
        }
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{title}</h2>
                <p className="text-blue-100 text-sm">
                  Soạn thảo nội dung với trình editor đầy đủ tính năng
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 180px)' }}>
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder={placeholder}
            className="min-h-[500px]"
            maxHeight="600px"
          />
        </div>

        {/* Footer */}
        <div
          className="border-t p-6 flex items-center justify-between"
          style={isDarkMode ? { borderColor: '#374151' } : { borderColor: '#e5e7eb' }}
        >
          <div className="text-sm" style={isDarkMode ? { color: '#9ca3af' } : { color: '#6b7280' }}>
            💡 Tip: Sử dụng Ctrl+S để lưu nhanh
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-2 rounded-lg border transition-colors"
              style={
                isDarkMode
                  ? { backgroundColor: '#374151', borderColor: '#4b5563', color: '#e5e7eb' }
                  : { backgroundColor: '#f3f4f6', borderColor: '#d1d5db', color: '#374151' }
              }
              disabled={isLoading}
            >
              Hủy
            </button>

            <button
              onClick={handleSave}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang lưu...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Lưu và đóng
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditorModal;
