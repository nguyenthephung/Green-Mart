import { useRef, useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProductStore } from "../../../stores/useProductStore";
import { useCartStore } from "../../../stores/useCartStore";

interface SmartRecommendationsProps {
  maxItems?: number;
}

export default function SmartRecommendations({ maxItems = 10 }: SmartRecommendationsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const navigate = useNavigate();
  
  const { products } = useProductStore();
  const { items: cartItems } = useCartStore();

  // Generate smart recommendations based on cart items
  const recommendations = useMemo(() => {
    if (!products || products.length === 0 || cartItems.length === 0) {
      // Fallback to popular products if no cart items
      return products?.slice(0, maxItems).map(p => ({
        id: p.id,
        name: p.name,
        image: p.image,
        price: p.salePrice || p.price,
        originalPrice: p.price,
        stock: p.stock || 0,
        category: p.category,
      })) || [];
    }

    // Get categories from cart items
    const cartCategories = new Set<string>();
    const cartProductIds = new Set<string>();
    
    cartItems.forEach(item => {
      const product = products.find(p => String(p.id) === String(item.id));
      if (product) {
        cartCategories.add(product.category);
        cartProductIds.add(String(product.id));
      }
    });

    // Find products in same categories, excluding items already in cart
    const categoryRecommendations = products
      .filter(product => 
        cartCategories.has(product.category) && 
        !cartProductIds.has(String(product.id)) &&
        product.stock > 0
      )
      .map(p => ({
        id: p.id,
        name: p.name,
        image: p.image,
        price: p.salePrice || p.price,
        originalPrice: p.price,
        stock: p.stock || 0,
        category: p.category,
      }));

    // If not enough category-based recommendations, add popular products
    if (categoryRecommendations.length < maxItems) {
      const popularProducts = products
        .filter(product => 
          !cartProductIds.has(String(product.id)) &&
          product.stock > 0 &&
          !categoryRecommendations.some(rec => rec.id === product.id)
        )
        .slice(0, maxItems - categoryRecommendations.length)
        .map(p => ({
          id: p.id,
          name: p.name,
          image: p.image,
          price: p.salePrice || p.price,
          originalPrice: p.price,
          stock: p.stock || 0,
          category: p.category,
        }));

      return [...categoryRecommendations, ...popularProducts].slice(0, maxItems);
    }

    return categoryRecommendations.slice(0, maxItems);
  }, [products, cartItems, maxItems]);

  const handleProductClick = (productId: string | number) => {
    navigate(`/productdetail/${productId}`);
  };

  const updateScrollButtons = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  };

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      const amount = dir === "left" ? -300 : 300;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    updateScrollButtons();

    scroller.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      scroller?.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [recommendations]);

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Sản phẩm liên quan
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`p-2 rounded-full transition-all duration-200 ${
              canScrollLeft
                ? "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
                : "bg-gray-50 text-gray-400 cursor-not-allowed dark:bg-gray-800"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`p-2 rounded-full transition-all duration-200 ${
              canScrollRight
                ? "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
                : "bg-gray-50 text-gray-400 cursor-not-allowed dark:bg-gray-800"
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {recommendations.map((item) => (
          <div
            key={item.id}
            onClick={() => handleProductClick(item.id)}
            className="min-w-[160px] max-w-[160px] bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-3 cursor-pointer hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <div className="aspect-square mb-3 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-600">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            
            <h3 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2 text-xs leading-tight">
              {item.name}
            </h3>
            
            <div className="flex items-end justify-between">
              <div className="flex flex-col min-w-0 flex-1 mr-2">
                <span className="text-green-600 font-bold text-sm break-all">
                  {typeof item.price === 'number' ? item.price.toLocaleString('vi-VN') : '0'}₫
                </span>
                {item.originalPrice > item.price && (
                  <span className="text-gray-400 line-through text-xs break-all">
                    {typeof item.originalPrice === 'number' ? item.originalPrice.toLocaleString('vi-VN') : '0'}₫
                  </span>
                )}
              </div>
              
              {item.stock <= 5 && item.stock > 0 && (
                <span className="text-xs text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  {item.stock}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
