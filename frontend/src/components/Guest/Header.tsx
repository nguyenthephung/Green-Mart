import { useState, useEffect, useRef, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, User, Home, Bell, LogOut, Heart, Menu, X, ChevronDown, MapPin, Gift, Settings, Zap } from 'lucide-react';
import { useCartStore } from '../../stores/useCartStore';
import { CartIconWrapper } from '../../hooks/useAddToCartAnimation';
import { useUserStore } from '../../stores/useUserStore';
import { useWishlistStore } from '../../stores/useWishlistStore';
import { useNotificationStore } from '../../stores/useNotificationStore';
import { useCategoryStore } from '../../stores/useCategoryStore';
import { useResponsive } from '../../hooks/useResponsive';
import NotificationDropdownContent from './Notification/NotificationDropdownContent';
import ThemeToggle from '../ui/ThemeToggle';
import CategoryBar from './CategoryBar';
import LuckyWheel from './Account/LuckyWheel';

const Header: React.FC = memo(() => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCategoryBar, setShowCategoryBar] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileCategoryMenu, setShowMobileCategoryMenu] = useState(false);
  const [showLuckyWheel, setShowLuckyWheel] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  let dropdownTimeout: NodeJS.Timeout | null = null;
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if current page should hide category bar
  const shouldHideCategoryBar = location.pathname.includes('order-success') || location.pathname.includes('guest-order-success');
  
  // Responsive hook
  const { isMobile, width } = useResponsive();
  
  // Debug info (temporary)
  console.log('Header Debug:', { isMobile, width, windowWidth: typeof window !== 'undefined' ? window.innerWidth : 'SSR' });
  
  // Categories
  const { categories } = useCategoryStore();
  
  // Use cartCount selector so Header re-renders when cart changes
  const cartCount = useCartStore(state => state.totalItems);
  const fetchCart = useCartStore(state => state.fetchCart);
  const user = useUserStore(state => state.user);
  const logout = useUserStore(state => state.logout);
  // Get notification store
  const { unreadCount, fetchUnreadCount } = useNotificationStore();
  // Use reactive wishlist count instead of function
  const wishlistCount = useWishlistStore(state => state.items.length);
  
  // Fetch cart on mount và khi user thay đổi để đảm bảo count luôn đúng
  useEffect(() => {
    fetchCart(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Fetch cart on mount and khi user thay đổi để đảm bảo count luôn đúng
  useEffect(() => {
    fetchCart(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Fetch unread notifications count when user is available
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Poll every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchUnreadCount]);

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
    <header className="sticky top-0 left-0 w-full z-50 bg-app-header border-b border-app-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile menu button */}
          {isMobile && (
            <button
              className="p-2 text-app-secondary hover:text-app-primary hover:bg-app-secondary dark:hover:text-green-400 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-200 mr-2"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Toggle mobile menu"
            >
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}

          {/* Logo Section */}
          <div 
            className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
            onClick={() => navigate('/home')}
          >
            <div className="relative">
              <img
                src="/logo.jpg"
                alt="Logo"
                className={`rounded-xl shadow-lg ring-2 ring-green-100 ${isMobile ? 'h-8 w-8' : 'h-12 w-12'}`}
              />
              <div className={`absolute -top-1 -right-1 bg-green-500 rounded-full animate-pulse ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`}></div>
            </div>
            {!isMobile && (
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 text-green-600"
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
                  <span className="text-2xl font-black text-app-primary tracking-tight">
                    Green Mart
                  </span>
                  <span className="text-xs text-green-600 font-medium -mt-1">
                    Fresh & Organic
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Search Section - Hidden on mobile, shown in mobile menu */}
          {!isMobile && (
            <form
              onSubmit={handleSearch}
              className="flex-1 max-w-xl mx-8 relative"
            >
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-app-muted" />
                </div>
                <input
                  className="w-full pl-12 pr-20 py-3 bg-app-input border border-app-border rounded-2xl text-app-primary placeholder-app-muted focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-medium"
                  placeholder="Tìm kiếm sản phẩm tươi ngon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  <Search size={16} />
                </button>
              </div>
            </form>
          )}

          {/* Desktop Actions Section */}
          {!isMobile && (
            <div className="flex items-center gap-3 flex-shrink-0">{/* Increased gap from 2 to 3 for better spacing */}
            {/* Category Menu Button - Desktop only, hide on order success pages */}
            {!shouldHideCategoryBar && (
              <button
                className="p-3 text-app-secondary hover:text-app-primary hover:bg-app-secondary dark:hover:text-green-400 dark:hover:bg-green-900/20 rounded-xl group relative transition-colors duration-200"
                onClick={() => setShowCategoryBar(!showCategoryBar)}
                title={showCategoryBar ? 'Ẩn danh mục' : 'Hiện danh mục'}
              >
                <Menu size={20} />
              </button>
            )}
            
            {/* Theme Toggle */}
            <ThemeToggle size="sm" className="mr-1" />
            
            {/* Home Button */}
            <button
              onClick={() => navigate('/home')}
              className="p-3 text-app-secondary hover:text-app-primary hover:bg-app-secondary dark:hover:text-green-400 dark:hover:bg-green-900/20 rounded-xl group relative transition-colors duration-200"
              title="Trang chủ"
            >
              <Home size={20} />
            </button>

            {/* Notifications */}
            <div
              className="relative"
              onMouseEnter={handleDropdownEnter}
              onMouseLeave={handleDropdownLeave}
            >
              <button
                className="p-3 text-app-secondary hover:text-app-primary hover:bg-app-secondary dark:hover:text-green-400 dark:hover:bg-green-900/20 rounded-xl group relative transition-colors duration-200"
                tabIndex={0}
                aria-label="Xem thông báo"
                type="button"
                title="Thông báo"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              {showDropdown && (
                <div 
                  onMouseEnter={handleDropdownEnter} 
                  onMouseLeave={handleDropdownLeave}
                  className="absolute top-full right-0 mt-2 z-[100] transform transition-all duration-200 ease-out opacity-100 scale-100 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 min-w-[400px]"
                  style={{
                    animation: showDropdown ? 'fadeInDown 0.2s ease-out' : 'fadeOutUp 0.2s ease-in'
                  }}
                >
                  <NotificationDropdownContent onClose={() => setShowDropdown(false)} />
                </div>
              )}
            </div>

            {/* Cart Button - Fixed positioning */}
            <CartIconWrapper>
              <button
                onClick={() => navigate('/mycart')}
                className="p-3 text-app-secondary hover:text-app-primary hover:bg-app-secondary dark:hover:text-green-400 dark:hover:bg-green-900/20 rounded-xl group relative transition-colors duration-200"
                title="Giỏ hàng"
              >
                <span id="cart-fly-icon" className="inline-block relative">
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 translate-x-[80%] -translate-y-2/3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800 font-bold min-w-[20px] transition-all duration-300 ease-out transform scale-100 animate-bounce-once">
                      <span className="transition-all duration-200">{cartCount}</span>
                    </span>
                  )}
                </span>
              </button>
            </CartIconWrapper>

            {/* Wishlist Button - Fixed positioning */}
            <button
              onClick={() => navigate('/wishlist')}
              className="p-3 text-app-secondary hover:text-app-primary hover:bg-app-secondary dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-xl group relative transition-colors duration-200"
              title="Danh sách yêu thích"
            >
              <span className="inline-block relative">
                <Heart size={20} />
                {user && wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 translate-x-[60%] -translate-y-2/3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800 font-bold min-w-[20px]">
                    {wishlistCount}
                  </span>
                )}
              </span>
            </button>

            {/* Account Button */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg font-medium transition-colors duration-200"
                >
                  <User size={18} />
                  <span className="hidden sm:inline">{user.name}</span>
                </button>
                
                {showUserMenu && (
                  <div 
                    className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-app-primary">{user.name}</p>
                          <p className="text-sm text-app-secondary">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <button
                        onClick={() => {
                          navigate('/accountdetail');
                          setShowUserMenu(false);
                        }}
                        className="dropdown-item text-app-primary"
                      >
                        <div className="icon-wrapper">
                          <User size={16} className="group-hover:text-brand-green" />
                        </div>
                        <span className="font-medium">Thông tin tài khoản</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          navigate('/myorder');
                          setShowUserMenu(false);
                        }}
                        className="dropdown-item text-app-primary"
                      >
                        <div className="icon-wrapper">
                          <ShoppingCart size={16} className="group-hover:text-brand-green" />
                        </div>
                        <span className="font-medium">Đơn hàng của tôi</span>
                      </button>

                      <button
                        onClick={() => {
                          navigate('/wishlist');
                          setShowUserMenu(false);
                        }}
                        className="dropdown-item text-app-primary"
                      >
                        <div className="icon-wrapper">
                          <Heart size={16} className="group-hover:text-red-600" />
                        </div>
                        <span className="font-medium">Danh sách yêu thích</span>
                        {wishlistCount > 0 && (
                          <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium ml-auto relative z-10">
                            {wishlistCount}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setShowLuckyWheel(true);
                          setShowUserMenu(false);
                        }}
                        className="dropdown-item text-app-primary"
                      >
                        <div className="icon-wrapper">
                          <Zap size={16} className="group-hover:text-yellow-600" />
                        </div>
                        <span className="font-medium">Vòng xoay may mắn</span>
                      </button>

                    </div>
                    
                    <div className="border-t border-app-border pt-2">
                      <button
                        onClick={handleLogout}
                        className="dropdown-item text-red-600"
                      >
                        <div className="icon-wrapper">
                          <LogOut size={16} className="group-hover:text-red-600" />
                        </div>
                        <span className="font-medium">Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg font-medium"
              >
                <User size={18} />
                <span className="hidden sm:inline">Đăng nhập</span>
              </button>
            )}
          </div>
          )}

          {/* Mobile Actions Section */}
          {isMobile && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Notifications for mobile */}
              {user && (
                <div
                  className="relative"
                  onMouseEnter={handleDropdownEnter}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button
                    className="p-2 text-app-secondary hover:text-app-primary hover:bg-app-secondary dark:hover:text-green-400 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    tabIndex={0}
                    aria-label="Xem thông báo"
                    type="button"
                    title="Thông báo"
                  >
                    <div className="relative">
                      <Bell size={18} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center min-w-[16px] border border-white dark:border-gray-800">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                  {showDropdown && (
                    <div 
                      onMouseEnter={handleDropdownEnter} 
                      onMouseLeave={handleDropdownLeave}
                      className="fixed top-16 right-2 z-60 transform transition-all duration-200 ease-out opacity-100 scale-100"
                      style={{
                        animation: showDropdown ? 'fadeInDown 0.2s ease-out' : 'fadeOutUp 0.2s ease-in'
                      }}
                    >
                      <NotificationDropdownContent onClose={() => setShowDropdown(false)} />
                    </div>
                  )}
                </div>
              )}

              {/* Cart Button */}
              <CartIconWrapper>
                <button
                  onClick={() => navigate('/mycart')}
                  className="p-2 text-app-secondary hover:text-app-primary hover:bg-app-secondary dark:hover:text-green-400 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  title="Giỏ hàng"
                >
                  <div className="relative">
                    <ShoppingCart size={18} />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center shadow-lg border border-white dark:border-gray-800 font-bold min-w-[16px]">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </div>
                </button>
              </CartIconWrapper>

              {/* User Button */}
              {user ? (
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg shadow-md transition-colors duration-200"
                  title={user.name}
                >
                  <User size={18} />
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="p-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg shadow-md transition-colors duration-200"
                  title="Đăng nhập"
                >
                  <User size={18} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobile && showMobileMenu && (
          <div className="border-t border-app-border bg-app-header">
            {/* Mobile Search */}
            <div className="p-4">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-app-muted" />
                  </div>
                  <input
                    className="w-full pl-10 pr-12 py-2.5 bg-app-input border border-app-border rounded-xl text-app-primary placeholder-app-muted focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 transform -translate-y-1/2 bg-green-500 hover:bg-green-600 text-white p-1.5 rounded-lg focus:outline-none transition-colors duration-200"
                  >
                    <Search size={14} />
                  </button>
                </div>
              </form>
            </div>

            {/* Mobile Categories */}
            <div className="px-4 pb-2 border-b border-app-border">
              <button
                onClick={() => setShowMobileCategoryMenu(!showMobileCategoryMenu)}
                className="w-full flex items-center justify-between p-3 text-app-secondary hover:bg-app-secondary hover:text-app-primary rounded-lg transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <Menu size={18} />
                  <span className="font-medium">Danh mục sản phẩm</span>
                </div>
                <ChevronDown 
                  size={16} 
                  className={`transition-transform duration-200 ${showMobileCategoryMenu ? 'rotate-180' : ''}`}
                />
              </button>

              {showMobileCategoryMenu && (
                <div className="mt-2 space-y-1 max-h-64 overflow-y-auto">
                  {categories.map((category) => (
                    <div key={category._id} className="space-y-1">
                      <button
                        onClick={() => {
                          navigate(`/productlist?category=${category._id}`);
                          setShowMobileMenu(false);
                          setShowMobileCategoryMenu(false);
                        }}
                        className="w-full text-left p-2.5 text-sm text-app-secondary hover:bg-app-hover hover:text-app-primary rounded-md transition-colors duration-200 font-medium"
                      >
                        {category.name}
                      </button>
                      
                      {/* Subcategories */}
                      {category.subs && category.subs.length > 0 && (
                        <div className="ml-4 space-y-1">
                          {category.subs.map((subcategory, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                navigate(`/category/${encodeURIComponent(subcategory)}`);
                                setShowMobileMenu(false);
                                setShowMobileCategoryMenu(false);
                              }}
                              className="w-full text-left p-2 text-xs text-app-muted hover:bg-app-hover hover:text-app-secondary rounded-md transition-colors duration-200"
                            >
                              • {subcategory}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Navigation */}
            <div className="px-4 pb-4 space-y-2">
              {/* Theme Toggle for mobile - moved to top */}
              <div className="flex items-center justify-between p-3 bg-app-secondary rounded-lg">
                <span className="font-medium text-app-primary">Chế độ giao diện</span>
                <ThemeToggle size="sm" />
              </div>

              <button
                onClick={() => {
                  navigate('/home');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 p-3 text-app-secondary hover:bg-app-secondary hover:text-app-primary rounded-lg transition-colors duration-200"
              >
                <Home size={18} />
                <span className="font-medium">Trang chủ</span>
              </button>

              <button
                onClick={() => {
                  navigate('/wishlist');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center justify-between p-3 text-app-secondary hover:bg-app-secondary hover:text-app-primary rounded-lg transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <Heart size={18} />
                  <span className="font-medium">Yêu thích</span>
                </div>
                {user && wishlistCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px]">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  if (user) {
                    setShowLuckyWheel(true);
                    setShowMobileMenu(false);
                  } else {
                    // If user is not logged in, redirect to login
                    navigate('/login');
                    setShowMobileMenu(false);
                  }
                }}
                className="w-full flex items-center gap-3 p-3 text-app-secondary hover:bg-app-secondary hover:text-app-primary rounded-lg transition-colors duration-200"
              >
                <Zap size={18} />
                <span className="font-medium">Vòng xoay may mắn</span>
                {!user && <span className="text-xs text-app-muted">(Cần đăng nhập)</span>}
              </button>

              {user && (
                <>
                  <button
                    onClick={() => {
                      navigate('/accountdetail');
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 text-app-secondary hover:bg-app-secondary hover:text-app-primary rounded-lg transition-colors duration-200"
                  >
                    <User size={18} />
                    <span className="font-medium">Tài khoản</span>
                  </button>

                  <button
                    onClick={() => {
                      navigate('/myvoucher');
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 text-app-secondary hover:bg-app-secondary hover:text-app-primary rounded-lg transition-colors duration-200"
                  >
                    <Gift size={18} />
                    <span className="font-medium">Voucher</span>
                  </button>

                  <button
                    onClick={() => {
                      navigate('/myaddress');
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 text-app-secondary hover:bg-app-secondary hover:text-app-primary rounded-lg transition-colors duration-200"
                  >
                    <MapPin size={18} />
                    <span className="font-medium">Địa chỉ</span>
                  </button>

                  <button
                    onClick={() => {
                      navigate('/notification-settings');
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 text-app-secondary hover:bg-app-secondary hover:text-app-primary rounded-lg transition-colors duration-200"
                  >
                    <Settings size={18} />
                    <span className="font-medium">Cài đặt</span>
                  </button>

                  <button
                    onClick={() => {
                      navigate('/myorder');
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 text-app-secondary hover:bg-app-secondary hover:text-app-primary rounded-lg transition-colors duration-200"
                  >
                    <ShoppingCart size={18} />
                    <span className="font-medium">Đơn hàng</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                  >
                    <LogOut size={18} />
                    <span className="font-medium">Đăng xuất</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* CategoryBar: Only show on desktop when toggled and not on order success pages */}
        {!isMobile && showCategoryBar && !shouldHideCategoryBar && <CategoryBar />}
        
        {/* Lucky Wheel Modal */}
        <LuckyWheel
          userId={user?.id || ''}
          isOpen={showLuckyWheel}
          onClose={() => setShowLuckyWheel(false)}
        />
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;