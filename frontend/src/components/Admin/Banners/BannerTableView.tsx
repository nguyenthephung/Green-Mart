import React from 'react';
import type { Banner, SortField } from '../../../types/banner';

interface BannerTableViewProps {
  isDarkMode: boolean;
  currentBanners: Banner[];
  onEditBanner: (banner: Banner) => void;
  onViewBanner: (banner: Banner) => void;
  onDeleteBanner: (id: number) => void;
  onToggleStatus: (id: number) => void;
  onSort: (field: SortField) => void;
  getSortIcon: (field: SortField) => string;
  getPositionText: (position: string) => string;
  getPositionColor: (position: string) => string;
  formatDate: (dateString: string) => string;
  totalItems: number;
  search: string;
}

const BannerTableView: React.FC<BannerTableViewProps> = ({
  isDarkMode,
  currentBanners,
  onEditBanner,
  onViewBanner,
  onDeleteBanner,
  onToggleStatus,
  onSort,
  getSortIcon,
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
    <div className="rounded-xl shadow-sm border border-gray-200 overflow-hidden" style={isDarkMode ? { backgroundColor: '#18181b', borderColor: '#374151' } : { backgroundColor: '#fff' }}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200" style={isDarkMode ? { backgroundColor: '#23272f' } : { backgroundColor: '#f9fafb' }}>
            <tr>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSort('title')}
              >
                <div className="flex items-center gap-1">
                  Tiêu đề {getSortIcon('title')}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hình ảnh
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSort('position')}
              >
                <div className="flex items-center gap-1">
                  Vị trí {getSortIcon('position')}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSort('priority')}
              >
                <div className="flex items-center gap-1">
                  Độ ưu tiên {getSortIcon('priority')}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSort('clickCount')}
              >
                <div className="flex items-center gap-1">
                  Lượt click {getSortIcon('clickCount')}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSort('createdAt')}
              >
                <div className="flex items-center gap-1">
                  Ngày tạo {getSortIcon('createdAt')}
                </div>
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200" style={isDarkMode ? { backgroundColor: '#18181b' } : { backgroundColor: '#fff' }}>
            {currentBanners.map((banner) => (
              <tr 
                key={banner.id}
                className="hover:bg-gray-50 transition-colors"
                style={isDarkMode ? { backgroundColor: '#18181b' } : { backgroundColor: '#fff' }}
                onMouseEnter={e => { 
                  if (isDarkMode) e.currentTarget.style.backgroundColor = '#23272f'; 
                  else e.currentTarget.style.backgroundColor = '#f9fafb'; 
                }}
                onMouseLeave={e => { 
                  if (isDarkMode) e.currentTarget.style.backgroundColor = '#18181b'; 
                  else e.currentTarget.style.backgroundColor = '#fff'; 
                }}
              >
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    <div className="text-sm font-medium truncate" style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}>
                      {banner.title}
                    </div>
                    {banner.description && (
                      <div className="text-xs truncate" style={isDarkMode ? { color: '#9ca3af' } : { color: '#6b7280' }}>
                        {banner.description}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/64x64?text=No+Image';
                      }}
                    />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPositionColor(banner.position)}`}>
                    {getPositionText(banner.position)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium" style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}>
                    {banner.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#374151' }}>
                    {banner.clickCount.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onToggleStatus(banner.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      banner.isActive
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {banner.isActive ? '✅ Hoạt động' : '⏸️ Tạm dừng'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>
                    {formatDate(banner.createdAt)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BannerTableView;
