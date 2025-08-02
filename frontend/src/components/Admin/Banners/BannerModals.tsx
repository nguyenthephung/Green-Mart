import React, { useState } from 'react';
import type { Banner } from '../../../types/banner';

// Add Banner Modal
interface AddBannerModalProps {
  isDarkMode: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (banner: Omit<Banner, 'id' | 'clickCount' | 'createdAt' | 'updatedAt'>) => void;
  isLoading: boolean;
}

export const AddBannerModal: React.FC<AddBannerModalProps> = ({
  isDarkMode,
  isOpen,
  onClose,
  onSubmit,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    position: 'hero' as Banner['position'],
    priority: 1,
    isActive: true,
    startDate: '',
    endDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={isDarkMode ? { backgroundColor: '#18181b', color: '#fff' } : undefined}
      >
        <div className="p-6 border-b" style={isDarkMode ? { borderColor: '#374151' } : undefined}>
          <h2 className="text-xl font-bold" style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}>
            ➕ Thêm Banner Mới
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#374151' }}>
              Tiêu đề *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={isDarkMode ? { backgroundColor: '#374151', borderColor: '#4b5563', color: '#fff' } : undefined}
              placeholder="Nhập tiêu đề banner"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#374151' }}>
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={isDarkMode ? { backgroundColor: '#374151', borderColor: '#4b5563', color: '#fff' } : undefined}
              placeholder="Nhập mô tả banner"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#374151' }}>
              URL Hình ảnh *
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={isDarkMode ? { backgroundColor: '#374151', borderColor: '#4b5563', color: '#fff' } : undefined}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#374151' }}>
              URL Liên kết
            </label>
            <input
              type="url"
              name="linkUrl"
              value={formData.linkUrl}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={isDarkMode ? { backgroundColor: '#374151', borderColor: '#4b5563', color: '#fff' } : undefined}
              placeholder="https://example.com/link"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#374151' }}>
                Vị trí hiển thị
              </label>
              <select
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={isDarkMode ? { backgroundColor: '#374151', borderColor: '#4b5563', color: '#fff' } : undefined}
              >
                <option value="hero">🎯 Hero Banner</option>
                <option value="sidebar">📱 Sidebar</option>
                <option value="footer">📄 Footer</option>
                <option value="category">🏷️ Category</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#374151' }}>
                Độ ưu tiên
              </label>
              <input
                type="number"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                min="1"
                max="100"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={isDarkMode ? { backgroundColor: '#374151', borderColor: '#4b5563', color: '#fff' } : undefined}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#374151' }}>
                Ngày bắt đầu
              </label>
              <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={isDarkMode ? { backgroundColor: '#374151', borderColor: '#4b5563', color: '#fff' } : undefined}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#374151' }}>
                Ngày kết thúc
              </label>
              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={isDarkMode ? { backgroundColor: '#374151', borderColor: '#4b5563', color: '#fff' } : undefined}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="ml-2 text-sm" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#374151' }}>
              Kích hoạt ngay
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t" style={isDarkMode ? { borderColor: '#374151' } : undefined}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              Thêm Banner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Banner Modal
interface EditBannerModalProps {
  isDarkMode: boolean;
  isOpen: boolean;
  banner: Banner | null;
  onClose: () => void;
  onSubmit: (banner: Banner) => void;
  isLoading: boolean;
}

export const EditBannerModal: React.FC<EditBannerModalProps> = ({
  isDarkMode,
  isOpen,
  banner,
  onClose,
  onSubmit,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    title: banner?.title || '',
    description: banner?.description || '',
    imageUrl: banner?.imageUrl || '',
    linkUrl: banner?.linkUrl || '',
    position: (banner?.position || 'hero') as Banner['position'],
    priority: banner?.priority || 1,
    isActive: banner?.isActive ?? true,
    startDate: banner?.startDate || '',
    endDate: banner?.endDate || ''
  });

  React.useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title,
        description: banner.description || '',
        imageUrl: banner.imageUrl,
        linkUrl: banner.linkUrl || '',
        position: banner.position,
        priority: banner.priority,
        isActive: banner.isActive,
        startDate: banner.startDate || '',
        endDate: banner.endDate || ''
      });
    }
  }, [banner]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (banner) {
      onSubmit({
        ...banner,
        ...formData
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (!isOpen || !banner) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={isDarkMode ? { backgroundColor: '#18181b', color: '#fff' } : undefined}
      >
        <div className="p-6 border-b" style={isDarkMode ? { borderColor: '#374151' } : undefined}>
          <h2 className="text-xl font-bold" style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}>
            ✏️ Chỉnh sửa Banner
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Form fields same as AddBannerModal */}
          <div>
            <label className="block text-sm font-medium mb-2" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#374151' }}>
              Tiêu đề *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={isDarkMode ? { backgroundColor: '#374151', borderColor: '#4b5563', color: '#fff' } : undefined}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#374151' }}>
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={isDarkMode ? { backgroundColor: '#374151', borderColor: '#4b5563', color: '#fff' } : undefined}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#374151' }}>
              URL Hình ảnh *
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={isDarkMode ? { backgroundColor: '#374151', borderColor: '#4b5563', color: '#fff' } : undefined}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#374151' }}>
                Vị trí hiển thị
              </label>
              <select
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={isDarkMode ? { backgroundColor: '#374151', borderColor: '#4b5563', color: '#fff' } : undefined}
              >
                <option value="hero">🎯 Hero Banner</option>
                <option value="sidebar">📱 Sidebar</option>
                <option value="footer">📄 Footer</option>
                <option value="category">🏷️ Category</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#374151' }}>
                Độ ưu tiên
              </label>
              <input
                type="number"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                min="1"
                max="100"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={isDarkMode ? { backgroundColor: '#374151', borderColor: '#4b5563', color: '#fff' } : undefined}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="ml-2 text-sm" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#374151' }}>
              Kích hoạt
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t" style={isDarkMode ? { borderColor: '#374151' } : undefined}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              Cập nhật
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Confirm Modal
interface DeleteConfirmModalProps {
  isDarkMode: boolean;
  isOpen: boolean;
  bannerId: number | null;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isDarkMode,
  isOpen,
  bannerId,
  onClose,
  onConfirm,
  isLoading
}) => {
  if (!isOpen || !bannerId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
        style={isDarkMode ? { backgroundColor: '#18181b', color: '#fff' } : undefined}
      >
        <div className="p-6">
          <div className="text-center">
            <div className="text-6xl mb-4">🗑️</div>
            <h2 className="text-xl font-bold mb-2" style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}>
              Xác nhận xóa banner
            </h2>
            <p className="mb-6" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>
              Bạn có chắc chắn muốn xóa banner này? Hành động này không thể hoàn tác.
            </p>
            
            <div className="flex justify-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isLoading}
              >
                Hủy
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                disabled={isLoading}
              >
                {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                Xóa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
