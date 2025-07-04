import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { slides, products, topDeals} from '../../data/Guest/Home';
import CategorySection from '../../components/Guest/home/CategorySection';
import type { Product } from '../../components/Guest/home/ProductCard';
import { FaShoppingCart  } from 'react-icons/fa';
import { useCart } from '../../reduxSlice/CartContext';

const Home: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getProductsByCategory = (category: string) =>
    products.filter((p) => p.category === category).slice(0, 8);

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: Number(product.id),
      name: product.name,
      price: product.price,
      image: product.image
    });
    // TODO: Hiệu ứng bay vào giỏ hàng nếu muốn
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 p-6">
      {/* Hero Section */}
      <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-xl shadow-2xl">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute w-full h-full transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${slide.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white text-center p-6">
              <div>
                <h1 className="text-4xl md:text-6xl font-bold drop-shadow-md">{slide.title}</h1>
                <p className="text-xl md:text-2xl mt-3 drop-shadow-md">{slide.subtitle}</p>
                <Link
                  to="/category"
                  className="mt-6 inline-block bg-green-600 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                >
                  Mua Sắm Ngay
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Danh mục sản phẩm */}
      <h2 className="text-3xl font-bold text-gray-800 mt-12 mb-6 text-center">Danh Mục Sản Phẩm</h2>

      <div className="space-y-16">
        <CategorySection
          title="Thịt Cá Trứng Sữa"
          category="meat"
          products={getProductsByCategory('meat')}
          onAddToCart={handleAddToCart}
          viewMoreLink="/category/meat"
          colorClass="bg-red-600"
        />

        <CategorySection
          title="Rau"
          category="vegetables"
          products={getProductsByCategory('vegetables')}
          onAddToCart={handleAddToCart}
          viewMoreLink="/category/vegetables"
          colorClass="bg-green-600"
        />

        <CategorySection
          title="Trái Cây"
          category="fruits"
          products={getProductsByCategory('fruits')}
          onAddToCart={handleAddToCart}
          viewMoreLink="/category/fruits"
          colorClass="bg-yellow-600"
        />
      </div>
 {/* Featured Products Section */}
      <h2 className="text-3xl font-bold text-gray-800 mt-16 mb-6 text-center">Sản Phẩm Nổi Bật</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
  <div
    key={product.id}
    className="bg-white p-5 rounded-xl shadow-xl transform transition-all duration-400 hover:shadow-2xl hover:-translate-y-3 hover:rotate-2 perspective-1000"
  >
    <Link to={`/productdetail/${product.id}`}>
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-56 object-cover rounded-lg transform transition-transform duration-300 hover:scale-110"
      />
      <h3 className="text-xl font-semibold mt-4 text-gray-900">{product.name}</h3>
    </Link>
    <p className="text-lg text-green-600 mt-2 font-medium">{product.price}</p>
    <button
      onClick={() => handleAddToCart(product)}
      className="mt-4 w-full bg-green-600 text-white px-5 py-3 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
    >
      <FaShoppingCart className="mr-2" /> Thêm Vào Giỏ Hàng
    </button>
  </div>
))}
      </div>
    {/* Ưu Đãi Nổi Bật */}
<h2 className="text-3xl font-bold text-gray-800 mt-16 mb-6 text-center">Ưu Đãi Nổi Bật</h2>
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
  {topDeals.map((deal) => (
    <div
      key={deal.id}
      className="bg-yellow-100 p-6 rounded-xl shadow-xl transform transition-all duration-400 hover:shadow-2xl hover:-translate-y-3 hover:rotate-1 perspective-1000"
    >
      <img
        src={deal.image}
        alt={deal.name}
        className="w-full h-48 object-cover rounded-lg transform transition-transform duration-300 hover:scale-105"
      />
      <h3 className="text-xl font-semibold mt-4 text-yellow-800">{deal.name}</h3>
      <p className="text-lg text-red-600 mt-2 font-bold">{deal.discount}</p>
      <Link
        to={`/category/${deal.category}`}
        className="mt-4 inline-block bg-yellow-600 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
      >
        Xem Ngay
      </Link>
    </div>
  ))}
</div>

    </div>
  );
};

export default Home;
