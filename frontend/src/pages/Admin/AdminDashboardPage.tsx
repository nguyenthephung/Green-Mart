import React, { useState, useEffect } from 'react';
import { recentOrders, topProducts, quickStats } from '../../data/Admin/dashboard';

const AdminDashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [notifications] = useState([
    { id: 1, message: '5 sản phẩm sắp hết hàng', type: 'warning', time: '5 phút trước' },
    { id: 2, message: 'Đơn hàng #DH001 đã được giao', type: 'success', time: '10 phút trước' },
    { id: 3, message: '12 khách hàng mới đăng ký', type: 'info', time: '15 phút trước' },
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

  const filteredOrders = recentOrders.filter(order => {
    if (selectedFilter === 'all') return true;
    return order.status === selectedFilter;
  });

  return (
    <div className="min-h-screen">
      {/* Header & Notifications */}
      <div className="mb-8 relative">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">{getGreeting()}</h1>
            <p className="text-gray-600">Đây là tổng quan về hoạt động của GreenMart</p>
            <p className="text-sm text-gray-500 mt-1">
              {currentTime.toLocaleDateString('vi-VN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} - {currentTime.toLocaleTimeString('vi-VN')}
            </p>
          </div>
          <div className="relative">
            <div className="bg-white rounded-xl shadow-lg p-4 max-w-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">Thông báo</h3>
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {notifications.length}
                </span>
              </div>
              <ul className="space-y-2">
                {notifications.map(n => (
                  <li key={n.id} className="flex justify-between items-center text-sm">
                    <span>{n.message}</span>
                    <span className="text-gray-400 text-xs">{n.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {quickStats.map((stat, i) => (
            <div 
              key={i} 
              className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color} group-hover:scale-110 transition-transform`}>
                    {stat.value}
                  </p>
                </div>
                <div className="text-2xl group-hover:animate-bounce">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Đơn hàng gần đây</h2>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                {['all', 'Đã giao', 'Đang xử lý', 'Đang vận chuyển'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedFilter === filter 
                        ? 'bg-green-600 text-white shadow-md' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filter === 'all' ? 'Tất cả' : filter}
                  </button>
                ))}
              </div>
              <button className="text-green-600 font-semibold hover:text-green-700 transition-colors hover:underline">
                Xem tất cả →
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b-2 border-gray-100">
                  <th className="py-3 font-semibold hover:text-gray-700 cursor-pointer">Mã đơn hàng ↕</th>
                  <th className="py-3 font-semibold hover:text-gray-700 cursor-pointer">Khách hàng ↕</th>
                  <th className="py-3 font-semibold hover:text-gray-700 cursor-pointer">Tổng tiền ↕</th>
                  <th className="py-3 font-semibold hover:text-gray-700 cursor-pointer">Trạng thái ↕</th>
                  <th className="py-3 font-semibold hover:text-gray-700 cursor-pointer">Thời gian ↕</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o, index) => (
                  <tr 
                    key={o.id} 
                    className="border-b border-gray-50 hover:bg-green-50 transition-all duration-200 cursor-pointer group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="py-4 font-semibold text-gray-800 group-hover:text-green-700">{o.id}</td>
                    <td className="py-4 group-hover:font-medium">{o.user}</td>
                    <td className="py-4 font-bold text-green-600 group-hover:scale-105 transition-transform">
                      {o.total.toLocaleString()}đ
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold transition-all group-hover:scale-105 ${
                        o.status === 'Đã giao' ? 'bg-green-100 text-green-700 group-hover:bg-green-200' : 
                        o.status === 'Đã hủy' ? 'bg-red-100 text-red-600 group-hover:bg-red-200' : 
                        o.status === 'Đang vận chuyển' ? 'bg-blue-100 text-blue-700 group-hover:bg-blue-200' :
                        'bg-yellow-100 text-yellow-700 group-hover:bg-yellow-200'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-4 text-gray-500 group-hover:text-gray-700">
                      <div className="font-medium">{o.date}</div>
                      <div className="text-xs">{o.time}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Sản phẩm bán chạy</h2>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Cập nhật:</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-4">
            {topProducts.map((product, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-green-50 transition-all duration-300 cursor-pointer group hover:scale-102 transform"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold transition-all group-hover:scale-110 ${
                    i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-yellow-600' : 'bg-green-500'
                  }`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </div>
                  <div className="group-hover:translate-x-1 transition-transform">
                    <p className="font-semibold text-gray-800 group-hover:text-green-700">{product.name}</p>
                    <p className="text-sm text-gray-500">Đã bán: {product.sold} sản phẩm</p>
                  </div>
                </div>
                <div className="text-right group-hover:scale-105 transition-transform">
                  <p className="font-bold text-green-600">{product.revenue.toLocaleString()}đ</p>
                  <p className="text-lg">{product.trend}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex space-x-2">
            <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium">
              📊 Xem báo cáo
            </button>
            <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              📈 Phân tích
            </button>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Doanh thu 7 ngày qua</h2>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium">
              7 ngày
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              30 ngày
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              3 tháng
            </button>
          </div>
        </div>
        <div className="h-64 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="absolute w-2 h-2 bg-green-500 rounded-full animate-ping" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${i * 0.5}s`, animationDuration: '3s' }} />
            ))}
          </div>
          <div className="text-center z-10">
            <div className="text-6xl mb-4 animate-bounce">📊</div>
            <p className="text-gray-500 text-lg font-medium">Biểu đồ doanh thu sẽ hiển thị tại đây</p>
            <p className="text-gray-400 text-sm mt-2">Tích hợp với thư viện biểu đồ như Chart.js hoặc Recharts</p>
            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/50 rounded-lg p-3">
                <p className="text-2xl font-bold text-green-600">45.2M</p>
                <p className="text-xs text-gray-500">Doanh thu tuần</p>
              </div>
              <div className="bg-white/50 rounded-lg p-3">
                <p className="text-2xl font-bold text-blue-600">+15%</p>
                <p className="text-xs text-gray-500">Tăng trưởng</p>
              </div>
              <div className="bg-white/50 rounded-lg p-3">
                <p className="text-2xl font-bold text-purple-600">328</p>
                <p className="text-xs text-gray-500">Đơn hàng</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 hover:scale-110 transition-all duration-300 group">
          <svg className="w-6 h-6 group-hover:rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Loading Overlay for Demo */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white rounded-lg shadow-lg p-3 flex items-center space-x-2 opacity-90">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Đồng bộ dữ liệu...</span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
