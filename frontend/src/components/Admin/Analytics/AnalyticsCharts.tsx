import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface ChartData {
  date: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  category: string;
}

interface AnalyticsChartsProps {
  salesData: ChartData[];
  topProducts: TopProduct[];
  period: '7days' | '30days' | '3months';
}

const COLORS = [
  '#10b981',
  '#3b82f6',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#f97316',
  '#06b6d4',
  '#84cc16',
];

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ salesData, topProducts, period }) => {
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
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (period === '7days') {
      return date.toLocaleDateString('vi-VN', {
        weekday: 'short',
        day: 'numeric',
        month: 'numeric',
      });
    } else if (period === '30days') {
      return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' });
    } else {
      return date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
    }
  };

  const aggregateDataForPeriod = (data: ChartData[]) => {
    if (period === '3months') {
      const monthlyData = data.reduce(
        (acc, item) => {
          const month = new Date(item.date).toISOString().slice(0, 7);
          if (!acc[month]) {
            acc[month] = { date: month, revenue: 0, orders: 0 };
          }
          acc[month].revenue += item.revenue;
          acc[month].orders += item.orders;
          return acc;
        },
        {} as Record<string, ChartData>
      );

      return Object.values(monthlyData).map(item => ({
        ...item,
        date: new Date(item.date + '-01').toLocaleDateString('vi-VN', {
          month: 'short',
          year: 'numeric',
        }),
      }));
    }

    return data.map(item => ({
      ...item,
      date: formatDate(item.date),
    }));
  };

  const chartData = aggregateDataForPeriod(salesData);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Enhanced Revenue Chart */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-0">
            Doanh Thu Theo Thời Gian
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Doanh thu</span>
          </div>
        </div>
        <div className="h-64 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                className="dark:stroke-gray-600"
              />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={value => formatCurrency(value)}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  padding: '12px',
                }}
                formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                labelStyle={{ color: '#374151', fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={3}
                fill="url(#revenueGradient)"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Enhanced Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Orders Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Số Đơn Hàng
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Đơn hàng</span>
            </div>
          </div>
          <div className="h-64 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  className="dark:stroke-gray-600"
                />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    padding: '12px',
                  }}
                  formatter={(value: number) => [value, 'Đơn hàng']}
                  labelStyle={{ color: '#374151', fontWeight: 600 }}
                />
                <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Sản Phẩm Bán Chạy
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Top {Math.min(topProducts.length, 8)}
            </div>
          </div>

          {topProducts.length > 0 ? (
            <div className="h-64 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topProducts.slice(0, 8).map((product, index) => ({
                      name:
                        product.name.length > 20 ? product.name.slice(0, 20) + '...' : product.name,
                      value: product.sales,
                      color: COLORS[index % COLORS.length],
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percent }: { percent?: number }) =>
                      percent ? `${(percent * 100).toFixed(0)}%` : ''
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="none"
                  >
                    {topProducts.slice(0, 8).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      padding: '12px',
                    }}
                    formatter={(value: number) => [value, 'Đã bán']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 sm:h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p>Chưa có dữ liệu sản phẩm</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Products List */}
      {topProducts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Chi Tiết Sản Phẩm Bán Chạy
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Sản phẩm
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Danh mục
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Đã bán
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Doanh thu
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {topProducts.slice(0, 10).map((product, index) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-600 dark:text-gray-400">
                      {product.category}
                    </td>
                    <td className="py-3 px-2 text-sm font-medium text-gray-900 dark:text-white text-right">
                      {product.sales}
                    </td>
                    <td className="py-3 px-2 text-sm font-medium text-gray-900 dark:text-white text-right">
                      {formatCurrency(product.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsCharts;
