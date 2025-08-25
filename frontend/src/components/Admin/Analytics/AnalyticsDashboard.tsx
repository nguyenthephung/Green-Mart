import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import { useAnalytics, type AnalyticsPeriod } from '../../../hooks/useAnalytics';
import AnalyticsCharts from './AnalyticsCharts';
import LoadingSpinner from '../../Loading/LoadingSpinner';

const AnalyticsDashboard: React.FC = () => {
  const [period, setPeriod] = useState<AnalyticsPeriod>('7days');
  const { data, loading, error } = useAnalytics(period);
  console.log('[AnalyticsDashboard] period:', period, 'data:', data, 'loading:', loading, 'error:', error);

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)} tỷ đ`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)} triệu đ`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K đ`;
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)} tỷ`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)} triệu`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  const getPeriodLabel = (period: AnalyticsPeriod) => {
    switch (period) {
      case '7days': return '7 ngày qua';
      case '30days': return '30 ngày qua';
      case '3months': return '3 tháng qua';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="xl" text="Đang tải dữ liệu thống kê..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  // Debug: log dữ liệu analytics nhận được
  // ...existing code... (đã xóa log debug)
  if (!data) {
    return (
      <div className="p-8">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">Không có dữ liệu thống kê</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Enhanced Responsive Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="w-full lg:w-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Thống Kê & Phân Tích
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Theo dõi hiệu suất kinh doanh của cửa hàng
          </p>
        </div>
        
        {/* Enhanced Period Selector */}
        <div className="w-full lg:w-auto">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 w-full lg:w-auto">
            {(['7days', '30days', '3months'] as AnalyticsPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 lg:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  period === p
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-md transform scale-105'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-600/50'
                }`}
              >
                {getPeriodLabel(p)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Responsive Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                Tổng Doanh Thu
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(data.totalRevenue)}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/20 rounded-xl ml-2">
              <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4 flex items-center">
            {data.growthRate >= 0 ? (
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 mr-1" />
            )}
            <span className={`text-xs sm:text-sm font-medium ${
              data.growthRate >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {data.growthRate >= 0 ? '+' : ''}{data.growthRate.toFixed(1)}%
            </span>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 ml-1 sm:ml-2 truncate">
              so với kỳ trước
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                Tổng Đơn Hàng
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatNumber(data.totalOrders)}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl ml-2">
              <ShoppingCart className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Trung bình {(data.totalOrders / (period === '7days' ? 7 : period === '30days' ? 30 : 90)).toFixed(1)} đơn/ngày
            </span>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                Giá Trị Đơn TB
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(data.averageOrderValue)}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl ml-2">
              <Users className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Top Products Count */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                Sản Phẩm Bán Chạy
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {data.topProducts.length}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl ml-2">
              <Package className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate block">
              {data.topProducts[0]?.name || 'Chưa có dữ liệu'}
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Responsive Charts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <AnalyticsCharts 
          salesData={data.salesData}
          topProducts={data.topProducts}
          period={period}
        />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
