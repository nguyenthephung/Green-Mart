import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecommendationItem {
  id: number;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  stock: number;
}

interface RecommendationsProps {
  items: RecommendationItem[];
}

export default function Recommendations({ items }: RecommendationsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const navigate = useNavigate();

  const handleProductClick = (productId: number) => {
    navigate(`/productdetail/${productId}`);
  };

  const updateScrollButtons = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  };

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = dir === 'left' ? -500 : 500;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    updateScrollButtons();

    scroller.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);

    return () => {
      scroller.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, []);

  return (
    <section className="mt-10">
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="text-xl font-semibold">Sản phẩm liên quan</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`p-2 rounded-full border hover:bg-gray-100 transition ${
              !canScrollLeft ? 'opacity-30 cursor-not-allowed' : ''
            }`}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`p-2 rounded-full border hover:bg-gray-100 transition ${
              !canScrollRight ? 'opacity-30 cursor-not-allowed' : ''
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex space-x-6 overflow-x-auto px-2 scrollbar-hide">
        {items.map(item => (
          <div
            key={item.id}
            className="min-w-[220px] bg-green-50 rounded-2xl p-4 flex-shrink-0 cursor-pointer hover:bg-green-100 transition-colors duration-200"
            onClick={() => handleProductClick(item.id)}
          >
            <img src={item.image} alt={item.name} className="w-full h-40 object-contain mb-3" />
            <div className="text-sm font-medium">{item.name}</div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                {item.price.toLocaleString()} ₫
              </span>
              <span className="line-through text-sm text-gray-400">
                {item.originalPrice.toLocaleString()} ₫
              </span>
            </div>
            <div className="text-sm mt-1">
              <span className="text-green-700 font-semibold">Còn lại: {item.stock}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
