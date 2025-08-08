import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';

import { useProductStore } from '../../stores/useProductStore';
import { useCategoryStore } from '../../stores/useCategoryStore';
import HeroSection from '../../components/Guest/home/sections/HeroSection';
import SectionBanner from '../../components/Guest/home/sections/SectionBanner';
import SidebarBanner from '../../components/Guest/home/sections/SidebarBanner';
import FooterBanner from '../../components/Guest/home/sections/FooterBanner';
import FeaturedBanner from '../../components/Guest/home/sections/FeaturedBanner';
import CategoryBanner from '../../components/Guest/home/sections/CategoryBanner';
import SaleBanner from '../../components/Guest/home/sections/SaleBanner';
import SaleSection from '../../components/Guest/home/sections/SaleSection';
import CategoriesSection from '../../components/Guest/home/sections/CategoriesSection';
import FeaturedProductsSection from '../../components/Guest/home/sections/FeaturedProductsSection';
import TestimonialsSection from '../../components/Guest/home/sections/TestimonialsSection';
import { useCartStore } from '../../stores/useCartStore';
import { usePageLoading } from '../../components/Loading';
import { LoadingSpinner } from '../../components/Loading';
import { testimonials } from '../../data/Guest/Home';

const Home: React.FC = memo(() => {
  const loading = usePageLoading(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const addToCart = useCartStore(state => state.addToCart);
  const fetchCategories = useCategoryStore(state => state.fetchCategories);

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
    // Chuẩn hóa dữ liệu giống CategoryPage
    const id = String(product._id || product.id);
    const type = product.type || (product.units && product.units[0]?.type) || 'count';
    const price = typeof product.salePrice === 'number' ? product.salePrice : (typeof product.price === 'number' ? product.price : (product.units && product.units[0]?.price) || 0);
    const unit = product.unit || (product.units && product.units[0]?.type) || '';
    addToCart({
      id,
      name: product.name,
      price,
      image: product.image,
      unit,
      quantity: type === 'weight' ? 0 : 1,
      type,
      weight: type === 'weight' ? 1 : undefined
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

  // Fetch categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Lấy danh sách parent categories từ category store thay vì từ products
  const categories = useCategoryStore(state => state.categories);
  
  // Sinh config section cho CategoriesSection - chỉ hiển thị parent categories
  const categorySections = useMemo(() =>
    categories
      .filter(cat => cat.status === 'active' && cat.subs && cat.subs.length > 0)
      .map((cat) => ({
        title: cat.name,
        category: cat.name,
        titleClass: 'text-left flex items-center gap-3 text-2xl font-bold text-emerald-700 dark:text-emerald-200',
        viewMoreLink: `/category/${cat.name}`,
        productCount: products.filter((p: any) => 
          p.status === 'active' && cat.subs.includes(p.category)
        ).length
      })),
    [categories, products]
  );

  // Memoize getProductsByCategory - Filter by subcategories of parent category
  const getProductsByCategory = useMemo(() => {
    return (parentCategoryName: string) => {
      const parentCategory = categories.find(cat => cat.name === parentCategoryName);
      if (!parentCategory || !parentCategory.subs) return [];
      
      // Lấy tất cả sản phẩm thuộc các subcategory của parent category này
      const categoryProducts = products.filter((product: any) => {
        if (product.status !== 'active') return false;
        
        // Check for valid price
        const hasValidPrice = (typeof product.price === 'number') || 
          (product.units && product.units.length > 0 && typeof product.units[0].price === 'number');
        
        if (!hasValidPrice) return false;
        
        // Check if product belongs to any subcategory of this parent
        return parentCategory.subs.includes(product.category);
      });
      
      return categoryProducts.slice(0, 8); // Giới hạn 8 sản phẩm per section
    };
  }, [products, categories]);

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
      {/* Sidebar Banner - Fixed position */}
      <SidebarBanner />
      
      {/* Hero Section with Database Banners Only */}
      <HeroSection
        isScrolling={isScrolling}
      />
      
      {/* Sale Banner - Eye-catching sale section */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <SaleBanner className="mb-8" />
      </div>
      
      <SaleSection
        saleProducts={saleProducts}
        handleAddToCart={handleAddToCart}
      />
      
      {/* Featured Banner - Highlight featured products */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <FeaturedBanner className="mb-8" />
      </div>
      
      <FeaturedProductsSection
        featuredProducts={featuredProducts}
        handleAddToCart={handleAddToCart}
      />
      
      {/* Category Banner - Compact version */}
      <div className="w-full bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 py-8 mb-6">
        <CategoryBanner className="max-w-7xl mx-auto px-4" />
      </div>
      
      {/* Section banner for categories */}
      <div className="max-w-7xl mx-auto px-8 mb-6">
        <SectionBanner 
          sectionType="categories" 
          className="h-20 shadow-lg"
        />
      </div>
      
      <CategoriesSection
        getProductsByCategory={getProductsByCategory}
        handleAddToCart={handleAddToCart}
        products={products}
        sections={categorySections}
      />
      
      <TestimonialsSection testimonials={testimonials} />
      
      {/* Footer Banner - Full width at bottom */}
      <div className="w-full px-4 py-8 bg-gray-50 dark:bg-gray-800">
        <FooterBanner />
      </div>
    </div>
  );
});

export default Home;