import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, User, MapPin, Home } from 'lucide-react';

const Header: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate(`/?search=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <header className="flex justify-between items-center p-4 bg-gradient-to-r from-green-600 to-green-400 text-white shadow-lg transform transition-all duration-300">
      <div className="flex items-center gap-3">
        <img
          src="https://via.placeholder.com/80x40?text=Logo"
          alt="Logo"
          className="h-10 rounded-md shadow-md transform hover:scale-105 transition-transform duration-200"
        />
        <span className="text-sm flex items-center gap-1 bg-green-700 bg-opacity-50 px-2 py-1 rounded-md">
          <MapPin size={16} />
          1011S New York
        </span>
      </div>
      <form
        onSubmit={handleSearch}
        className="flex bg-white bg-opacity-20 rounded-lg overflow-hidden shadow-inner transform hover:scale-105 transition-transform duration-200"
      >
        <input
          className="px-4 py-2 text-black placeholder-gray-200 bg-transparent outline-none focus:ring-2 focus:ring-white"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="px-4 bg-green-500 text-white hover:bg-green-600 transition-colors duration-200" type="submit">
          <Search size={18} />
        </button>
      </form>
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/home')}
          className="text-white hover:text-gray-200 transform hover:scale-110 transition-all duration-200"
          type="button"
        >
          <Home size={20} />
        </button>
        <button
          onClick={() => navigate('/mycart')}
          className="text-white hover:text-gray-200 transform hover:scale-110 transition-all duration-200"
          type="button"
        >
          <ShoppingCart size={20} />
        </button>
        <button
          onClick={() => navigate('/accountdetail')}
          className="bg-white text-green-600 px-4 py-2 rounded-lg flex items-center gap-2 shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
          type="button"
        >
          <User size={16} />
          Tài Khoản
        </button>
      </div>
    </header>
  );
};

export default Header;