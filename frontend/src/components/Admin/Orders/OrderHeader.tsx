import React from 'react';

interface OrderHeaderProps {
  isDarkMode: boolean;
  totalOrders: number;
  pendingOrders: number;
  shippingOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  lastRefresh: Date;
  error: string | null;
  isLoading: boolean;
  onRefresh: () => void;
  onExport: () => void;
  onToggleFilters: () => void;
  showFilters: boolean;
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
  formatPrice: (price: number) => string;
}

const OrderHeader: React.FC<OrderHeaderProps> = ({
  isDarkMode,
  totalOrders,
  pendingOrders,
  shippingOrders,
  totalRevenue,
  todayOrders,
  todayRevenue,
  lastRefresh,
  error,
  isLoading,
  onRefresh,
  onExport,
  onToggleFilters,
  showFilters,
  viewMode,
  onViewModeChange,
  formatPrice,
}) => {
  return (
    <div
      className="rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6"
      style={isDarkMode ? { backgroundColor: '#18181b' } : { backgroundColor: '#fff' }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold mb-2"
            style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}
          >
            Quản lý đơn hàng
          </h1>
          <div
            className="flex flex-wrap gap-4 text-sm"
            style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}
          >
            <span>
              Tổng:{' '}
              <span className="font-semibold" style={{ color: '#2563eb' }}>
                {totalOrders}
              </span>{' '}
              đơn hàng
            </span>
            <span>
              Chờ xác nhận:{' '}
              <span className="font-semibold" style={{ color: '#fde047' }}>
                {pendingOrders}
              </span>
            </span>
            <span>
              Đang giao:{' '}
              <span className="font-semibold" style={{ color: '#a78bfa' }}>
                {shippingOrders}
              </span>
            </span>
            <span>
              Hôm nay:{' '}
              <span className="font-semibold" style={{ color: '#f97316' }}>
                {todayOrders}
              </span>{' '}
              đơn
            </span>
            <span>
              Doanh thu:{' '}
              <span className="font-semibold" style={{ color: '#22c55e' }}>
                {formatPrice(totalRevenue)}
              </span>
            </span>
            <span>
              DT hôm nay:{' '}
              <span className="font-semibold" style={{ color: '#16a34a' }}>
                {formatPrice(todayRevenue)}
              </span>
            </span>
            <span className="text-xs">Cập nhật: {lastRefresh.toLocaleTimeString('vi-VN')}</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {error && (
            <div className="px-3 py-2 rounded-lg text-sm bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200">
              {error}
            </div>
          )}

          <button
            onClick={onRefresh}
            className="px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
            style={
              isDarkMode
                ? { backgroundColor: '#059669', color: '#fff' }
                : { backgroundColor: '#10b981', color: '#fff' }
            }
            disabled={isLoading}
          >
            <span>🔄</span>
            Làm mới
          </button>

          <button
            onClick={onExport}
            className="px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
            style={
              isDarkMode
                ? { backgroundColor: '#16a34a', color: '#fff' }
                : { backgroundColor: '#22c55e', color: '#fff' }
            }
          >
            <span>📊</span>
            Xuất báo cáo
          </button>

          <button
            onClick={onToggleFilters}
            className="px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
            style={
              isDarkMode
                ? showFilters
                  ? { backgroundColor: '#23272f', color: '#fff' }
                  : { backgroundColor: '#23272f', color: '#60a5fa' }
                : showFilters
                  ? { backgroundColor: '#2563eb', color: '#fff' }
                  : { backgroundColor: '#dbeafe', color: '#1e40af' }
            }
          >
            <span>🔍</span>
            Bộ lọc
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => onViewModeChange('table')}
              className="px-3 py-2 rounded-lg transition-all duration-200"
              style={
                isDarkMode
                  ? viewMode === 'table'
                    ? { backgroundColor: '#22c55e', color: '#fff' }
                    : { backgroundColor: '#23272f', color: '#e5e7eb' }
                  : viewMode === 'table'
                    ? { backgroundColor: '#22c55e', color: '#fff' }
                    : { backgroundColor: '#e5e7eb', color: '#374151' }
              }
              title="Xem dạng bảng"
            >
              📋
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className="px-3 py-2 rounded-lg transition-all duration-200"
              style={
                isDarkMode
                  ? viewMode === 'grid'
                    ? { backgroundColor: '#22c55e', color: '#fff' }
                    : { backgroundColor: '#23272f', color: '#e5e7eb' }
                  : viewMode === 'grid'
                    ? { backgroundColor: '#22c55e', color: '#fff' }
                    : { backgroundColor: '#e5e7eb', color: '#374151' }
              }
              title="Xem dạng thẻ"
            >
              🔳
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderHeader;
