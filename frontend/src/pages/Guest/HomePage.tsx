import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';

import { useProductStore } from '../../stores/useProductStore';
import { useUserStore } from '../../stores/useUserStore';
import HeroSection from '../../components/Guest/home/sections/HeroSection';
import SaleSection from '../../components/Guest/home/sections/SaleSection';
import CategoriesSection from '../../components/Guest/home/sections/CategoriesSection';
import FeaturedProductsSection from '../../components/Guest/home/sections/FeaturedProductsSection';
import TestimonialsSection from '../../components/Guest/home/sections/TestimonialsSection';
import { useCartStore } from '../../stores/useCartStore';
import { usePageLoading } from '../../components/Loading';
import { LoadingSpinner } from '../../components/Loading';
import meatHero from '../../assets/category-hero/meat.jpg';
import vegetablesHero from '../../assets/category-hero/vegetables.jpg';
import fruitsHero from '../../assets/category-hero/fruits.jpg';
import dryfoodHero from '../../assets/category-hero/dryfood.jpg';
import spicesHero from '../../assets/category-hero/spices.jpg';
import drinkHero from '../../assets/category-hero/drink.jpg';


// Real slides data using actual images
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

const Home: React.FC = memo(() => {
  const loading = usePageLoading(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const addToCart = useCartStore(state => state.addToCart);

  // Create flying effect for add to cart animation - Optimized
  const createFlyingEffect = useCallback((event: React.MouseEvent, product: any) => {
    // Skip animation if user is scrolling for better performance
    if (isScrolling) return;
    
    const clickedElement = event.currentTarget as HTMLElement;
    const rect = clickedElement.getBoundingClientRect();
    const cartIcon = document.getElementById('cart-fly-icon');
    
    if (!cartIcon) return;

    const cartRect = cartIcon.getBoundingClientRect();
    
    // Create flying element with optimized properties
    const flyingEl = document.createElement('div');
    flyingEl.className = 'flying-item';
    flyingEl.style.cssText = `
      position: fixed;
      left: ${rect.left + rect.width / 2}px;
      top: ${rect.top + rect.height / 2}px;
      transform: translate(-50%, -50%);
      z-index: 9999;
      transition: all 0.8s cubic-bezier(.4,1.6,.6,1);
      pointer-events: none;
      will-change: transform, opacity;
    `;
    
    flyingEl.innerHTML = `
      <div style="background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); padding: 4px; border: 2px solid #10b981;">
        <img src="${product.image}" alt="${product.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; display: block;" />
      </div>
    `;
    
    document.body.appendChild(flyingEl);
    
    // Use RAF for smoother animation
    requestAnimationFrame(() => {
      flyingEl.style.left = `${cartRect.left + cartRect.width / 2}px`;
      flyingEl.style.top = `${cartRect.top + cartRect.height / 2}px`;
      flyingEl.style.transform = 'translate(-50%, -50%) scale(0.3)';
      flyingEl.style.opacity = '0';
    });
    
    // Remove element after animation
    setTimeout(() => {
      if (flyingEl.parentNode) {
        flyingEl.parentNode.removeChild(flyingEl);
      }
    }, 800);
  }, [isScrolling]);

  const triggerCartBounce = useCallback(() => {
    // Skip bounce animation if scrolling for better performance
    if (isScrolling) return;
    
    const cartIcon = document.getElementById('cart-fly-icon');
    if (cartIcon) {
      cartIcon.style.transform = 'scale(1.2)';
      cartIcon.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
      
      setTimeout(() => {
        cartIcon.style.transform = 'scale(1)';
      }, 300);
    }
  }, [isScrolling]);

  // Enhanced handleAddToCart with optimized flying animation
  const handleAddToCart = useCallback((product: any, event?: React.MouseEvent) => {
    // Lấy price và unit từ product hoặc product.units[0]
    const price = typeof product.price === 'number'
      ? product.price
      : (product.units && product.units.length > 0 && typeof product.units[0].price === 'number')
        ? product.units[0].price
        : 0;
    const unit = product.unit || (product.units && product.units.length > 0 ? product.units[0].type : undefined);
    addToCart({
      id: Number(product.id),
      name: product.name,
      price,
      image: product.image,
      unit,
      quantity: 1
    });
    if (event) {
      createFlyingEffect(event, product);
    }
    triggerCartBounce();
  }, [addToCart, createFlyingEffect, triggerCartBounce]);

  // Detect scrolling để tạm dừng animations khi scroll - Optimized
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    let animationId: number;
    let lastScrollY = 0;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = Math.abs(currentScrollY - lastScrollY);
      
      // Only update if scroll delta is significant (reduce unnecessary updates)
      if (scrollDelta > 5) {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
        
        animationId = requestAnimationFrame(() => {
          setIsScrolling(true);
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            setIsScrolling(false);
          }, 150); // Increased timeout for better performance
        });
        
        lastScrollY = currentScrollY;
      }
    };
    
    // Use passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  // Lấy dữ liệu từ store
  const products = useProductStore((state: any) => state.products);
  const testimonials = useUserStore((state: any) => state.testimonials) || [];



  // Chuẩn hóa product: luôn có price và unit
  const normalizeProduct = (product: any) => ({
    ...product,
    price: typeof product.price === 'number'
      ? product.price
      : (product.units && product.units.length > 0 && typeof product.units[0].price === 'number')
        ? product.units[0].price
        : 0,
    unit: product.unit || (product.units && product.units.length > 0 ? product.units[0].type : undefined)
  });
  const saleProducts = useMemo(() =>
    products.filter((product: any) =>
      product.status === 'active' &&
      product.isSale &&
      ((typeof product.price === 'number') || (product.units && product.units.length > 0 && typeof product.units[0].price === 'number'))
    ).map(normalizeProduct),
    [products]
  );
  const featuredProducts = useMemo(() =>
    products.filter((product: any) =>
      product.isFeatured &&
      product.status === 'active' &&
      ((typeof product.price === 'number') || (product.units && product.units.length > 0 && typeof product.units[0].price === 'number'))
    ).map(normalizeProduct),
    [products]
  );

  // Auto-slide effect - Optimized
  useEffect(() => {
    // Pause auto-slide when scrolling to improve performance
    if (isScrolling) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % realSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isScrolling]);

  // Lấy danh sách category động từ products
  const categoryList = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p: any) => {
      if (p.status === 'active' && p.category) set.add(p.category);
    });
    return Array.from(set); // lấy tất cả danh mục, không dùng ảnh ở tiêu đề
  }, [products]);

  // (Đã bỏ heroImageMap, không còn dùng)

  // Sinh config section cho CategoriesSection
  const categorySections = useMemo(() =>
    categoryList.map((cat) => ({
      title: cat,
      category: cat,
      // Đổi màu chữ phù hợp dark mode
      titleClass: 'text-left flex items-center gap-3 text-2xl font-bold text-emerald-700 dark:text-emerald-200',
      viewMoreLink: `/category/${cat}`,
      // Bỏ heroImage
      productCount: products.filter((p: any) => p.status === 'active' && p.category === cat).length
    })),
    [categoryList, products]
  );

  // Memoize getProductsByCategory
  const getProductsByCategory = useMemo(() => {
    const categorizedProducts = products.reduce((acc: Record<string, any[]>, product: any) => {
      if (product.status !== 'active') return acc;
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      if ((typeof product.price === 'number') || (product.units && product.units.length > 0 && typeof product.units[0].price === 'number')) {
        acc[product.category].push(product);
      }
      return acc;
    }, {} as Record<string, any[]>);
    return (category: string) => categorizedProducts[category]?.slice(0, 8) || [];
  }, [products]);

  if (loading || !products || products.length === 0) {
    return (
      <LoadingSpinner
        size="xl"
        text="Đang tải sản phẩm..."
        fullScreen={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 scroll-optimized">
      <HeroSection
        realSlides={realSlides}
        currentSlide={currentSlide}
        setCurrentSlide={setCurrentSlide}
        isScrolling={isScrolling}
        backgroundImage={realSlides[currentSlide]?.image}
      />
      <SaleSection
        saleProducts={saleProducts}
        handleAddToCart={handleAddToCart}
      />
      <CategoriesSection
        getProductsByCategory={getProductsByCategory}
        handleAddToCart={handleAddToCart}
        products={products}
        sections={categorySections}
      />
      <FeaturedProductsSection
        featuredProducts={featuredProducts}
        handleAddToCart={handleAddToCart}
      />
      <TestimonialsSection testimonials={testimonials} />
    </div>
  );
});

export default Home;