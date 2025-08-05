import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import { useAnalytics, type AnalyticsPeriod } from '../../../hooks/useAnalytics';
import AnalyticsCharts from './AnalyticsCharts';
import LoadingSpinner from '../../Loading/LoadingSpinner';

const AnalyticsDashboard: React.FC = () => {
  const [period, setPeriod] = useState<AnalyticsPeriod>('7days');
  const { data, loading, error } = useAnalytics(period);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Thống Kê & Phân Tích
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Theo dõi hiệu suất kinh doanh của cửa hàng
          </p>
        </div>
        
        {/* Period Selector */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {(['7days', '30days', '3months'] as AnalyticsPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {getPeriodLabel(p)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tổng Doanh Thu
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(data.totalRevenue)}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {data.growthRate >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${
              data.growthRate >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {data.growthRate >= 0 ? '+' : ''}{data.growthRate.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              so với kỳ trước
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tổng Đơn Hàng
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.totalOrders}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Trung bình {(data.totalOrders / (period === '7days' ? 7 : period === '30days' ? 30 : 90)).toFixed(1)} đơn/ngày
            </span>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Giá Trị Đơn TB
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(data.averageOrderValue)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Top Products Count */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Sản Phẩm Bán Chạy
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.topProducts.length}
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
              <Package className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {data.topProducts[0]?.name || 'Chưa có dữ liệu'}
            </span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <AnalyticsCharts 
        salesData={data.salesData}
        topProducts={data.topProducts}
        period={period}
      />
    </div>
  );
};

export default AnalyticsDashboard;
