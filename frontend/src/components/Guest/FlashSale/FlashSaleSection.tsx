import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlashSaleStore } from '../../../stores/useFlashSaleStore';
import { Clock, Flame, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import type { FlashSale } from '../../../types/FlashSale';

const FlashSaleSection: React.FC = () => {
  const navigate = useNavigate();
  const { activeFlashSales, fetchActiveFlashSales, loading } = useFlashSaleStore();
  const [currentFlashSale, setCurrentFlashSale] = useState<FlashSale | null>(null);
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0 });
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const productsPerView = 4;

  useEffect(() => {
    fetchActiveFlashSales();
    // Refresh mỗi 30 giây để cập nhật trạng thái Flash Sale
    const interval = setInterval(() => {
      fetchActiveFlashSales();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchActiveFlashSales]);

  useEffect(() => {
    if (activeFlashSales.length > 0) {
      setCurrentFlashSale(activeFlashSales[0]);
    }
  }, [activeFlashSales]);

  // Countdown timer
  useEffect(() => {
    if (!currentFlashSale) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const endTime = new Date(currentFlashSale.endTime).getTime();
      const difference = endTime - now;

      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentFlashSale]);

  const handleProductClick = (productId: string, flashSaleInfo?: any) => {
    if (productId) {
      // Navigate with Flash Sale info
      navigate(`/productdetail/${productId}`, {
        state: {
          flashSale: flashSaleInfo
            ? {
                flashSaleId: currentFlashSale?._id,
                flashSalePrice: flashSaleInfo.flashSalePrice,
                originalPrice: flashSaleInfo.originalPrice,
                discountPercentage: flashSaleInfo.discountPercentage,
                quantity: flashSaleInfo.quantity,
                sold: flashSaleInfo.sold,
                endTime: currentFlashSale?.endTime,
              }
            : null,
        },
      });
    }
  };

  // Slider logic
  const nextProducts = () => {
    if (currentFlashSale && currentProductIndex < availableProducts.length - productsPerView) {
      setCurrentProductIndex(currentProductIndex + 1);
    }
  };

  const prevProducts = () => {
    if (currentProductIndex > 0) {
      setCurrentProductIndex(currentProductIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl p-6 text-white mb-8">
        <div className="animate-pulse">
          <div className="h-8 bg-white/20 rounded mb-4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/20 rounded-xl p-4">
                <div className="h-32 bg-white/10 rounded mb-2"></div>
                <div className="h-4 bg-white/10 rounded mb-2"></div>
                <div className="h-4 bg-white/10 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Filter out products that are sold out
  const availableProducts = currentFlashSale?.products
    ? currentFlashSale.products.filter(item => (item.quantity || 0) - (item.sold || 0) > 0)
    : [];
  if (!currentFlashSale || availableProducts.length === 0) {
    return null; // Don't render anything when no flash sale or all sold out
  }
  const visibleProducts = availableProducts.slice(
    currentProductIndex,
    currentProductIndex + productsPerView
  );

  return (
    <div className="relative bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl p-6 text-white mb-8 overflow-hidden">
      {/* Background Banner */}
      {currentFlashSale.bannerImage && (
        <div className="absolute inset-0 opacity-20">
          <img
            src={currentFlashSale.bannerImage}
            alt={currentFlashSale.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-yellow-300" />
              <h2 className="text-2xl font-bold">Flash Sale</h2>
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full">
              <span className="text-sm font-medium">{currentFlashSale.name}</span>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span className="text-sm">Kết thúc trong:</span>
            <div className="flex gap-1">
              <div className="bg-white/20 px-2 py-1 rounded text-sm font-mono min-w-[2rem] text-center">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <span>:</span>
              <div className="bg-white/20 px-2 py-1 rounded text-sm font-mono min-w-[2rem] text-center">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <span>:</span>
              <div className="bg-white/20 px-2 py-1 rounded text-sm font-mono min-w-[2rem] text-center">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {visibleProducts.map(item => {
              if ((item.quantity || 0) - (item.sold || 0) <= 0) return null;
              return (
                <div
                  key={`flash-sale-${item.productId}`}
                  onClick={() => handleProductClick(item.productId, item)}
                  className="min-w-[200px] max-w-[200px] bg-white rounded-xl p-4 cursor-pointer hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <div className="relative mb-3">
                    <img
                      src={item.product?.image || '/placeholder-image.jpg'}
                      alt={item.product?.name || 'Product'}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      -{item.discountPercentage || 0}%
                    </div>
                    <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                      {item.sold || 0}/{item.quantity || 0}
                    </div>
                  </div>

                  <h3
                    className="font-medium text-gray-900 mb-2 text-sm truncate"
                    title={item.product?.name || 'Sản phẩm không tên'}
                  >
                    {item.product?.name || 'Sản phẩm không tên'}
                  </h3>

                  <div className="flex flex-col gap-1 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 font-bold text-lg">
                        {item.flashSalePrice && !isNaN(Number(item.flashSalePrice))
                          ? Number(item.flashSalePrice).toLocaleString('vi-VN')
                          : '0'}
                        ₫
                      </span>
                    </div>
                    <span className="text-gray-400 line-through text-sm">
                      {item.originalPrice && !isNaN(Number(item.originalPrice))
                        ? Number(item.originalPrice).toLocaleString('vi-VN')
                        : '0'}
                      ₫
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Đã bán {item.sold || 0}</span>
                      <span>Còn {(item.quantity || 0) - (item.sold || 0)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full"
                        style={{
                          width: `${item.quantity > 0 ? (item.sold / item.quantity) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleProductClick(item.productId, item);
                    }}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-2 rounded-lg text-sm font-medium hover:from-orange-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Mua ngay
                  </button>
                </div>
              );
            })}
          </div>

          {/* Navigation buttons */}
          {availableProducts.length > productsPerView && (
            <>
              <button
                onClick={prevProducts}
                disabled={currentProductIndex === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-full p-2 transition-all duration-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextProducts}
                disabled={currentProductIndex >= availableProducts.length - productsPerView}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-full p-2 transition-all duration-200"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Nút xem thêm các sản phẩm flash sale */}
        <div className="w-full flex justify-end mt-6">
          <button
            onClick={() => navigate('/flash-sale')}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-lg shadow-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200"
          >
            <Flame className="w-5 h-5" />
            Xem thêm các sản phẩm flash sale
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashSaleSection;
