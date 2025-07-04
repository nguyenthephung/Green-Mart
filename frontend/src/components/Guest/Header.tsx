import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, User, MapPin, Home } from 'lucide-react';
import { useCart } from '../../reduxSlice/CartContext';
import { useCurrentLocation } from './cart/MarketInfo';

const Header: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const location = useCurrentLocation();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim() !== '') {
      navigate(`/search?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center p-4 bg-gradient-to-r from-green-600 to-green-400 text-white shadow-lg transition-all duration-300 backdrop-blur-md bg-opacity-90">
      <div className="flex items-center gap-3">
        <img
          src="/logo.jpg"
          alt="Logo"
          className="h-10 rounded-md shadow-md hover:scale-105 transition-transform"
        />
        <span className="text-sm flex items-center gap-1 bg-green-700 bg-opacity-50 px-2 py-1 rounded-md">
          <MapPin size={16} />
          {location.location}
        </span>
      </div>

      <form
        onSubmit={handleSearch}
        className="flex bg-white bg-opacity-20 rounded-lg overflow-hidden"
      >
        <input
          className="px-4 py-2 text-black placeholder-gray-200 bg-transparent outline-none"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 bg-green-500 text-white hover:bg-green-600 cursor-pointer"
        >
          <Search size={18} />
        </button>
      </form>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/home')}
          className="hover:text-gray-200 hover:scale-110 transition cursor-pointer"
        >
          <Home size={20} />
        </button>
        <button
          onClick={() => navigate('/mycart')}
          className="relative hover:text-gray-200 hover:scale-110 transition cursor-pointer"
        >
          <span id="cart-fly-icon" className="inline-block relative">
            <ShoppingCart size={20} />
            {getCartCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                {getCartCount()}
              </span>
            )}
          </span>
        </button>
        <button
          onClick={() => navigate('/accountdetail')}
          className="bg-white text-green-600 px-4 py-2 rounded-lg flex items-center gap-2 shadow-md hover:shadow-xl hover:-translate-y-1 transition cursor-pointer"
        >
          <User size={16} />
          Tài Khoản
        </button>
      </div>
    </header>
  );
};

export default Header;
