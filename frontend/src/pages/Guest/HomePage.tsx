import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { slides, products,  testimonials } from '../../data/Guest/Home';
import CategorySection from '../../components/Guest/home/CategorySection';
import type { Product } from '../../components/Guest/home/ProductCard';
import { useCart } from '../../reduxSlice/CartContext';
import ProductCard from '../../components/Guest/home/ProductCard';
import { usePageLoading } from '../../components/Guest/cart/MarketInfo';

const Home: React.FC = () => {
  const loading = usePageLoading();
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

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80">
        <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
          title="Thịt - Cá - Trứng - Sữa"
          category="meat"
          products={getProductsByCategory('meat')}
          onAddToCart={handleAddToCart}
          viewMoreLink="/category/meat"
          colorClass="bg-red-600"
        />
        <CategorySection
          title="Rau Củ Quả"
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
        <CategorySection
          title="Thực Phẩm Khô"
          category="dryfood"
          products={getProductsByCategory('dryfood')}
          onAddToCart={handleAddToCart}
          viewMoreLink="/category/dryfood"
          colorClass="bg-orange-600"
        />
        <CategorySection
          title="Gia Vị"
          category="spices"
          products={getProductsByCategory('spices')}
          onAddToCart={handleAddToCart}
          viewMoreLink="/category/spices"
          colorClass="bg-pink-600"
        />
        <CategorySection
          title="Đồ Uống Các Loại"
          category="drink"
          products={getProductsByCategory('drink')}
          onAddToCart={handleAddToCart}
          viewMoreLink="/category/drink"
          colorClass="bg-blue-600"
        />
        <CategorySection
          title="Bánh Kẹo"
          category="snack"
          products={getProductsByCategory('snack')}
          onAddToCart={handleAddToCart}
          viewMoreLink="/category/snack"
          colorClass="bg-purple-600"
        />
        <CategorySection
          title="Sữa Các Loại"
          category="milk"
          products={getProductsByCategory('milk')}
          onAddToCart={handleAddToCart}
          viewMoreLink="/category/milk"
          colorClass="bg-indigo-600"
        />
      </div>
      {/* Sản Phẩm Nổi Bật */}
      <h2 className="text-3xl font-bold text-gray-800 mt-16 mb-6 text-center">Sản Phẩm Nổi Bật</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.filter((product) => product.isFeatured).map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
        ))}
      </div>
      {/* Sản Phẩm Đang Sale */}
      <h2 className="text-3xl font-bold text-red-600 mt-16 mb-6 text-center">Sản Phẩm Đang Sale</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.filter((product) => product.isSale).map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
        ))}
      </div>
      {/* Đánh giá khách hàng */}
      <h2 className="text-3xl font-bold text-gray-800 mt-16 mb-6 text-center">Khách Hàng Nói Gì?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {testimonials.map((t) => (
          <div key={t.id} className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-4">
            <img src={t.image} alt={t.name} className="w-16 h-16 rounded-full object-cover border-2 border-green-500" />
            <div>
              <p className="text-gray-700 italic mb-2">"{t.text}"</p>
              <p className="font-semibold text-green-700">- {t.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
