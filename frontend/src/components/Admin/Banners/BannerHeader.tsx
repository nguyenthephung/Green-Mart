import React from 'react';
import type { ViewMode } from '../../../types/banner';

interface BannerHeaderProps {
  isDarkMode: boolean;
  totalBanners: number;
  activeBanners: number;
  inactiveBanners: number;
  totalClicks: number;
  isLoading: boolean;
  onAddBanner: () => void;
  onToggleFilters: () => void;
  showFilters: boolean;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const BannerHeader: React.FC<BannerHeaderProps> = ({
  isDarkMode,
  totalBanners,
  activeBanners,
  inactiveBanners,
  totalClicks,
  isLoading,
  onAddBanner,
  onToggleFilters,
  showFilters,
  viewMode,
  onViewModeChange
}) => {
  return (
    <div className="mb-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="rounded-lg shadow-sm border p-6" style={isDarkMode ? { backgroundColor: '#18181b', borderColor: '#374151' } : { backgroundColor: '#fff', borderColor: '#e5e7eb' }}>
          <div className="text-2xl mb-2">🎯</div>
          <div className="text-2xl font-bold mb-1" style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}>
            {totalBanners}
          </div>
          <div className="text-sm" style={isDarkMode ? { color: '#9ca3af' } : { color: '#6b7280' }}>
            Tổng banner
          </div>
        </div>

        <div className="rounded-lg shadow-sm border p-6" style={isDarkMode ? { backgroundColor: '#18181b', borderColor: '#374151' } : { backgroundColor: '#fff', borderColor: '#e5e7eb' }}>
          <div className="text-2xl mb-2">✅</div>
          <div className="text-2xl font-bold mb-1 text-green-600">
            {activeBanners}
          </div>
          <div className="text-sm" style={isDarkMode ? { color: '#9ca3af' } : { color: '#6b7280' }}>
            Đang hoạt động
          </div>
        </div>

        <div className="rounded-lg shadow-sm border p-6" style={isDarkMode ? { backgroundColor: '#18181b', borderColor: '#374151' } : { backgroundColor: '#fff', borderColor: '#e5e7eb' }}>
          <div className="text-2xl mb-2">⏸️</div>
          <div className="text-2xl font-bold mb-1 text-gray-600">
            {inactiveBanners}
          </div>
          <div className="text-sm" style={isDarkMode ? { color: '#9ca3af' } : { color: '#6b7280' }}>
            Tạm dừng
          </div>
        </div>

        <div className="rounded-lg shadow-sm border p-6" style={isDarkMode ? { backgroundColor: '#18181b', borderColor: '#374151' } : { backgroundColor: '#fff', borderColor: '#e5e7eb' }}>
          <div className="text-2xl mb-2">👆</div>
          <div className="text-2xl font-bold mb-1 text-blue-600">
            {totalClicks.toLocaleString()}
          </div>
          <div className="text-sm" style={isDarkMode ? { color: '#9ca3af' } : { color: '#6b7280' }}>
            Tổng click
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold" style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}>
            Quản lý Banner
          </h1>
          {isLoading && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1" style={isDarkMode ? { backgroundColor: '#374151' } : undefined}>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              style={isDarkMode && viewMode === 'grid' ? { backgroundColor: '#18181b', color: '#fff' } : undefined}
            >
              📊 Lưới
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              style={isDarkMode && viewMode === 'table' ? { backgroundColor: '#18181b', color: '#fff' } : undefined}
            >
              📋 Bảng
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={onToggleFilters}
            className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
              showFilters
                ? 'bg-blue-50 text-blue-600 border-blue-300'
                : 'text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            style={isDarkMode && showFilters ? { backgroundColor: '#1e3a8a', color: '#93c5fd', borderColor: '#3b82f6' } :
                   isDarkMode ? { color: '#e5e7eb', borderColor: '#4b5563', backgroundColor: 'transparent' } : undefined}
          >
            🔍 Bộ lọc
          </button>

          {/* Add Banner Button */}
          <button
            onClick={onAddBanner}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            ➕ Thêm Banner
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerHeader;
