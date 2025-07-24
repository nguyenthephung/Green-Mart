import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { products, testimonials } from '../../data/Guest/Home';
import CategorySection from '../../components/Guest/home/CategorySection';
import type { Product } from '../../components/Guest/home/ProductCard';
import { useCartStore } from '../../stores/useCartStore';
import ProductCard from '../../components/Guest/home/ProductCard';
import { usePageLoading } from '../../components/Guest/cart/MarketInfo';
import { SparklesIcon, FireIcon,  StarIcon } from '@heroicons/react/24/solid';
import '../../styles/performance.css';
import meatHero from '../../assets/category-hero/meat.jpg';
import vegetablesHero from '../../assets/category-hero/vegetables.jpg';
import fruitsHero from '../../assets/category-hero/fruits.jpg';
import dryfoodHero from '../../assets/category-hero/dryfood.jpg';
import spicesHero from '../../assets/category-hero/spices.jpg';
import drinkHero from '../../assets/category-hero/drink.jpg';
import snackHero from '../../assets/category-hero/snack.jpg';
import milkHero from '../../assets/category-hero/milk.jpg';

// Real slides data using actual images and online banners
const realSlides = [
  {
    id: 1,
    title: "Thịt Tươi Ngon",
    subtitle: "Thịt heo, thịt bò tươi ngon từ trang trại uy tín",
    image: meatHero,
    category: "Thịt"
  },
  {
    id: 2,
    title: "Rau Củ Sạch",
    subtitle: "Rau củ quả tươi ngon, an toàn từ vườn nhà",
    image: vegetablesHero,
    category: "Rau củ"
  },
  {
    id: 3,
    title: "Trái Cây Tươi",
    subtitle: "Trái cây tươi ngon, vitamin thiên nhiên mỗi ngày",
    image: fruitsHero,
    category: "Trái cây"
  },
  {
    id: 4,
    title: "Thực Phẩm Khô",
    subtitle: "Gạo, đậu, ngũ cốc chất lượng cao",
    image: dryfoodHero,
    category: "Thực phẩm khô"
  },
  {
    id: 5,
    title: "Gia Vị Đậm Đà",
    subtitle: "Gia vị thơm ngon, tạo hương vị đặc biệt",
    image: spicesHero,
    category: "Gia vị"
  },
  {
    id: 6,
    title: "Đồ Uống Tươi Mát",
    subtitle: "Nước trái cây, đồ uống tươi mát mỗi ngày",
    image: drinkHero,
    category: "Đồ uống"
  }
];

const Home: React.FC = () => {
  const loading = usePageLoading();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const addToCart = useCartStore(state => state.addToCart);

  // Force body background for dark mode
  useEffect(() => {
    const updateBodyStyle = () => {
      const isDark = document.documentElement.classList.contains('dark');
      if (isDark) {
        document.body.style.backgroundColor = '#111827';
        document.body.style.color = '#f9fafb';
        
        // Force category headers background
        const categoryHeaders = document.querySelectorAll('div[class*="bg-white/90"]');
        categoryHeaders.forEach(header => {
          (header as HTMLElement).style.backgroundColor = 'rgba(31, 41, 55, 0.9)';
        });
        
        // Force testimonials section background
        const testimonialsSection = document.querySelector('.bg-gradient-to-br.from-emerald-50.to-green-100');
        if (testimonialsSection) {
          (testimonialsSection as HTMLElement).style.background = 'linear-gradient(to bottom right, #111827, #1f2937)';
        }
        
        // Fix gradient text elements for better visibility
        const gradientTexts = document.querySelectorAll('.bg-clip-text.text-transparent');
        gradientTexts.forEach(element => {
          const el = element as HTMLElement;
          const classes = el.className;
          
          // Apply specific gradient fixes based on color scheme
          if (classes.includes('from-emerald-600') && classes.includes('to-green-600')) {
            el.style.background = 'linear-gradient(to right, #10b981, #22c55e)';
            el.style.backgroundClip = 'text';
            el.style.webkitBackgroundClip = 'text';
          } else if (classes.includes('from-yellow-500') && classes.includes('to-orange-600')) {
            el.style.background = 'linear-gradient(to right, #eab308, #ea580c)';
            el.style.backgroundClip = 'text';
            el.style.webkitBackgroundClip = 'text';
          } else if (classes.includes('from-red-600') && classes.includes('to-pink-600')) {
            el.style.background = 'linear-gradient(to right, #dc2626, #db2777)';
            el.style.backgroundClip = 'text';
            el.style.webkitBackgroundClip = 'text';
          } else if (classes.includes('from-emerald-300') && classes.includes('to-green-200')) {
            el.style.background = 'linear-gradient(to right, #a7f3d0, #bbf7d0)';
            el.style.backgroundClip = 'text';
            el.style.webkitBackgroundClip = 'text';
          }
        });
        
        // Fix header logo text specifically
        const headerTexts = document.querySelectorAll('header .text-gray-800');
        headerTexts.forEach(text => {
          (text as HTMLElement).style.color = '#f9fafb';
        });
        
      } else {
        document.body.style.backgroundColor = '';
        document.body.style.color = '';
        
        // Force reset category headers background to original light colors
        const categoryHeaders = document.querySelectorAll('div[class*="bg-white/90"]');
        categoryHeaders.forEach(header => {
          const el = header as HTMLElement;
          el.style.backgroundColor = '';
          el.style.removeProperty('background-color');
          // Force light mode background
          el.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
          setTimeout(() => {
            el.style.backgroundColor = '';
          }, 100);
        });
        
        // Force reset testimonials section background to original light gradient
        const testimonialsSection = document.querySelector('.bg-gradient-to-br.from-emerald-50.to-green-100');
        if (testimonialsSection) {
          const el = testimonialsSection as HTMLElement;
          el.style.background = '';
          el.style.removeProperty('background');
          // Force light mode gradient
          el.style.background = 'linear-gradient(to bottom right, #ecfdf5, #dcfce7)';
          setTimeout(() => {
            el.style.background = '';
          }, 100);
        }
        
        // Reset gradient text styles
        const gradientTexts = document.querySelectorAll('.bg-clip-text.text-transparent');
        gradientTexts.forEach(element => {
          const el = element as HTMLElement;
          el.style.background = '';
          el.style.backgroundClip = '';
          el.style.webkitBackgroundClip = '';
          el.style.removeProperty('background');
          el.style.removeProperty('background-clip');
          el.style.removeProperty('-webkit-background-clip');
        });
        
        // Reset header text styles
        const headerTexts = document.querySelectorAll('header .text-gray-800');
        headerTexts.forEach(text => {
          const el = text as HTMLElement;
          el.style.color = '';
          el.style.removeProperty('color');
        });
      }
    };
    
    updateBodyStyle();
    
    const observer = new MutationObserver(updateBodyStyle);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    // Also run after DOM updates
    const interval = setInterval(updateBodyStyle, 1000);
    
    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  // Detect scrolling để tạm dừng animations khi scroll - optimize performance
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolling(true);
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            setIsScrolling(false);
          }, 100); // Giảm từ 150ms xuống 100ms
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Memoize filtered products để tránh re-filter mỗi render
  const saleProducts = useMemo(() => 
    products.filter((product) => product.isSale), 
    []
  );
  
  const featuredProducts = useMemo(() => 
    products.filter((product) => product.isFeatured), 
    []
  );
  
  const hasSaleProducts = useMemo(() => 
    saleProducts.length > 0, 
    [saleProducts]
  );

  // Scroll to top when component mounts - tối ưu để tránh lag
  useEffect(() => {
    // Force scroll to top immediately without animation
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Ensure scroll position is maintained correctly
  useEffect(() => {
    // Prevent any unwanted scrolling during render
    const preventScroll = () => {
      if (window.scrollY > 100) {
        window.scrollTo(0, 0);
      }
    };

    // Check scroll position after component fully renders
    const timeoutId = setTimeout(preventScroll, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % realSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Memoize getProductsByCategory để tránh re-calculation
  const getProductsByCategory = useMemo(() => {
    const categorizedProducts = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {} as Record<string, typeof products>);

    return (category: string) => categorizedProducts[category]?.slice(0, 8) || [];
  }, []);

  // Enhanced handleAddToCart with optimized flying animation
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
      <div className="bg-white rounded-lg shadow-lg p-2 border-2 border-green-500">
        <img src="${product.image}" alt="${product.name}" className="w-12 h-12 object-cover rounded" />
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

  // Tạm thời vô hiệu hóa error handling trong quá trình phát triển
  /*
  // Show error component if there's an error
  if (error) {
    return ErrorComponent;
  }
  */

  if (loading) {  // Removed isDataLoading check
    console.log('HomePage is loading...'); // Debug log
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 dark:bg-gray-900/80">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 dark:border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Đang tải trang chủ...</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Debug: HomePage loading</p>
        </div>
      </div>
    );
  }

  console.log('HomePage loaded, rendering content'); // Debug log

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 scroll-optimized">
      {/* Enhanced Hero Section */}
      <div className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden mb-16">
        {/* Background with parallax effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-green-900/30 z-10"></div>
        
        {realSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute w-full h-full transition-all duration-1000 hero-slide ${
              index === currentSlide ? 'opacity-100 scale-100 z-5' : 'opacity-0 scale-105 z-0'
            }`}
            style={{ 
              backgroundImage: `url(${slide.image})`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center',
              filter: 'brightness(0.9) contrast(1.1)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 z-10"></div>
          </div>
        ))}
        
        {/* Hero Content */}
        <div className="absolute inset-0 z-20 flex items-center justify-center text-white text-center p-6">
          <div className="max-w-4xl mx-auto optimize-scroll">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-emerald-500/90 backdrop-blur-sm rounded-full text-sm font-semibold tracking-wide">
                🌱 Fresh & Organic
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black drop-shadow-2xl mb-6 leading-tight">
              <span className="bg-gradient-to-r from-emerald-300 to-green-200 bg-clip-text text-transparent">
                {realSlides[currentSlide]?.title}
              </span>
            </h1>
            <p className="text-xl md:text-3xl mb-8 drop-shadow-lg font-light text-green-100 max-w-2xl mx-auto">
              {realSlides[currentSlide]?.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/category"
                className="group bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-4 rounded-2xl shadow-2xl hover:shadow-emerald-500/25 hover:scale-105 transition-all duration-300 text-lg font-bold tracking-wide flex items-center gap-3"
              >
                <SparklesIcon className={`w-6 h-6 ${isScrolling ? '' : 'animate-pulse'}`} />
                Khám Phá Ngay
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation */}
        <button
          className="absolute left-6 top-1/2 -translate-y-1/2 z-30 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-full p-3 shadow-xl transition-all border border-white/20"
          onClick={() => setCurrentSlide((prev) => (prev - 1 + realSlides.length) % realSlides.length)}
          aria-label="Slide trước"
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          className="absolute right-6 top-1/2 -translate-y-1/2 z-30 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-full p-3 shadow-xl transition-all border border-white/20"
          onClick={() => setCurrentSlide((prev) => (prev + 1) % realSlides.length)}
          aria-label="Slide sau"
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        {/* Enhanced Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
          {realSlides.map((_, idx) => (
            <button
              key={idx}
              className={`transition-all duration-300 ${
                idx === currentSlide 
                  ? 'w-8 h-3 bg-emerald-400 rounded-full' 
                  : 'w-3 h-3 bg-white/50 rounded-full hover:bg-white/70'
              }`}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Chuyển đến slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Enhanced Sale Section */}
      {hasSaleProducts && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-white font-bold text-lg shadow-xl mb-4">
              <FireIcon className="w-7 h-7 animate-pulse" />
              <span>Ưu Đãi Hôm Nay</span>
              <div className="w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
            </div>
            <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Flash Sale
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
              Cơ hội vàng! Giảm giá sốc chỉ có hôm nay. Nhanh tay trước khi hết hàng!
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 optimized-grid">
            {saleProducts.map((product, index) => (
              <div 
                key={product.id} 
                className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl dark:shadow-gray-900/50 transition-all duration-300 overflow-hidden border border-red-100 dark:border-red-900/30"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Sale Badge - điều chỉnh vị trí để không che tên sản phẩm */}
                <div className="absolute top-1 left-1 z-20">
                  <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-1.5 py-0.5 rounded-md text-xs font-bold shadow-lg">
                    🔥 SALE
                  </span>
                </div>
                
                {/* Product Card Content */}
                <ProductCard 
                  product={product} 
                  onAddToCart={handleAddToCart} 
                  showSaleBadge={false}
                />
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <Link 
              to="/category?sale=true"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-transform duration-300 shadow-xl"
            >
              Xem Tất Cả Ưu Đãi
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* Enhanced Categories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-700 dark:text-emerald-300 font-semibold mb-4">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            Danh Mục Sản Phẩm
          </div>
          <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-6">
            Tươi Ngon Từ Thiên Nhiên
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto">
            Khám phá bộ sưu tập đa dạng các sản phẩm tươi ngon, chất lượng cao được tuyển chọn kỹ lưỡng
          </p>
        </div>

        {/* Categories Grid */}
        <div className="space-y-20 optimize-scroll">
          <CategorySection
            title="🥩 Thịt - Cá - Trứng - Sữa"
            category="meat"
            products={getProductsByCategory('meat')}
            onAddToCart={handleAddToCart}
            viewMoreLink="/category/meat"
            heroImage={meatHero}
            productCount={products.filter(p => p.category === 'meat').length}
            titleClass="text-left flex items-center gap-3 text-2xl font-bold text-red-700"
          />
          <CategorySection
            title="🥬 Rau Củ Quả Tươi"
            category="vegetables"
            products={getProductsByCategory('vegetables')}
            onAddToCart={handleAddToCart}
            viewMoreLink="/category/vegetables"
            heroImage={vegetablesHero}
            productCount={products.filter(p => p.category === 'vegetables').length}
            titleClass="text-left flex items-center gap-3 text-2xl font-bold text-green-700"
          />
          <CategorySection
            title="🍎 Trái Cây Ngọt Lành"
            category="fruits"
            products={getProductsByCategory('fruits')}
            onAddToCart={handleAddToCart}
            viewMoreLink="/category/fruits"
            heroImage={fruitsHero}
            productCount={products.filter(p => p.category === 'fruits').length}
            titleClass="text-left flex items-center gap-3 text-2xl font-bold text-orange-600"
          />
          <CategorySection
            title="🌾 Thực Phẩm Khô"
            category="dryfood"
            products={getProductsByCategory('dryfood')}
            onAddToCart={handleAddToCart}
            viewMoreLink="/category/dryfood"
            heroImage={dryfoodHero}
            productCount={products.filter(p => p.category === 'dryfood').length}
            titleClass="text-left flex items-center gap-3 text-2xl font-bold text-amber-700"
          />
          <CategorySection
            title="🌶️ Gia Vị Đặc Biệt"
            category="spices"
            products={getProductsByCategory('spices')}
            onAddToCart={handleAddToCart}
            viewMoreLink="/category/spices"
            heroImage={spicesHero}
            productCount={products.filter(p => p.category === 'spices').length}
            titleClass="text-left flex items-center gap-3 text-2xl font-bold text-red-600"
          />
          <CategorySection
            title="🥤 Đồ Uống Giải Khát"
            category="drink"
            products={getProductsByCategory('drink')}
            onAddToCart={handleAddToCart}
            viewMoreLink="/category/drink"
            heroImage={drinkHero}
            productCount={products.filter(p => p.category === 'drink').length}
            titleClass="text-left flex items-center gap-3 text-2xl font-bold text-blue-600"
          />
          <CategorySection
            title="🍪 Bánh Kẹo Ngọt Ngào"
            category="snack"
            products={getProductsByCategory('snack')}
            onAddToCart={handleAddToCart}
            viewMoreLink="/category/snack"
            heroImage={snackHero}
            productCount={products.filter(p => p.category === 'snack').length}
            titleClass="text-left flex items-center gap-3 text-2xl font-bold text-pink-600"
          />
          <CategorySection
            title="🥛 Sữa Dinh Dưỡng"
            category="milk"
            products={getProductsByCategory('milk')}
            onAddToCart={handleAddToCart}
            viewMoreLink="/category/milk"
            heroImage={milkHero}
            productCount={products.filter(p => p.category === 'milk').length}
            titleClass="text-left flex items-center gap-3 text-2xl font-bold text-blue-500"
          />
        </div>
      </div>

      {/* Enhanced Featured Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-white font-bold text-lg shadow-xl mb-4">
            <StarIcon className="w-7 h-7 animate-spin" />
            <span>Sản Phẩm Nổi Bật</span>
            <div className="w-2 h-2 bg-yellow-300 rounded-full animate-bounce"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text text-transparent mb-4">
            Được Yêu Thích Nhất
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Những sản phẩm được khách hàng đánh giá cao và mua nhiều nhất tại GreenMart
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 optimized-grid">
          {featuredProducts.map((product, index) => (
            <div 
              key={product.id} 
              className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl dark:shadow-gray-900/50 transition-all duration-300 overflow-hidden border border-yellow-100 dark:border-yellow-900/30 transform hover:-translate-y-2"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Hot Badge - điều chỉnh vị trí để không che tên sản phẩm */}
              <div className="absolute top-1 right-1 z-20">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-1.5 py-0.5 rounded-md text-xs font-bold shadow-lg flex items-center gap-1">
                  <StarIcon className="w-3 h-3" />
                  HOT
                </div>
              </div>
              
              {/* Product Card Content */}
              <ProductCard 
                product={product} 
                onAddToCart={handleAddToCart} 
                showHotBadge={false}
              />
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Link 
            to="/category?featured=true"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-transform duration-300 shadow-xl"
          >
            Xem Tất Cả Sản Phẩm Nổi Bật
            <StarIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Enhanced Testimonials */}
      <div className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-800 rounded-full shadow-lg mb-6">
              <SparklesIcon className="w-6 h-6 text-emerald-500" />
              <span className="font-bold text-gray-700 dark:text-gray-300">Khách Hàng Nói Gì?</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-6">
              Câu Chuyện Thành Công
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
              Hàng nghìn khách hàng đã tin tưởng và yêu thích GreenMart
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.id} 
                className="group bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl hover:shadow-2xl dark:shadow-gray-900/50 transition-all duration-300 border border-emerald-100 dark:border-gray-700 relative overflow-hidden"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-100 rounded-bl-full opacity-50"></div>
                
                {/* Quote icon */}
                <div className="absolute top-6 left-6 text-emerald-200">
                  <svg width="40" height="40" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.17 6.17A7.001 7.001 0 0 0 2 13a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1c0-1.306-.835-2.417-2.03-2.83A5.001 5.001 0 0 1 7.17 6.17zm9.66 0A7.001 7.001 0 0 0 11.66 13a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1c0-1.306-.835-2.417-2.03-2.83A5.001 5.001 0 0 1 16.83 6.17z"/>
                  </svg>
                </div>

                {/* Customer info */}
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="relative">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="w-16 h-16 rounded-full object-cover border-4 border-emerald-200 shadow-lg" 
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg">{testimonial.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className="w-4 h-4 text-yellow-400" />
                      ))}
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">Khách hàng thân thiết</span>
                    </div>
                  </div>
                </div>

                {/* Testimonial text */}
                <blockquote className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed italic relative z-10">
                  "{testimonial.text}"
                </blockquote>

                {/* Rating bar */}
                <div className="mt-6 pt-6 border-t border-emerald-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Đánh giá tổng thể</span>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon key={i} className="w-4 h-4 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">5.0</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl max-w-md mx-auto">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Tham Gia Cộng Đồng</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Hơn 10,000+ khách hàng hài lòng</p>
              <Link 
                to="/register"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform duration-300"
              >
                Đăng Ký Ngay
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
