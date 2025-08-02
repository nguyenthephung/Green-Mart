import React from 'react';
import type { FilterPosition, FilterStatus } from '../../../types/banner';

interface BannerFiltersProps {
  isDarkMode: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  filterPosition: FilterPosition;
  onFilterPositionChange: (value: FilterPosition) => void;
  filterStatus: FilterStatus;
  onFilterStatusChange: (value: FilterStatus) => void;
  showFilters: boolean;
}

const BannerFilters: React.FC<BannerFiltersProps> = ({
  isDarkMode,
  search,
  onSearchChange,
  filterPosition,
  onFilterPositionChange,
  filterStatus,
  onFilterStatusChange,
  showFilters
}) => {
  if (!showFilters) return null;

  return (
    <div className="mb-6 p-4 rounded-lg border" style={isDarkMode ? { backgroundColor: '#18181b', borderColor: '#374151' } : { backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium mb-2" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#374151' }}>
            🔍 Tìm kiếm
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên, mô tả banner..."
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            style={isDarkMode ? { 
              backgroundColor: '#374151', 
              borderColor: '#4b5563', 
              color: '#fff'
            } : undefined}
          />
        </div>

        {/* Position Filter */}
        <div>
          <label className="block text-sm font-medium mb-2" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#374151' }}>
            📍 Vị trí hiển thị
          </label>
          <select
            value={filterPosition}
            onChange={(e) => onFilterPositionChange(e.target.value as FilterPosition)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            style={isDarkMode ? { 
              backgroundColor: '#374151', 
              borderColor: '#4b5563', 
              color: '#fff' 
            } : undefined}
          >
            <option value="all">Tất cả vị trí</option>
            <option value="hero">🎯 Hero Banner</option>
            <option value="sidebar">📱 Sidebar</option>
            <option value="footer">📄 Footer</option>
            <option value="category">🏷️ Category</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium mb-2" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#374151' }}>
            ⚡ Trạng thái
          </label>
          <select
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value as FilterStatus)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            style={isDarkMode ? { 
              backgroundColor: '#374151', 
              borderColor: '#4b5563', 
              color: '#fff' 
            } : undefined}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">✅ Đang hoạt động</option>
            <option value="inactive">⏸️ Tạm dừng</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default BannerFilters;
