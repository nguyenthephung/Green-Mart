import { ShoppingCart, Search, User, MapPin } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useState } from "react";
export default function Header() {
     const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/?search=${encodeURIComponent(searchTerm)}`);
  };
  return (
    <header className="flex justify-between items-center p-4 shadow-md">
      <div className="flex items-center gap-2">
        <img src="/logo.svg" alt="Logo" className="h-8" />
        <span className="text-sm text-gray-500"><MapPin size={16} /> 1011S New York</span>
      </div>
     <form onSubmit={handleSearch} className="flex bg-white rounded-md overflow-hidden">
        <input
          className="px-3 py-1 text-black outline-none"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="px-3 bg-green-500 text-white" type="submit">
          <Search size={18} />
        </button>
      </form>
      <div className="flex items-center gap-4">
        <ShoppingCart size={20} />
        <button className="bg-green-500 text-white px-3 py-1 rounded-md flex items-center gap-1"><User size={16}/> Login</button>
      </div>
    </header>
  );
}