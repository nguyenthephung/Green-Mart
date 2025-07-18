import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { slides, products, testimonials } from '../../data/Guest/Home';
import CategorySection from '../../components/Guest/home/CategorySection';
import type { Product } from '../../components/Guest/home/ProductCard';
import { useCart } from '../../reduxSlice/CartContext';
import ProductCard from '../../components/Guest/home/ProductCard';
import { usePageLoading } from '../../components/Guest/cart/MarketInfo';
import { SparklesIcon, FireIcon,  StarIcon } from '@heroicons/react/24/solid';
import meatHero from '../../assets/category-hero/meat.jpg';
import vegetablesHero from '../../assets/category-hero/vegetables.jpg';
import fruitsHero from '../../assets/category-hero/fruits.jpg';
import dryfoodHero from '../../assets/category-hero/dryfood.jpg';
import spicesHero from '../../assets/category-hero/spices.jpg';
import drinkHero from '../../assets/category-hero/drink.jpg';
import snackHero from '../../assets/category-hero/snack.jpg';
import milkHero from '../../assets/category-hero/milk.jpg';

const Home: React.FC = () => {
  const loading = usePageLoading();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { addToCart } = useCart();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getProductsByCategory = (category: string) =>
    products.filter((p) => p.category === category).slice(0, 8);

  // Enhanced handleAddToCart with flying animation
  const handleAddToCart = (product: Product, event?: React.MouseEvent) => {
    // Add to cart
    addToCart({
      id: Number(product.id),
      name: product.name,
      price: product.price,
      image: product.image
    });

    // Flying animation effect
    if (event) {
      createFlyingEffect(event, product);
    }

    // Cart icon bounce effect
    triggerCartBounce();
  };

  const createFlyingEffect = (event: React.MouseEvent, product: Product) => {
    const clickedElement = event.currentTarget as HTMLElement;
    const rect = clickedElement.getBoundingClientRect();
    const cartIcon = document.getElementById('cart-fly-icon');
    
    if (!cartIcon) return;

    const cartRect = cartIcon.getBoundingClientRect();
    
    // Create flying element
    const flyingEl = document.createElement('div');
    flyingEl.className = 'flying-item';
    flyingEl.innerHTML = `
      <div class="bg-white rounded-lg shadow-lg p-2 border-2 border-green-500">
        <img src="${product.image}" alt="${product.name}" class="w-12 h-12 object-cover rounded" />
      </div>
    `;
    
    // Set initial position
    flyingEl.style.left = `${rect.left + rect.width / 2}px`;
    flyingEl.style.top = `${rect.top + rect.height / 2}px`;
    flyingEl.style.transform = 'translate(-50%, -50%)';
    
    document.body.appendChild(flyingEl);
    
    // Animate to cart
    setTimeout(() => {
      flyingEl.style.left = `${cartRect.left + cartRect.width / 2}px`;
      flyingEl.style.top = `${cartRect.top + cartRect.height / 2}px`;
      flyingEl.style.transform = 'translate(-50%, -50%) scale(0.2)';
      flyingEl.style.opacity = '0';
    }, 100);
    
    // Remove element after animation
    setTimeout(() => {
      if (flyingEl.parentNode) {
        flyingEl.parentNode.removeChild(flyingEl);
      }
    }, 1000);
  };

  const triggerCartBounce = () => {
    const cartIcon = document.getElementById('cart-fly-icon');
    if (cartIcon) {
      cartIcon.classList.add('animate-cartBounce');
      setTimeout(() => {
        cartIcon.classList.remove('animate-cartBounce');
      }, 600);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80">
        <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-0 md:p-6">
      {/* Hero Section */}
      <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-3xl shadow-2xl mb-10">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute w-full h-full transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            style={{ backgroundImage: `url(${slide.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-green-900/40 flex items-center justify-center text-white text-center p-6">
              <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-extrabold drop-shadow-lg flex items-center justify-center gap-2">
                  <SparklesIcon className="w-10 h-10 text-yellow-300 animate-bounce" />
                  {slide.title}
                </h1>
                <p className="text-xl md:text-2xl mt-3 drop-shadow-md font-medium">{slide.subtitle}</p>
                <Link
                  to="/category"
                  className="mt-8 inline-block bg-gradient-to-r from-green-500 to-green-700 text-white px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-lg font-bold tracking-wide"
                >
                  Mua Sắm Ngay
                </Link>
              </div>
            </div>
          </div>
        ))}
        {/* Slide indicator + arrows */}
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/70 hover:bg-white text-green-700 rounded-full p-2 shadow-lg transition-all"
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          aria-label="Slide trước"
        >
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/70 hover:bg-white text-green-700 rounded-full p-2 shadow-lg transition-all"
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          aria-label="Slide sau"
        >
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              className={`w-3 h-3 rounded-full border border-green-700 ${idx === currentSlide ? 'bg-green-500' : 'bg-white/60'} transition-all`}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Chuyển đến slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Ưu đãi hôm nay */}
      {products.some(p => p.isSale) && (
        <>
          <h2 className="text-3xl font-extrabold text-red-600 mt-8 mb-6 text-center flex items-center justify-center gap-2">
            <FireIcon className="w-8 h-8 text-red-500 animate-pulse" /> Ưu Đãi Hôm Nay
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.filter((product) => product.isSale).map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} showSaleBadge />
            ))}
          </div>
        </>
      )}

      {/* Danh mục sản phẩm */}
      <h2 className="text-3xl font-extrabold text-green-800 mt-12 mb-6 text-center flex items-center justify-center gap-2">
        Danh Mục Sản Phẩm
      </h2>
      <div className="space-y-16">
        <CategorySection
          title="Thịt - Cá - Trứng - Sữa"
          category="meat"
          products={getProductsByCategory('meat')}
          onAddToCart={handleAddToCart}
          viewMoreLink="/category/meat"
          heroImage={meatHero}
          productCount={products.filter(p => p.category === 'meat').length}
          titleClass="text-left flex items-center gap-2"
        />
        <CategorySection
          title="Rau Củ Quả"
          category="vegetables"
          products={getProductsByCategory('vegetables')}
          onAddToCart={handleAddToCart}
          viewMoreLink="/category/vegetables"
          heroImage={vegetablesHero}
          productCount={products.filter(p => p.category === 'vegetables').length}
          titleClass="text-left flex items-center gap-2"
        />
        <CategorySection
          title="Trái Cây"
          category="fruits"
          products={getProductsByCategory('fruits')}
          onAddToCart={handleAddToCart}
          viewMoreLink="/category/fruits"
          heroImage={fruitsHero}
          productCount={products.filter(p => p.category === 'fruits').length}
          titleClass="text-left flex items-center gap-2"
        />
        <CategorySection
          title="Thực Phẩm Khô"
          category="dryfood"
          products={getProductsByCategory('dryfood')}
          onAddToCart={handleAddToCart}
          viewMoreLink="/category/dryfood"
          heroImage={dryfoodHero}
          productCount={products.filter(p => p.category === 'dryfood').length}
          titleClass="text-left flex items-center gap-2"
        />
        <CategorySection
          title="Gia Vị"
          category="spices"
          products={getProductsByCategory('spices')}
          onAddToCart={handleAddToCart}
          viewMoreLink="/category/spices"
          heroImage={spicesHero}
          productCount={products.filter(p => p.category === 'spices').length}
          titleClass="text-left flex items-center gap-2"
        />
        <CategorySection
          title="Đồ Uống Các Loại"
          category="drink"
          products={getProductsByCategory('drink')}
          onAddToCart={handleAddToCart}
          viewMoreLink="/category/drink"
          heroImage={drinkHero}
          productCount={products.filter(p => p.category === 'drink').length}
          titleClass="text-left flex items-center gap-2"
        />
        <CategorySection
          title="Bánh Kẹo"
          category="snack"
          products={getProductsByCategory('snack')}
          onAddToCart={handleAddToCart}
          viewMoreLink="/category/snack"
          heroImage={snackHero}
          productCount={products.filter(p => p.category === 'snack').length}
          titleClass="text-left flex items-center gap-2"
        />
        <CategorySection
          title="Sữa Các Loại"
          category="milk"
          products={getProductsByCategory('milk')}
          onAddToCart={handleAddToCart}
          viewMoreLink="/category/milk"
          heroImage={milkHero}
          productCount={products.filter(p => p.category === 'milk').length}
          titleClass="text-left flex items-center gap-2"
        />
      </div>

      {/* Sản Phẩm Nổi Bật */}
      <h2 className="text-3xl font-extrabold text-yellow-600 mt-16 mb-6 text-center flex items-center justify-center gap-2">
        <StarIcon className="w-8 h-8 text-yellow-400" /> Sản Phẩm Nổi Bật
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.filter((product) => product.isFeatured).map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} showHotBadge />
        ))}
      </div>

      {/* Đánh giá khách hàng */}
      <h2 className="text-3xl font-extrabold text-green-700 mt-16 mb-6 text-center flex items-center justify-center gap-2">
        <SparklesIcon className="w-8 h-8 text-green-400" /> Khách Hàng Nói Gì?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {testimonials.map((t) => (
          <div key={t.id} className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4 border-l-8 border-green-500 relative">
            <div className="flex-shrink-0 relative">
              <img src={t.image} alt={t.name} className="w-16 h-16 rounded-full object-cover border-2 border-green-500" />
              <span className="absolute -top-2 -left-2 text-green-400">
                <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M7.17 6.17A7.001 7.001 0 0 0 2 13a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1c0-1.306-.835-2.417-2.03-2.83A5.001 5.001 0 0 1 7.17 6.17zm9.66 0A7.001 7.001 0 0 0 11.66 13a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1c0-1.306-.835-2.417-2.03-2.83A5.001 5.001 0 0 1 16.83 6.17z"/></svg>
              </span>
            </div>
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
