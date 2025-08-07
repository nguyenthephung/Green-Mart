import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ui/ThemeToggle';
import { useNotificationStore } from '../stores/useNotificationStore';
import { useUserStore } from '../stores/useUserStore';
import NotificationDropdownContent from '../components/Guest/Notification/NotificationDropdownContent';
import AdminProfileModal from '../components/Admin/Profile/AdminProfileModal';
import AdminSettingsModal from '../components/Admin/Profile/AdminSettingsModal';
import { useAdminAutoScroll } from '../hooks/useAdminAutoScroll';

const adminMenu = [
  { label: 'Thống kê', path: '/admin/dashboard', icon: '📊', color: 'from-blue-500 to-blue-600' },
  { label: 'Phân tích & Báo cáo', path: '/admin/analytics', icon: '📈', color: 'from-cyan-500 to-cyan-600' },
  { label: 'Quản lý sản phẩm', path: '/admin/products', icon: '📦', color: 'from-green-500 to-green-600' },
  { label: 'Quản lý danh mục', path: '/admin/categories', icon: '🗂️', color: 'from-purple-500 to-purple-600' },
  { label: 'Quản lý người dùng', path: '/admin/users', icon: '👥', color: 'from-orange-500 to-orange-600' },
  { label: 'Quản lý đơn hàng', path: '/admin/orders', icon: '🧾', color: 'from-pink-500 to-pink-600' },
  { label: 'Quản lý voucher', path: '/admin/vouchers', icon: '🎁', color: 'from-yellow-500 to-yellow-600' },
  { label: 'Quản lý banner', path: '/admin/banners', icon: '🖼️', color: 'from-indigo-500 to-indigo-600' },
];

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

  const { user, logout } = useUserStore();
  const { unreadCount, fetchUnreadCount } = useNotificationStore();

  // Enable auto-scroll for admin routes
  useAdminAutoScroll({
    behavior: 'smooth',
    delay: 150,
    enabledRoutes: ['/admin']
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  // Fetch unread notifications count
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchUnreadCount]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const currentPage = adminMenu.find(item => item.path === location.pathname);

  return (
    <div
      className="min-h-screen flex bg-gray-50 dark:bg-gray-900"
      style={{ backgroundColor: isDarkMode ? '#111827' : '#f9fafb' }}
    >
      {/* Sidebar */}
      <aside
        className={`${isCollapsed ? 'w-20' : 'w-72'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-xl flex flex-col transition-all duration-300 ease-in-out relative overflow-visible`}
        style={{ backgroundColor: isDarkMode ? '#111827' : '#fff' }}
      >
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
            <div
              className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg"
              style={{ backgroundColor: isDarkMode ? '#111827' : '#fff' }}
            >
              <span className="text-2xl">🛒</span>
            </div>
            {!isCollapsed && (
              <div className="ml-3">
                <h1 className="text-xl font-bold text-white">GreenMart</h1>
                <p className="text-xs text-green-100">Admin Dashboard</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg bg-green-500 hover:bg-green-400 text-white transition-colors"
            title={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto overflow-x-visible">
          <div className="space-y-2">
            {adminMenu.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <div key={item.path} className="relative group">
                  <Link
                    to={item.path}
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} px-4 py-3 rounded-xl font-medium transition-all duration-200 relative overflow-hidden
                      ${isActive 
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105` 
                        : 'text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 dark:hover:text-white hover:text-gray-900 hover:scale-102'
                      }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-white opacity-20 rounded-xl"></div>
                    )}
                    {/* Active indicator for collapsed sidebar */}
                    {isCollapsed && isActive && (
                      <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"></div>
                    )}
                    <span className={`text-2xl transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <>
                        <span className="font-semibold relative z-10 flex-1">{item.label}</span>
                        {isActive && (
                          <div className="ml-auto">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </>
                    )}
                  </Link>
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 pointer-events-none shadow-lg">
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                      {item.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Utility buttons */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-2">
            <button
              onClick={handleBackToHome}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} px-4 py-3 rounded-xl font-medium transition-all duration-200 text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 dark:hover:text-white hover:text-gray-900 group`}
            >
              <span className="text-2xl transition-transform duration-200 group-hover:scale-110">🏠</span>
              {!isCollapsed && <span className="font-semibold">Về trang chủ</span>}
            </button>
            
            <button
              onClick={handleLogout}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} px-4 py-3 rounded-xl font-medium transition-all duration-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 group`}
            >
              <span className="text-2xl transition-transform duration-200 group-hover:scale-110">🚪</span>
              {!isCollapsed && <span className="font-semibold">Đăng xuất</span>}
            </button>
          </div>
        </nav>

        {/* Profile Section */}
        <div className="p-4 border-t border-gray-200 relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} p-3 rounded-xl hover:bg-gray-50 transition-colors relative group`}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-bold">
              A
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Admin User</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">admin@greenmart.com</p>
                </div>
                <span className="text-gray-400">⚙️</span>
              </>
            )}
            
            {/* Tooltip for collapsed profile */}
            {isCollapsed && (
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 pointer-events-none shadow-lg">
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                Admin User
              </div>
            )}
          </button>

          {/* Profile Dropdown */}
          {showProfile && !isCollapsed && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-2 z-50" style={{ backgroundColor: isDarkMode ? '#111827' : '#fff' }}>
              <button 
                onClick={() => {
                  setShowProfile(false);
                  setShowProfileModal(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300"
              >
                <span>👤</span>
                Hồ sơ cá nhân
              </button>
              <button 
                onClick={() => {
                  setShowProfile(false);
                  setShowSettingsModal(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300"
              >
                <span>⚙️</span>
                Cài đặt
              </button>
              <div className="border-t border-gray-200 my-2"></div>
              <button 
                onClick={() => {
                  setShowProfile(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm text-gray-700 dark:text-gray-300"
              >
                <span>🚪</span>
                Đăng xuất
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 text-center">
            <div className="text-xs text-gray-400 mb-2">GreenMart Admin © 2025</div>
            <div className="flex justify-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium">Đang hoạt động</span>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main
        className="flex-1 flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900"
        style={{ backgroundColor: isDarkMode ? '#111827' : '#f9fafb' }}
      >
        {/* Top Header */}
        <header
          className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-4 shadow-sm"
          style={{ backgroundColor: isDarkMode ? '#111827' : '#fff' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${currentPage?.color || 'from-gray-500 to-gray-600'} flex items-center justify-center`}>
                <span className="text-white text-lg">{currentPage?.icon || '📄'}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{currentPage?.label || 'Trang Admin'}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>🏠</span>
                  <span>Admin</span>
                  <span>/</span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{currentPage?.label || 'Trang'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <ThemeToggle size="sm" />
                
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors relative"
                    title="Thông báo"
                  >
                    <span className="text-lg">🔔</span>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 top-full mt-2 z-50">
                      <NotificationDropdownContent onClose={() => setShowNotifications(false)} />
                    </div>
                  )}

                  {/* Backdrop to close dropdown */}
                  {showNotifications && (
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowNotifications(false)}
                    />
                  )}
                </div>
              </div>
              
              {/* Current Time */}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {new Date().toLocaleString('vi-VN')}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content with Auto-scroll Support */}
        <div 
          className="flex-1 p-8 bg-gray-50 dark:bg-gray-900 admin-layout-container overflow-y-auto" 
          data-main-content
          style={{ backgroundColor: isDarkMode ? '#111827' : '#f9fafb' }}
        >
          <Outlet />
        </div>
      </main>

      {/* Profile and Settings Modals */}
      <AdminProfileModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
      <AdminSettingsModal 
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  );
};

export default AdminLayout;


