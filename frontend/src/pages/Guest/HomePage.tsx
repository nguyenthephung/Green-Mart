import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { useLocation } from 'react-router-dom';

import { useProductStore } from '../../stores/useProductStore';
import { useCategoryStore } from '../../stores/useCategoryStore';
import { useFlashSaleStore } from '../../stores/useFlashSaleStore';
import { useResponsive } from '../../hooks/useResponsive';
import { useSEO } from '../../hooks/useSEO';
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
import FlashSaleSection from '../../components/Guest/FlashSale/FlashSaleSection';
import LazySection from '../../components/LazySection';
import { useCartStore } from '../../stores/useCartStore';
import { usePageLoading } from '../../components/Loading';
import { LoadingSpinner } from '../../components/Loading';
import { testimonials } from '../../data/Guest/Home';

const Home: React.FC = memo(() => {
  // SEO optimization
  useSEO({ page: 'home' });
  
  const fetchAllProducts = useProductStore(state => state.fetchAll);
  const location = useLocation();
  const { isMobile } = useResponsive();

  // Fetch products when route changes (e.g. after add product)
  useEffect(() => {
    const fetchWithRetry = async (retries = 3) => {
      try {
        await fetchAllProducts();
      } catch (error) {
        console.error('Failed to fetch products, retries left:', retries - 1, error);
        if (retries > 1) {
          // Retry after a short delay
          setTimeout(() => fetchWithRetry(retries - 1), 1000);
        }
      }
    };

    fetchWithRetry();
  }, [location.pathname, fetchAllProducts]);
  const loading = usePageLoading(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  const addToCart = useCartStore(state => state.addToCart);
  const fetchCategories = useCategoryStore(state => state.fetchCategories);

  // Flash Sale store
  const { fetchActiveFlashSales, getFlashSaleForProduct } = useFlashSaleStore();

  // Create flying effect for add to cart animation - Optimized
  const createFlyingEffect = useCallback(
    (event: React.MouseEvent, product: any) => {
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
    },
    [isScrolling]
  );

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

  // Enhanced handleAddToCart with optimized flying animation and Flash Sale support
  const handleAddToCart = useCallback(
    (product: any, event?: React.MouseEvent) => {
      // Chuẩn hóa dữ liệu giống CategoryPage
      const id = String(product._id || product.id);
      const type = product.type || (product.units && product.units[0]?.type) || 'count';

      // Check if product is in Flash Sale
      const flashSaleInfo = getFlashSaleForProduct(id);

      // Use Flash Sale price if available, otherwise use regular pricing logic
      let price: number;
      if (flashSaleInfo) {
        price = flashSaleInfo.product.flashSalePrice;
      } else {
        price =
          typeof product.salePrice === 'number'
            ? product.salePrice
            : typeof product.price === 'number'
              ? product.price
              : (product.units && product.units[0]?.price) || 0;
      }

      const unit = product.unit || (product.units && product.units[0]?.type) || '';

      addToCart({
        id,
        name: product.name,
        price,
        image: product.image,
        unit,
        quantity: type === 'weight' ? 0 : 1,
        type,
        weight: type === 'weight' ? 1 : undefined,
        // Include Flash Sale info if applicable
        flashSale: flashSaleInfo
          ? {
              flashSaleId: flashSaleInfo.flashSale._id,
              isFlashSale: true,
              originalPrice: flashSaleInfo.product.originalPrice,
              discountPercentage: flashSaleInfo.product.discountPercentage,
            }
          : undefined,
      });
      if (event) {
        createFlyingEffect(event, product);
      }
      triggerCartBounce();
    },
    [addToCart, createFlyingEffect, triggerCartBounce, getFlashSaleForProduct]
  );

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

  // Add timeout for loading state to prevent infinite loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading || !products || products.length === 0) {
        console.warn('Page loading timeout - proceeding without full data');
        setHasTimedOut(true);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeoutId);
  }, [loading, products]);

  // Chuẩn hóa product: luôn có price và unit
  const normalizeProduct = (product: any) => ({
    ...product,
    price:
      typeof product.price === 'number'
        ? product.price
        : product.units && product.units.length > 0 && typeof product.units[0].price === 'number'
          ? product.units[0].price
          : 0,
    unit:
      product.unit ||
      (product.units && product.units.length > 0 ? product.units[0].type : undefined),
  });
  const saleProducts = useMemo(
    () =>
      products
        .filter(
          (product: any) =>
            product.status === 'active' &&
            product.isSale &&
            (typeof product.price === 'number' ||
              (product.units &&
                product.units.length > 0 &&
                typeof product.units[0].price === 'number'))
        )
        .map(normalizeProduct),
    [products]
  );
  const featuredProducts = useMemo(
    () =>
      products
        .filter(
          (product: any) =>
            product.isFeatured &&
            product.status === 'active' &&
            (typeof product.price === 'number' ||
              (product.units &&
                product.units.length > 0 &&
                typeof product.units[0].price === 'number'))
        )
        .map(normalizeProduct),
    [products]
  );

  // Fetch categories and Flash Sales when component mounts
  useEffect(() => {
    fetchCategories();
    fetchActiveFlashSales();
  }, [fetchCategories, fetchActiveFlashSales]);

  // Lấy danh sách parent categories từ category store thay vì từ products
  const categories = useCategoryStore(state => state.categories);

  // Sinh config section cho CategoriesSection - chỉ hiển thị parent categories
  const categorySections = useMemo(
    () =>
      categories
        .filter(cat => cat.status === 'active' && cat.subs && cat.subs.length > 0)
        .map(cat => {
          // Count all products in this category (with valid price), not just those displayed
          const totalProducts = products.filter((product: any) => {
            if (product.status !== 'active') return false;
            const hasValidPrice =
              typeof product.price === 'number' ||
              (product.units &&
                product.units.length > 0 &&
                typeof product.units[0].price === 'number');
            if (!hasValidPrice) return false;
            return cat.subs.includes(product.category);
          }).length;
          return {
            title: cat.name,
            category: cat.name,
            id: cat.id || cat.name, // Add unique id
            titleClass:
              'text-left flex items-center gap-3 text-2xl font-bold text-emerald-700 dark:text-emerald-200',
            viewMoreLink: `/category/${cat.name}`,
            productCount: totalProducts,
          };
        }),
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
        const hasValidPrice =
          typeof product.price === 'number' ||
          (product.units && product.units.length > 0 && typeof product.units[0].price === 'number');

        if (!hasValidPrice) return false;

        // Check if product belongs to any subcategory of this parent
        return parentCategory.subs.includes(product.category);
      });

      return categoryProducts.slice(0, 8); // Giới hạn 8 sản phẩm per section
    };
  }, [products, categories]);

  if ((loading || !products || products.length === 0) && !hasTimedOut) {
    return <LoadingSpinner size="xl" text="Đang tải sản phẩm..." fullScreen={true} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 scroll-optimized">
      {/* Sidebar Banner - Hidden on mobile */}
      {!isMobile && <SidebarBanner />}

      {/* Hero Section with Database Banners Only */}
      <HeroSection isScrolling={isScrolling} />

      {/* Show message if no products available after timeout */}
      {hasTimedOut && (!products || products.length === 0) && (
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Đang tải dữ liệu...
            </h2>
            <p className="text-yellow-700 dark:text-yellow-300">
              Vui lòng chờ hoặc thử tải lại trang nếu mất quá nhiều thời gian.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      )}

      {/* Flash Sale Section - Load immediately for high priority content */}
      <LazySection
        threshold={0.2}
        rootMargin="100px"
        placeholder={
          <div className="min-h-[300px] flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        }
      >
        <div className={`max-w-7xl mx-auto ${isMobile ? 'px-2 py-4' : 'px-4 py-6'}`}>
          <FlashSaleSection />
        </div>
      </LazySection>

      {/* Sale Banner - Eye-catching sale section */}
      <LazySection
        threshold={0.1}
        rootMargin="50px"
        delay={100}
        placeholder={
          <div className="min-h-[200px] flex items-center justify-center">
            <LoadingSpinner />
          </div>
        }
      >
        <div className={`max-w-7xl mx-auto ${isMobile ? 'px-2 py-4 mt-4' : 'px-4 py-8 mt-8'}`}>
          <SaleBanner className={isMobile ? 'mb-4' : 'mb-8'} />
        </div>

        <SaleSection saleProducts={saleProducts} handleAddToCart={handleAddToCart} />
      </LazySection>

      {/* Featured Banner - Highlight featured products */}
      <LazySection
        threshold={0.1}
        rootMargin="50px"
        delay={200}
        placeholder={
          <div className="min-h-[300px] flex items-center justify-center">
            <LoadingSpinner />
          </div>
        }
      >
        <div className={`max-w-7xl mx-auto ${isMobile ? 'px-2 py-3' : 'px-4 py-6'}`}>
          <FeaturedBanner className={isMobile ? 'mb-4' : 'mb-8'} />
        </div>

        <FeaturedProductsSection
          featuredProducts={featuredProducts}
          handleAddToCart={handleAddToCart}
        />
      </LazySection>

      {/* Category Banner - Compact version */}
      <LazySection
        threshold={0.1}
        rootMargin="50px"
        delay={300}
        placeholder={
          <div className="min-h-[400px] flex items-center justify-center">
            <LoadingSpinner />
          </div>
        }
      >
        <div className={`max-w-7xl mx-auto ${isMobile ? 'px-2 py-3' : 'px-4 py-6'}`}>
          <CategoryBanner className={`max-w-7xl mx-auto ${isMobile ? 'px-2' : 'px-4'}`} />
        </div>

        {/* Section banner for categories */}
        <div className={`max-w-7xl mx-auto ${isMobile ? 'px-4 mb-3' : 'px-8 mb-6'}`}>
          <SectionBanner
            sectionType="categories"
            className={isMobile ? 'h-16 shadow-md' : 'h-20 shadow-lg'}
          />
        </div>

        <CategoriesSection
          getProductsByCategory={getProductsByCategory}
          handleAddToCart={handleAddToCart}
          products={products}
          sections={categorySections}
        />
      </LazySection>

      {/* Testimonials Section */}
      <LazySection
        threshold={0.1}
        rootMargin="50px"
        delay={400}
        placeholder={
          <div className="min-h-[200px] flex items-center justify-center">
            <LoadingSpinner />
          </div>
        }
      >
        <TestimonialsSection testimonials={testimonials} />
      </LazySection>

      {/* Footer Banner - Full width at bottom */}
      <LazySection
        threshold={0.1}
        rootMargin="50px"
        delay={500}
        placeholder={
          <div className="min-h-[100px] flex items-center justify-center">
            <LoadingSpinner />
          </div>
        }
      >
        <div
          className={`w-full ${isMobile ? 'px-2 py-4' : 'px-4 py-8'} bg-gray-50 dark:bg-gray-800`}
        >
          <FooterBanner />
        </div>
      </LazySection>
    </div>
  );
});

export default Home;
