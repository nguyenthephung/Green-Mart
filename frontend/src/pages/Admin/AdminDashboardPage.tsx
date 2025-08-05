import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboardService';
import type { QuickStats, RecentOrder, TopProduct } from '../../services/dashboardService';

const AdminDashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  
  // Data states
  // const [stats, setStats] = useState<DashboardStats[]>([]);
  const [quickStats, setQuickStats] = useState<QuickStats[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  
  // Theme state for reactive background fix
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  // Chế độ dark: true = nền đen, false = chữ đen
  const [darkModeType] = useState<'background' | 'text'>('background');
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Load data when filter changes
  useEffect(() => {
    loadRecentOrders();
  }, [selectedFilter]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load stats and quick stats
      const statsData = await dashboardService.getDashboardStats();
      // setStats(statsData.stats);
      setQuickStats(statsData.quickStats);

      // Load top products
      const productsData = await dashboardService.getTopProducts({ limit: 4 });
      setTopProducts(productsData);

      // Load recent orders
      await loadRecentOrders();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentOrders = async () => {
    try {
      const ordersData = await dashboardService.getRecentOrders({
        limit: 10,
        status: selectedFilter
      });
      setRecentOrders(ordersData.orders);
    } catch (error) {
      console.error('Error loading recent orders:', error);
      setRecentOrders([]);
    }
  };
  const [notifications] = useState([
    { id: 1, message: `${quickStats.find(s => s.label === 'Sản phẩm hết hàng')?.value || 0} sản phẩm sắp hết hàng`, type: 'warning', time: '5 phút trước' },
    { id: 2, message: 'Đơn hàng mới đã được đặt', type: 'success', time: '10 phút trước' },
    { id: 3, message: `${quickStats.find(s => s.label === 'Khách hàng mới')?.value || 0} khách hàng mới đăng ký`, type: 'info', time: '15 phút trước' },
  ]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Chào buổi sáng! ☀️';
    if (hour < 18) return 'Chào buổi chiều! 🌤️';
    return 'Chào buổi tối! 🌙';
  };

  // Use dynamic data instead of static filtered orders
  const filteredOrders = recentOrders; // Already filtered by API

  return (
    <div
      className="space-y-8"
      style={
        isDarkMode
          ? darkModeType === 'background'
            ? { backgroundColor: '#111827', color: '#fff' }
            : { backgroundColor: '#fff', color: '#111827' }
          : undefined
      }
    >
      {/* Header & Notifications */}
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">{getGreeting()}</h1>
            <p className="text-gray-600 dark:text-gray-300">Đây là tổng quan về hoạt động của GreenMart</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {currentTime.toLocaleDateString('vi-VN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} - {currentTime.toLocaleTimeString('vi-VN')}
            </p>
          </div>
          <div className="relative">
            <div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 max-w-sm"
              style={{ backgroundColor: isDarkMode ? '#18181b' : '#fff' }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800 dark:text-white">Thông báo</h3>
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {notifications.length}
                </span>
              </div>
              <ul className="space-y-2">
                {notifications.map(n => (
                  <li key={n.id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{n.message}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-xs">{n.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading ? (
            // Loading skeleton
            [...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border-l-4 border-green-500 dark:border-green-400 animate-pulse"
                style={{ backgroundColor: isDarkMode ? '#18181b' : '#fff' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-2"></div>
                    <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                  </div>
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
              </div>
            ))
          ) : (
            quickStats.map((stat, i) => (
              <div 
                key={i} 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border-l-4 border-green-500 dark:border-green-400 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group"
                style={{ backgroundColor: isDarkMode ? '#18181b' : '#fff' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color} dark:text-${stat.color?.split('-')[1] || 'green'}-400 group-hover:scale-110 transition-transform`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className="text-2xl group-hover:animate-bounce">{stat.icon}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-8">
        {/* Recent Orders */}
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
          style={{ backgroundColor: isDarkMode ? '#18181b' : '#fff' }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Đơn hàng gần đây</h2>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                {['all', 'completed', 'processing', 'shipping'].map((filter) => {
                  const isSelected = selectedFilter === filter;
                  const filterLabels = {
                    'all': 'Tất cả',
                    'completed': 'Đã giao', 
                    'processing': 'Đang xử lý',
                    'shipping': 'Đang vận chuyển'
                  };
                  return (
                    <button
                      key={filter}
                      onClick={() => setSelectedFilter(filter)}
                      disabled={loading}
                      style={
                        isDarkMode
                          ? isSelected
                            ? { backgroundColor: '#23272f', color: '#fff', boxShadow: '0 2px 8px 0 #0002' }
                            : { backgroundColor: '#23272f', color: '#e5e7eb' }
                          : isSelected
                            ? { backgroundColor: '#d1fae5', color: '#065f46', boxShadow: '0 2px 8px 0 #10b98122' }
                            : { backgroundColor: '#f3f4f6', color: '#374151' }
                      }
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all disabled:opacity-50 ${
                        isSelected
                          ? 'shadow-md'
                          : 'hover:bg-gray-200 dark:hover:bg-[#18181b]'
                      }`}
                    >
                      {filterLabels[filter as keyof typeof filterLabels]}
                    </button>
                  );
                })}
              </div>
              <button className="text-green-600 dark:text-green-400 font-semibold hover:text-green-700 dark:hover:text-green-300 transition-colors hover:underline">
                Xem tất cả →
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-800 dark:text-gray-200 border-b-2 border-gray-100 dark:border-gray-700">
                  <th className="py-3 font-semibold hover:text-green-700 dark:hover:text-green-300 cursor-pointer">Mã đơn hàng ↕</th>
                  <th className="py-3 font-semibold hover:text-green-700 dark:hover:text-green-300 cursor-pointer">Khách hàng ↕</th>
                  <th className="py-3 font-semibold hover:text-green-700 dark:hover:text-green-300 cursor-pointer">Tổng tiền ↕</th>
                  <th className="py-3 font-semibold hover:text-green-700 dark:hover:text-green-300 cursor-pointer">Trạng thái ↕</th>
                  <th className="py-3 font-semibold hover:text-green-700 dark:hover:text-green-300 cursor-pointer">Thời gian ↕</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o, index) => (
                  <tr
                    key={o.id}
                    className="border-b border-gray-50 dark:border-gray-700 transition-all duration-200 cursor-pointer group"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      ...(isDarkMode
                        ? { backgroundColor: undefined }
                        : { backgroundColor: undefined })
                    }}
                    onMouseEnter={e => {
                      if (isDarkMode) e.currentTarget.style.backgroundColor = '#18181b';
                      else e.currentTarget.style.backgroundColor = '#e5e7eb';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = '';
                    }}
                  >
                    <td className="py-4 font-semibold text-gray-800 dark:text-white"
                      style={isDarkMode ? { color: '#fff' } : {}}
                    >{o.id}</td>
                    <td className="py-4 text-gray-800 dark:text-gray-200"
                      style={isDarkMode ? { color: '#e5e7eb' } : {}}
                    >{o.user}</td>
                    <td className="py-4 font-bold text-green-600 dark:text-green-400 group-hover:scale-105 transition-transform"
                      style={isDarkMode ? { color: '#22d3ee' } : {}}
                    >
                      {o.total.toLocaleString()}đ
                    </td>
                    <td className="py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all group-hover:scale-105`}
                        style={
                          isDarkMode
                            ? o.status === 'completed'
                              ? { backgroundColor: '#23272f', color: '#4ade80' } // green
                              : o.status === 'cancelled'
                                ? { backgroundColor: '#23272f', color: '#f87171' } // red
                                : o.status === 'shipping'
                                  ? { backgroundColor: '#23272f', color: '#60a5fa' } // blue
                                  : { backgroundColor: '#23272f', color: '#fde68a' } // yellow
                            : o.status === 'completed'
                              ? { backgroundColor: '#bbf7d0', color: '#166534' }
                              : o.status === 'cancelled'
                                ? { backgroundColor: '#fecaca', color: '#991b1b' }
                                : o.status === 'shipping'
                                  ? { backgroundColor: '#bae6fd', color: '#1e40af' }
                                  : { backgroundColor: '#fef9c3', color: '#92400e' }
                        }
                      >
                        {o.status === 'completed' ? 'Đã giao' : 
                         o.status === 'cancelled' ? 'Đã hủy' :
                         o.status === 'shipping' ? 'Đang vận chuyển' :
                         o.status === 'processing' ? 'Đang xử lý' : o.status}
                      </span>
                    </td>
                    <td className="py-4"
                      style={isDarkMode ? { color: '#fff' } : {}}
                    >
                      <div className="font-medium px-2 py-1 rounded"
                        style={{ backgroundColor: isDarkMode ? '#23272f' : '#f3f4f6', color: isDarkMode ? '#fff' : '#23272f' }}
                      >{o.date}</div>
                      <div className="text-xs px-2 py-0.5 rounded mt-1"
                        style={{ backgroundColor: isDarkMode ? '#23272f' : '#f9fafb', color: isDarkMode ? '#e5e7eb' : '#374151' }}
                      >{o.time}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
          style={{ backgroundColor: isDarkMode ? '#111827' : '#fff' }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Sản phẩm bán chạy</h2>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Cập nhật:</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-4">
            {topProducts.map((product, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-4 rounded-xl transition-all duration-300 cursor-pointer group hover:scale-102 transform"
                style={{
                  backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
                  ...(isDarkMode
                    ? { boxShadow: '0 1px 4px 0 rgba(0,0,0,0.25)' }
                    : { boxShadow: '0 1.5px 8px 0 rgba(16,185,129,0.07)' })
                }}
              >
                <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold transition-all group-hover:scale-110 ${
                i === 0 ? 'bg-yellow-500 dark:bg-yellow-700' : i === 1 ? 'bg-gray-400 dark:bg-gray-700' : i === 2 ? 'bg-yellow-600 dark:bg-yellow-800' : 'bg-green-500 dark:bg-green-700'
              }`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </div>
                  <div className="group-hover:translate-x-1 transition-transform">
                    <p className="font-semibold text-gray-800 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400">{product.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Đã bán: {product.sold} sản phẩm</p>
                  </div>
                </div>
                <div className="text-right group-hover:scale-105 transition-transform">
                  <p className="font-bold text-green-600 dark:text-green-400">{product.revenue.toLocaleString()}đ</p>
                  <p className="text-lg">{product.trend}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex space-x-2">
            <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-colors font-medium">
              📊 Xem báo cáo
            </button>
            <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors font-medium">
              📈 Phân tích
            </button>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
          style={{ backgroundColor: isDarkMode ? '#18181b' : '#fff' }}
        >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Doanh thu 7 ngày qua</h2>
          <div className="flex space-x-2">
            <button
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={isDarkMode ? { backgroundColor: '#23272f', color: '#fff' } : { backgroundColor: '#10b981', color: '#fff' }}
            >
              7 ngày
            </button>
            <button
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={isDarkMode ? { backgroundColor: '#23272f', color: '#e5e7eb' } : { backgroundColor: '#f3f4f6', color: '#374151' }}
            >
              30 ngày
            </button>
            <button
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={isDarkMode ? { backgroundColor: '#23272f', color: '#e5e7eb' } : { backgroundColor: '#f3f4f6', color: '#374151' }}
            >
              3 tháng
            </button>
          </div>
        </div>
        <div className="h-64 bg-gradient-to-r from-gray-700 to-gray-600 dark:from-gray-900 dark:to-gray-800 rounded-xl flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="absolute w-2 h-2 bg-green-500 rounded-full animate-ping" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${i * 0.5}s`, animationDuration: '3s' }} />
            ))}
          </div>
          <div className="text-center z-10">
            <div className="text-6xl mb-4 animate-bounce">📊</div>
            <p className="text-gray-300 text-lg font-medium">Biểu đồ doanh thu sẽ hiển thị tại đây</p>
            <p className="text-gray-800 dark:text-gray-200 text-sm mt-2">Tích hợp với thư viện biểu đồ như Chart.js hoặc Recharts</p>
            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div className="!bg-gray-800/70 dark:!bg-gray-900/80 rounded-lg p-3">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">45.2M</p>
                <p className="text-xs text-gray-400 dark:text-gray-300">Doanh thu tuần</p>
              </div>
              <div className="!bg-gray-800/70 dark:!bg-gray-900/80 rounded-lg p-3">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">+15%</p>
                <p className="text-xs text-gray-400 dark:text-gray-300">Tăng trưởng</p>
              </div>
              <div className="!bg-gray-800/70 dark:!bg-gray-900/80 rounded-lg p-3">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">328</p>
                <p className="text-xs text-gray-400 dark:text-gray-300">Đơn hàng</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 hover:scale-110 transition-all duration-300 group">
          <svg className="w-6 h-6 group-hover:rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Loading Overlay for Demo */}
      <div className="fixed top-4 right-4 z-50">
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 flex items-center space-x-2 opacity-90"
          style={{ backgroundColor: isDarkMode ? '#18181b' : '#fff' }}
        >
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-800 dark:text-gray-300">Đồng bộ dữ liệu...</span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
