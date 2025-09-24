import { useLocation, useNavigate } from 'react-router-dom';
import { useCategoryStore } from '../../stores/useCategoryStore';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Menu, X, Tag } from 'lucide-react';
import { useResponsive } from '../../hooks/useResponsive';

const hiddenOnRoutes = [
  '/login',
  '/register',
  '/admin',
  '/checkout',
  '/category',
  '/accountdetail',
  '/myorder',
  '/myaddress',
  '/notification-settings',
  '/myvoucher',
  '/mycart',
  '/payment-result',
  '/guest-checkout',
];

const CategoryBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const categories = useCategoryStore(state => state.categories);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeParent, setActiveParent] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Responsive hook
  const { isMobile } = useResponsive();

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveParent(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Đóng mobile menu khi chuyển trang
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveParent(null);
  }, [location.pathname]);

  // Ẩn trên các trang đặc biệt (sau tất cả hook và effect)
  if (hiddenOnRoutes.some(route => location.pathname.startsWith(route))) return null;

  const handleParentClick = (categoryId: string, categoryName: string) => {
    const category = categories.find(cat => cat.id === categoryId);

    // Nếu có danh mục con, toggle dropdown
    if (category?.subs && category.subs.length > 0) {
      setActiveParent(activeParent === categoryId ? null : categoryId);
    } else {
      // Nếu không có danh mục con, chuyển đến trang danh mục
      navigate(`/category/${categoryName}`);
      setActiveParent(null);
    }
  };

  const handleSubClick = (subName: string) => {
    navigate(`/category/${subName}`);
    setActiveParent(null);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="relative">
      {/* Category Bar */}
      <div className="z-30 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg border-b border-gray-200 dark:border-gray-700 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Menu Button */}
          <div
            className={`${isMobile ? 'flex' : 'lg:hidden flex'} items-center justify-between py-3`}
          >
            <div className="flex items-center gap-2">
              <Tag className="text-emerald-600" size={isMobile ? 18 : 20} />
              <span
                className={`font-semibold text-gray-800 dark:text-gray-200 ${isMobile ? 'text-sm' : ''}`}
              >
                Danh mục sản phẩm
              </span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`${isMobile ? 'p-1.5' : 'p-2'} rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
              aria-label={isMobileMenuOpen ? 'Đóng menu danh mục' : 'Mở menu danh mục'}
            >
              {isMobileMenuOpen ? (
                <X className="text-gray-600 dark:text-gray-400" size={isMobile ? 18 : 20} />
              ) : (
                <Menu className="text-gray-600 dark:text-gray-400" size={isMobile ? 18 : 20} />
              )}
            </button>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden lg:block py-4" ref={dropdownRef}>
            <div className="flex items-center gap-1">
              {categories.map(category => (
                <div key={category.id} className="relative">
                  <button
                    onClick={() => handleParentClick(category.id, category.name)}
                    className={`group inline-flex items-center gap-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                      activeParent === category.id
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-app-secondary dark:hover:bg-app-secondary hover:text-emerald-600 dark:hover:text-emerald-300'
                    }`}
                  >
                    <span>{category.name}</span>
                    {category.subs && category.subs.length > 0 && (
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${
                          activeParent === category.id ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>

                  {/* Desktop Dropdown */}
                  {activeParent === category.id && category.subs && category.subs.length > 0 && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-600 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-200 dark:border-gray-600">
                        {category.name}
                      </div>
                      {category.subs.map((sub, subIndex) => (
                        <button
                          key={subIndex}
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSubClick(sub);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-emerald-600 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg"
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* Mobile Menu */}
          <div
            className={`${isMobile ? 'block' : 'lg:hidden'} overflow-hidden transition-all duration-300 ${
              isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className={`${isMobile ? 'py-3 space-y-1' : 'py-4 space-y-2'}`}>
              {categories.map(category => (
                <div key={category.id} className="space-y-1">
                  <button
                    onClick={() => handleParentClick(category.id, category.name)}
                    className={`w-full flex items-center justify-between ${isMobile ? 'px-3 py-2.5' : 'px-4 py-3'} rounded-lg text-left font-medium transition-all duration-200 ${
                      activeParent === category.id
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className={isMobile ? 'text-sm' : ''}>{category.name}</span>
                    {category.subs && category.subs.length > 0 && (
                      <ChevronDown
                        size={isMobile ? 14 : 16}
                        className={`transition-transform duration-200 ${
                          activeParent === category.id ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>

                  {/* Mobile Submenu */}
                  {activeParent === category.id && category.subs && category.subs.length > 0 && (
                    <div
                      className={`${isMobile ? 'ml-3 space-y-0.5' : 'ml-4 space-y-1'} animate-in slide-in-from-top-2 duration-200`}
                    >
                      {category.subs.map((sub, subIndex) => (
                        <button
                          key={subIndex}
                          onClick={() => handleSubClick(sub)}
                          className={`w-full text-left ${isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm'} text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-300 rounded-lg transition-colors duration-150`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;
