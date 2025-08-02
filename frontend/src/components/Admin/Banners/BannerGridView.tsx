import React from 'react';
import type { Banner } from '../../../types/banner';

interface BannerGridViewProps {
  isDarkMode: boolean;
  currentBanners: Banner[];
  onEditBanner: (banner: Banner) => void;
  onViewBanner: (banner: Banner) => void;
  onDeleteBanner: (id: number) => void;
  onToggleStatus: (id: number) => void;
  getPositionText: (position: string) => string;
  getPositionColor: (position: string) => string;
  formatDate: (dateString: string) => string;
  totalItems: number;
  search: string;
}

const BannerGridView: React.FC<BannerGridViewProps> = ({
  isDarkMode,
  currentBanners,
  onEditBanner,
  onViewBanner,
  onDeleteBanner,
  onToggleStatus,
  getPositionText,
  getPositionColor,
  formatDate,
  totalItems,
  search
}) => {
  if (totalItems === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4" style={isDarkMode ? { color: '#71717a' } : { color: '#a1a1aa' }}>🎯</div>
        <h3 className="text-lg font-medium mb-2" style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}>
          Không tìm thấy banner
        </h3>
        <p style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>
          {search ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc' : 'Chưa có banner nào'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {currentBanners.map((banner) => (
        <div 
          key={banner.id}
          className="rounded-lg shadow-sm border overflow-hidden transition-shadow hover:shadow-md"
          style={isDarkMode ? { backgroundColor: '#18181b', borderColor: '#374151' } : { backgroundColor: '#fff', borderColor: '#e5e7eb' }}
        >
          {/* Banner Image */}
          <div className="relative h-48 bg-gray-100 overflow-hidden">
            <img
              src={banner.imageUrl}
              alt={banner.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/400x200?text=No+Image';
              }}
            />
            
            {/* Status Badge */}
            <div className="absolute top-2 right-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                banner.isActive 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}>
                {banner.isActive ? '✅ Hoạt động' : '⏸️ Tạm dừng'}
              </span>
            </div>

            {/* Position Badge */}
            <div className="absolute top-2 left-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPositionColor(banner.position)}`}>
                {getPositionText(banner.position)}
              </span>
            </div>
          </div>

          {/* Banner Content */}
          <div className="p-4">
            {/* Title */}
            <h3 className="font-semibold text-lg mb-2 truncate" style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}>
              {banner.title}
            </h3>
            
            {/* Description */}
            {banner.description && (
              <p className="text-sm mb-3 line-clamp-2" style={isDarkMode ? { color: '#9ca3af' } : { color: '#6b7280' }}>
                {banner.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between mb-3 text-sm" style={isDarkMode ? { color: '#9ca3af' } : { color: '#6b7280' }}>
              <span>👆 {banner.clickCount} clicks</span>
              <span>🎯 Độ ưu tiên: {banner.priority}</span>
            </div>

            {/* Dates */}
            <div className="text-xs mb-4 space-y-1" style={isDarkMode ? { color: '#9ca3af' } : { color: '#6b7280' }}>
              <div>📅 Tạo: {formatDate(banner.createdAt)}</div>
              {banner.startDate && (
                <div>🚀 Bắt đầu: {formatDate(banner.startDate)}</div>
              )}
              {banner.endDate && (
                <div>🏁 Kết thúc: {formatDate(banner.endDate)}</div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onViewBanner(banner)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Xem chi tiết"
                >
                  👁️
                </button>
                <button
                  onClick={() => onEditBanner(banner)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Chỉnh sửa"
                >
                  ✏️
                </button>
                <button
                  onClick={() => onDeleteBanner(banner.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Xóa"
                >
                  🗑️
                </button>
              </div>

              {/* Toggle Status */}
              <button
                onClick={() => onToggleStatus(banner.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  banner.isActive
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {banner.isActive ? '⏸️ Tạm dừng' : '▶️ Kích hoạt'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BannerGridView;
