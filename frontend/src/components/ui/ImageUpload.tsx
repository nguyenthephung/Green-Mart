import React, { useState, useRef } from 'react';
import { useToastStore } from '../../stores/useToastStore';
import { useFileUpload } from '../../hooks/useFileUpload';

interface ImageUploadProps {
  value?: string;
  onChange: (imageUrl: string) => void;
  onFileChange?: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value = '',
  onChange,
  onFileChange,
  accept = 'image/*',
  maxSize = 10, // 10MB default
  className = '',
  placeholder = 'Chọn hoặc kéo thả hình ảnh vào đây',
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError } = useToastStore();
  const { uploadFile } = useFileUpload();

  // Determine upload type based on context
  const getUploadType = (): 'products' | 'banners' | 'avatars' | 'ratings' => {
    // Check if we're in a specific context based on URL or props
    const currentPath = window.location.pathname;
    if (currentPath.includes('/banner')) return 'banners';
    if (currentPath.includes('/profile') || currentPath.includes('/avatar')) return 'avatars';
    if (currentPath.includes('/rating') || currentPath.includes('/review')) return 'ratings';
    return 'products'; // default
  };

  // Handle file selection
  const handleFileSelect = async (file: File) => {
    if (disabled) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Lỗi định dạng', 'Vui lòng chọn file hình ảnh hợp lệ.');
      return;
    }

    // Validate file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSize) {
      showError('Lỗi kích thước', `Kích thước file không được vượt quá ${maxSize}MB.`);
      return;
    }

    try {
      setIsUploading(true);

      // Determine upload type and use the upload service
      const uploadType = getUploadType();
      const result = await uploadFile(file, uploadType);
      
      if (result.success && result.url) {
        // Create preview
        setPreview(result.url);
        onChange(result.url);
        showSuccess('Thành công', 'Hình ảnh đã được tải lên Cloudinary thành công.');
        
        if (onFileChange) {
          onFileChange(file);
        }
      } else {
        showError('Lỗi tải file', result.error || 'Có lỗi xảy ra khi tải file.');
      }

    } catch (error) {
      showError('Lỗi', 'Có lỗi xảy ra khi xử lý hình ảnh.');
      console.error('Error processing image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Handle URL input change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setPreview(url);
    onChange(url);
  };

  // Clear image
  const handleClear = () => {
    if (disabled) return;
    
    setPreview('');
    onChange('');
    if (onFileChange) {
      onFileChange(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* URL Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          URL Hình ảnh
        </label>
        <input
          type="url"
          value={value}
          onChange={handleUrlChange}
          disabled={disabled}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        hoặc
      </div>

      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        {isUploading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Đang tải lên...</p>
          </div>
        ) : preview ? (
          <div className="text-center">
            <div className="relative inline-block">
              <img
                src={preview}
                alt="Preview"
                className="max-h-32 max-w-full rounded-lg shadow-md"
                onError={() => {
                  setPreview('');
                  showError('Lỗi', 'Không thể tải hình ảnh từ URL đã cung cấp.');
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                disabled={disabled}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Click để thay đổi hình ảnh
            </p>
          </div>
        ) : (
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {placeholder}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                PNG, JPG, GIF lên đến {maxSize}MB
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
