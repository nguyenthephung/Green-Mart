import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaUser,
  FaMapMarkerAlt,
  FaBell,
  FaBook,
  FaSignOutAlt,
  FaBox,
  FaStar,
} from 'react-icons/fa';
import { useUserStore } from '../../../stores/useUserStore';
import LuckyWheel from '../Account/LuckyWheel';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const user = useUserStore(state => state.user);
  const logout = useUserStore(state => state.logout);
  const [showLuckyWheel, setShowLuckyWheel] = useState(false);

  const menuItems = [
    { icon: <FaUser />, label: 'Thông tin tài khoản', path: '/accountdetail' },
    { icon: <FaBox />, label: 'Đơn hàng của tôi', path: '/myorder' },
    { icon: <FaMapMarkerAlt />, label: 'Địa chỉ của tôi', path: '/myaddress' },
    { icon: <FaBell />, label: 'Cài đặt thông báo', path: '/notification-settings' },
    { icon: <FaBook />, label: 'Mã giảm giá', path: '/myvoucher' },
  ];

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <>
      <aside className="w-72 p-6 pt-24 bg-app-secondary border-r border-app-border shadow-sm flex flex-col h-full">
        {/* User Profile */}
        <div className="flex items-center gap-4 mb-8 p-4 bg-app-card rounded-xl shadow-sm border-app-default">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-app-primary">{user?.name || 'User'}</h4>
            <p className="text-sm text-app-secondary">{user?.email}</p>
          </div>
        </div>

        {/* Lucky Wheel Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowLuckyWheel(true)}
            className="w-full p-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 group"
          >
            <FaStar className="group-hover:animate-spin" />
            <span className="font-semibold">Vòng quay may mắn</span>
            <FaStar className="group-hover:animate-spin" />
          </button>
        </div>

        {/* Menu Items - Flex grow to push logout to bottom */}
        <nav className="space-y-2 flex-grow">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-brand-green text-white shadow-lg'
                    : 'text-app-primary hover:bg-app-card hover:shadow-md hover:text-brand-green'
                }`}
              >
                <span className={`text-lg ${isActive ? 'text-white' : 'text-brand-green'}`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button - At bottom */}
        <div className="mt-6 pt-4 border-t border-app-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 text-app-primary hover:text-red-500 hover:bg-app-card rounded-xl transition-all duration-200 group"
          >
            <FaSignOutAlt className="text-lg group-hover:text-red-500" />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Lucky Wheel Modal */}
      <LuckyWheel
        userId={user?.id || 1}
        isOpen={showLuckyWheel}
        onClose={() => setShowLuckyWheel(false)}
      />
    </>
  );
};

export default Sidebar;
