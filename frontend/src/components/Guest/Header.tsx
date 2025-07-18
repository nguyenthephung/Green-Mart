import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, User, Home, Bell, LogOut } from 'lucide-react';
import { useCart } from '../../reduxSlice/CartContext';
import { useUser } from '../../reduxSlice/UserContext';

import NotificationDropdown from './NotificationDropdown';

const Header: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  let dropdownTimeout: NodeJS.Timeout | null = null;
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const { user, logout } = useUser();

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim() !== '') {
      navigate(`/search?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleDropdownEnter = () => {
    if (dropdownTimeout) clearTimeout(dropdownTimeout);
    setShowDropdown(true);
  };
  const handleDropdownLeave = () => {
    dropdownTimeout = setTimeout(() => setShowDropdown(false), 120);
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate('/home');
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-lg transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/home')}
          >
            <div className="relative">
              <img
                src="/logo.jpg"
                alt="Logo"
                className="h-12 w-12 rounded-xl shadow-lg group-hover:scale-105 transition-all duration-300 ring-2 ring-green-100"
              />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-green-600 group-hover:text-green-700 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 2C10 7 5 9 5 13a7 7 0 1014 0c0-4-5-6-7-11z"
                />
              </svg>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-gray-800 tracking-tight group-hover:text-green-600 transition-colors">
                  Green Mart
                </span>
                <span className="text-xs text-green-600 font-medium -mt-1">
                  Fresh & Organic
                </span>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <form
            onSubmit={handleSearch}
            className="flex-1 max-w-xl mx-8 relative"
          >
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-hover:text-green-500 transition-colors" />
              </div>
              <input
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:bg-white hover:shadow-md"
                placeholder="Tìm kiếm sản phẩm tươi ngon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <Search size={16} />
              </button>
            </div>
          </form>

          {/* Actions Section */}
          <div className="flex items-center gap-2">
            {/* Home Button */}
            <button
              onClick={() => navigate('/home')}
              className="p-3 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-300 group relative"
              title="Trang chủ"
            >
              <Home size={20} className="group-hover:scale-110 transition-transform" />
            </button>

            {/* Notifications */}
            <div
              className="relative"
              onMouseEnter={handleDropdownEnter}
              onMouseLeave={handleDropdownLeave}
            >
              <button
                className="p-3 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-300 group relative"
                tabIndex={0}
                aria-label="Xem thông báo"
                type="button"
                title="Thông báo"
              >
                <Bell size={20} className="group-hover:scale-110 transition-transform" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>
              {showDropdown && (
                <div 
                  onMouseEnter={handleDropdownEnter} 
                  onMouseLeave={handleDropdownLeave}
                  className="absolute top-full right-0 mt-2"
                >
                  <NotificationDropdown onClose={() => setShowDropdown(false)} />
                </div>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={() => navigate('/mycart')}
              className="p-3 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-300 group relative"
              title="Giỏ hàng"
            >
              <span id="cart-fly-icon" className="inline-block relative">
                <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-white font-bold animate-bounce">
                    {getCartCount()}
                  </span>
                )}
              </span>
            </button>

            {/* Account Button */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 font-medium"
                >
                  <User size={18} />
                  <span className="hidden sm:inline">{user.name}</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <button
                      onClick={() => {
                        navigate('/accountdetail');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-2"
                    >
                      <User size={16} />
                      Thông tin tài khoản
                    </button>
                    <button
                      onClick={() => {
                        navigate('/myorder');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-2"
                    >
                      <ShoppingCart size={16} />
                      Đơn hàng của tôi
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 font-medium"
              >
                <User size={18} />
                <span className="hidden sm:inline">Đăng nhập</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
