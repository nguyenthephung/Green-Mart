import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlashSaleStore } from '../../stores/useFlashSaleStore';
import { useBannerStore } from '../../stores/useBannerStore';
import { useCategoryStore } from '../../stores/useCategoryStore';
import { Flame, ChevronLeft, ChevronRight } from 'lucide-react';

const GuestFlashSalePage: React.FC = () => {
  const { activeFlashSales, upcomingFlashSales, fetchActiveFlashSales, fetchUpcomingFlashSales } =
    useFlashSaleStore();
  const { banners, fetchBanners } = useBannerStore();
  const { categories, fetchCategories } = useCategoryStore();
  const [currentIndexes, setCurrentIndexes] = useState<Record<string, number>>({});
  const [filterType, setFilterType] = useState<'active' | 'upcoming'>('active');
  const productsPerView = 5;
  const navigate = useNavigate();

  useEffect(() => {
    if (filterType === 'active') {
      fetchActiveFlashSales();
    } else {
      fetchUpcomingFlashSales();
    }
    fetchBanners();
    fetchCategories();
  }, [filterType, fetchActiveFlashSales, fetchUpcomingFlashSales, fetchBanners, fetchCategories]);

  // Lấy banner category cho từng danh mục
  const categoryBanners = useMemo(() => {
    const map: Record<string, any> = {};
    banners.forEach(b => {
      if (b.position === 'category' && b.categoryId) {
        map[b.categoryId] = b;
      }
    });
    return map;
  }, [banners]);

  // Gom flash sale cho từng category cha (bao gồm cả sub), tách section theo từng flash sale (khung giờ)
  const salesByCategory = useMemo(() => {
    const result: Record<string, any[]> = {};
    const sourceSales = filterType === 'active' ? activeFlashSales : upcomingFlashSales;
    categories.forEach((cat: any) => {
      const allNames = [cat.name, ...(cat.subs || [])];
      const flashSalesForCat = sourceSales.filter((sale: any) =>
        sale.products.some((p: any) => {
          const prodCat = p.product?.category;
          return prodCat && allNames.includes(prodCat);
        })
      );
      result[cat.name] = flashSalesForCat;
    });
    return result;
  }, [activeFlashSales, upcomingFlashSales, categories, filterType]);

  // Countdown cho từng flash sale, cập nhật mỗi giây
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getTimeLeft = (sale: any) => {
    const endTime = new Date(sale.endTime).getTime();
    const difference = endTime - now;
    if (difference <= 0) return { hours: 0, minutes: 0, seconds: 0 };
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    return { hours, minutes, seconds };
  };

  // Đã tách section theo từng flash sale, không cần nextProducts/prevProducts cho category nữa

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 py-0">
      <div className="w-full px-0">
        <h1 className="text-4xl font-black text-center mb-8 text-orange-700 tracking-tight py-8 bg-gradient-to-r from-orange-100 to-yellow-100">
          FLASH SALE HOT NHẤT
        </h1>
        <div className="flex justify-center gap-4 mb-8">
          <button
            className={`px-6 py-3 rounded-full font-bold text-lg transition-all duration-300 shadow-lg ${filterType === 'active' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white scale-105' : 'bg-gray-100 text-gray-700 hover:bg-orange-50'}`}
            onClick={() => setFilterType('active')}
          >
            Đang diễn ra
          </button>
          <button
            className={`px-6 py-3 rounded-full font-bold text-lg transition-all duration-300 shadow-lg ${filterType === 'upcoming' ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white scale-105' : 'bg-gray-100 text-gray-700 hover:bg-yellow-50'}`}
            onClick={() => setFilterType('upcoming')}
          >
            Sắp diễn ra
          </button>
        </div>
        {categories.map(cat => (
          <section key={cat._id} className="w-full mb-16">
            {/* Banner category */}
            {categoryBanners[cat.id] && (
              <div className="mb-6 flex justify-center w-full">
                <img
                  src={categoryBanners[cat.id].imageUrl}
                  alt={categoryBanners[cat.id].title}
                  className="rounded-2xl shadow-2xl max-h-56 object-cover w-full"
                />
              </div>
            )}
            <h2 className="text-3xl font-bold text-orange-700 mb-6 text-center tracking-wide uppercase">
              {cat.name}
            </h2>
            {/* Section cho từng flash sale (khung giờ) */}
            {salesByCategory[cat.name]?.length ? (
              salesByCategory[cat.name].map((sale, saleIdx) => {
                // Lấy các sản phẩm thuộc category này trong flash sale này
                const allNames = [cat.name, ...(cat.subs || [])];
                const products = sale.products.filter((p: any) => {
                  const prodCat = p.product?.category;
                  return prodCat && allNames.includes(prodCat);
                });
                // Ẩn section nếu hết thời gian
                const time = getTimeLeft(sale);
                if (
                  !products.length ||
                  (time.hours === 0 && time.minutes === 0 && time.seconds === 0)
                )
                  return null;
                return (
                  <div
                    key={sale._id + '-' + saleIdx}
                    className="relative w-full bg-gradient-to-r from-orange-100 to-yellow-100 rounded-2xl shadow-2xl p-8 flex flex-col items-center mb-8"
                  >
                    {/* Countdown cho khung giờ này */}
                    <div className="flex items-center gap-4 mb-6 justify-center">
                      <Flame className="w-8 h-8 text-yellow-500 animate-pulse" />
                      <span className="font-bold text-orange-700 text-lg">
                        Khung giờ:{' '}
                        {`${new Date(sale.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${new Date(sale.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`}
                      </span>
                      <span className="font-semibold text-orange-600">Kết thúc trong:</span>
                      <div className="flex gap-1">
                        <span className="bg-orange-400 text-white px-3 py-2 rounded text-lg font-mono min-w-[2rem] text-center shadow-lg">
                          {String(time.hours).padStart(2, '0')}
                        </span>
                        <span className="text-orange-700 font-bold text-lg">:</span>
                        <span className="bg-orange-400 text-white px-3 py-2 rounded text-lg font-mono min-w-[2rem] text-center shadow-lg">
                          {String(time.minutes).padStart(2, '0')}
                        </span>
                        <span className="text-orange-700 font-bold text-lg">:</span>
                        <span className="bg-orange-400 text-white px-3 py-2 rounded text-lg font-mono min-w-[2rem] text-center shadow-lg">
                          {String(time.seconds).padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-6 overflow-x-auto scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-orange-100 w-full justify-center">
                      {products
                        .slice(
                          currentIndexes[cat.name + '-' + sale._id] || 0,
                          (currentIndexes[cat.name + '-' + sale._id] || 0) + productsPerView
                        )
                        .map((product: any, idx: any) => {
                          const available = (product.quantity || 0) - (product.sold || 0) > 0;
                          if (!available) return null;
                          const handleClick = () => {
                            if (filterType === 'active') {
                              navigate(`/productdetail/${product.productId}`, {
                                state: {
                                  flashSale: {
                                    flashSaleId: sale._id,
                                    flashSalePrice: product.flashSalePrice,
                                    originalPrice: product.originalPrice,
                                    discountPercentage: product.discountPercentage,
                                    quantity: product.quantity,
                                    sold: product.sold,
                                    endTime: sale.endTime,
                                  },
                                },
                              });
                            } else {
                              navigate(`/productdetail/${product.productId}`);
                            }
                          };
                          return (
                            <div
                              key={sale._id + '-' + idx}
                              onClick={handleClick}
                              className="min-w-[240px] max-w-[240px] bg-white rounded-2xl p-6 cursor-pointer hover:shadow-2xl transform hover:scale-105 transition-all duration-200 border-2 border-orange-200 flex flex-col items-center"
                            >
                              <img
                                src={product.product?.image || '/placeholder-image.jpg'}
                                alt={product.product?.name || 'Product'}
                                className="w-full h-40 object-cover rounded-xl mb-3 shadow-lg"
                              />
                              <h3
                                className="font-bold text-orange-700 mb-2 text-base text-center max-w-[220px] overflow-hidden whitespace-normal break-words line-clamp-2"
                                style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                }}
                              >
                                {product.product?.name || 'Sản phẩm không tên'}
                              </h3>
                              <div className="flex flex-col gap-1 mb-3 items-center">
                                <span className="text-red-600 font-bold text-xl">
                                  {product.flashSalePrice?.toLocaleString('vi-VN')}₫
                                </span>
                                <span className="text-gray-400 line-through text-sm">
                                  {product.originalPrice?.toLocaleString('vi-VN')}₫
                                </span>
                              </div>
                              <div className="mb-3 w-full">
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                  <span>Đã bán {product.sold || 0}</span>
                                  <span>Còn {(product.quantity || 0) - (product.sold || 0)}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full"
                                    style={{
                                      width: `${product.quantity > 0 ? (product.sold / product.quantity) * 100 : 0}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                    {/* Navigation buttons */}
                    {products.length > productsPerView && (
                      <>
                        <button
                          onClick={() =>
                            setCurrentIndexes(idx => ({
                              ...idx,
                              [cat.name + '-' + sale._id]: Math.max(
                                (idx[cat.name + '-' + sale._id] || 0) - 1,
                                0
                              ),
                            }))
                          }
                          disabled={(currentIndexes[cat.name + '-' + sale._id] || 0) === 0}
                          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-orange-400 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-full p-3 transition-all duration-200 shadow-lg"
                        >
                          <ChevronLeft className="w-6 h-6 text-white" />
                        </button>
                        <button
                          onClick={() =>
                            setCurrentIndexes(idx => ({
                              ...idx,
                              [cat.name + '-' + sale._id]: Math.min(
                                (idx[cat.name + '-' + sale._id] || 0) + 1,
                                products.length - productsPerView
                              ),
                            }))
                          }
                          disabled={
                            (currentIndexes[cat.name + '-' + sale._id] || 0) >=
                            products.length - productsPerView
                          }
                          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-orange-400 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-full p-3 transition-all duration-200 shadow-lg"
                        >
                          <ChevronRight className="w-6 h-6 text-white" />
                        </button>
                      </>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-400 italic">
                Chưa có flash sale cho danh mục này
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
};

export default GuestFlashSalePage;
