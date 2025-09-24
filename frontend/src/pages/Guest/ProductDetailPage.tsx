import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useProductStore } from '../../stores/useProductStore';
import { useResponsive } from '../../hooks/useResponsive';
import ProductDetailDisplay from '../../components/Guest/productDetail/ProductDetailDisplay';

import { FaShoppingCart, FaCheckCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useCartStore } from '../../stores/useCartStore';
import BannerManager from '../../components/Guest/BannerManager';

const ProductDetailPage: React.FC = () => {
  // 1. All hooks must be at the very top, no conditional logic before them
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { products, fetchAll } = useProductStore();
  const addToCart = useCartStore(state => state.addToCart);
  const { isMobile } = useResponsive();

  // Get Flash Sale info from navigation state
  const flashSaleInfo = location.state?.flashSale || null;

  // 2. All refs
  const imgRef = useRef<HTMLImageElement>(null);
  const imgRefs = useRef<{ [key: number]: React.RefObject<HTMLImageElement | null> }>({});

  // 3. All useState hooks
  // Remove quantity state for kg products
  const [mainImage, setMainImage] = useState<string>('');
  const [descIndex, setDescIndex] = useState<number>(0);

  // 4. All useMemo hooks
  const product = useMemo(() => {
    return products?.find((p: any) => String(p.id) === id) || null;
  }, [products, id]);

  const relatedProducts = useMemo(() => {
    if (!product || !products) return [];
    return products.filter((p: any) => p.category === product.category && String(p.id) !== id);
  }, [products, product, id]);

  const mainUnit = useMemo(() => {
    if (!product) return { type: '', price: 0, originalPrice: 0, isFlashSale: false };

    // If coming from Flash Sale, use Flash Sale price
    if (flashSaleInfo && flashSaleInfo.flashSalePrice) {
      return {
        type: product.unit === 'kg' ? 'kg' : product.unit || '',
        price: flashSaleInfo.flashSalePrice,
        originalPrice: flashSaleInfo.originalPrice || product.price,
        isFlashSale: true,
        discountPercentage: flashSaleInfo.discountPercentage,
        endTime: flashSaleInfo.endTime,
      };
    }

    // Normal pricing logic
    if (product.unit === 'kg') {
      return {
        type: 'kg',
        price: typeof product.salePrice === 'number' ? product.salePrice : product.price,
        originalPrice: product.price,
        isFlashSale: false,
      };
    }
    return {
      type: product.unit || '',
      price: typeof product.salePrice === 'number' ? product.salePrice : product.price,
      originalPrice: product.price,
      isFlashSale: false,
    };
  }, [product, flashSaleInfo]);

  const descriptionImages = useMemo(() => {
    return Array.isArray(product?.images) ? product.images : [];
  }, [product?.images]);

  // 5. All useEffect hooks
  useEffect(() => {
    const loadData = async () => {
      if (!products || products.length === 0) {
        await fetchAll();
      }
    };
    loadData();
  }, [products, fetchAll]);

  useEffect(() => {
    if (product?.image) {
      setMainImage(product.image);
    }
  }, [product]);

  useEffect(() => {
    if (descriptionImages.length > 0) {
      setMainImage(descriptionImages[descIndex] || product?.image || '');
    }
  }, [descIndex, descriptionImages, product]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

    // Listen for rating updates
    const handleRatingUpdate = (event: CustomEvent) => {
      const { productId: updatedProductId } = event.detail;
      if (updatedProductId === id) {
        // Reload product data to get updated rating info
        fetchAll();
      }
    };

    window.addEventListener('productRatingUpdated', handleRatingUpdate as EventListener);

    return () => {
      window.removeEventListener('productRatingUpdated', handleRatingUpdate as EventListener);
    };
  }, [id, fetchAll]);

  // 6. All useCallback hooks
  const handlePrev = useCallback(() => {
    if (descriptionImages.length > 0) {
      setDescIndex(prev => (prev - 1 + descriptionImages.length) % descriptionImages.length);
    }
  }, [descriptionImages.length]);

  const handleNext = useCallback(() => {
    if (descriptionImages.length > 0) {
      setDescIndex(prev => (prev + 1) % descriptionImages.length);
    }
  }, [descriptionImages.length]);

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      if (!product) return;
      e.stopPropagation();

      // Use Flash Sale price if available, otherwise use regular price logic
      const finalPrice = mainUnit.isFlashSale
        ? mainUnit.price
        : typeof product.salePrice === 'number'
          ? product.salePrice
          : product.price;

      addToCart({
        id: String(product.id),
        name: product.name,
        price: finalPrice,
        image: product.image,
        unit: product.unit || '',
        quantity: product.type === 'weight' ? 0 : 1,
        type: product.type,
        weight: product.type === 'weight' ? 1 : undefined,
        // Add Flash Sale info to cart item
        flashSale: mainUnit.isFlashSale
          ? {
              flashSaleId: flashSaleInfo?.flashSaleId,
              isFlashSale: true,
              originalPrice: mainUnit.originalPrice,
              discountPercentage: mainUnit.discountPercentage,
            }
          : undefined,
      });

      // Flying animation
      if (imgRef.current) {
        const clickedElement = imgRef.current;
        const rect = clickedElement.getBoundingClientRect();
        const cartIcon = document.getElementById('cart-fly-icon');
        if (cartIcon) {
          const cartRect = cartIcon.getBoundingClientRect();
          const flyingEl = document.createElement('div');
          flyingEl.style.cssText = `
          position: fixed;
          left: ${rect.left + rect.width / 2}px;
          top: ${rect.top + rect.height / 2}px;
          transform: translate(-50%, -50%);
          z-index: 9999;
          transition: all 0.8s cubic-bezier(.4,1.6,.6,1);
          pointer-events: none;
        `;
          flyingEl.innerHTML = `
          <div style="background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); padding: 4px; border: 2px solid #10b981;">
            <img src="${product.image}" alt="${product.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;" />
          </div>
        `;
          document.body.appendChild(flyingEl);
          requestAnimationFrame(() => {
            flyingEl.style.left = `${cartRect.left + cartRect.width / 2}px`;
            flyingEl.style.top = `${cartRect.top + cartRect.height / 2}px`;
            flyingEl.style.transform = 'translate(-50%, -50%) scale(0.3)';
            flyingEl.style.opacity = '0';
          });
          setTimeout(() => {
            document.body.removeChild(flyingEl);
          }, 800);
        }
      }
    },
    [product, addToCart, mainUnit, flashSaleInfo]
  );

  const handleAddToCartRelated = useCallback(
    (e: React.MouseEvent, item: any) => {
      e.stopPropagation();
      // Truyền đúng dữ liệu cho backend
      addToCart({
        id: item.id || item._id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.type === 'count' ? 1 : 0,
        weight: item.type === 'weight' ? 1 : 0,
        unit: item.unit,
        type: item.type,
      });
    },
    [addToCart]
  );

  // 7. Conditional rendering ONLY after all hooks
  if (!product) {
    return <div className="p-6 text-center text-red-600 text-xl">Không tìm thấy sản phẩm.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200">
      {/* Banner Manager */}
      <BannerManager page="product" categoryId={product?.category} />

      <div className={`max-w-7xl mx-auto px-2 sm:px-4 ${isMobile ? 'py-4' : 'py-6 lg:py-10'}`}>
        <div
          className={`${isMobile ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10'} items-start mb-8 lg:mb-16`}
        >
          {/* Product Image */}
          <div className={`bg-white ${isMobile ? 'p-3' : 'p-6'} rounded-2xl shadow-2xl`}>
            <img
              ref={imgRef}
              src={mainImage || product.image}
              alt={product.name}
              className={`w-full ${isMobile ? 'h-[300px]' : 'h-[500px]'} object-contain rounded-xl mb-4 bg-gray-50`}
            />

            {/* Image Gallery */}
            {descriptionImages.length > 0 && (
              <div
                className={`flex items-center gap-2 justify-center mt-2 ${isMobile ? 'overflow-x-auto pb-2' : ''}`}
              >
                <button
                  onClick={handlePrev}
                  className={`${isMobile ? 'p-1.5' : 'p-2'} bg-gray-200 rounded-full hover:bg-green-500 hover:text-white transition-all flex-shrink-0`}
                >
                  <FaChevronLeft size={isMobile ? 12 : 16} />
                </button>

                <div className={`flex gap-2 ${isMobile ? 'overflow-x-auto' : ''}`}>
                  {descriptionImages.map((img: string, idx: number) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Mô tả ${idx + 1}`}
                      className={`${isMobile ? 'w-14 h-14' : 'w-20 h-20'} object-cover rounded-lg border-2 cursor-pointer flex-shrink-0 ${
                        descIndex === idx ? 'border-green-600' : 'border-gray-200'
                      }`}
                      onClick={() => {
                        setDescIndex(idx);
                        setMainImage(img);
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  className={`${isMobile ? 'p-1.5' : 'p-2'} bg-gray-200 rounded-full hover:bg-green-500 hover:text-white transition-all flex-shrink-0`}
                >
                  <FaChevronRight size={isMobile ? 12 : 16} />
                </button>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className={`bg-white ${isMobile ? 'p-4' : 'p-8'} rounded-2xl shadow-2xl`}>
            <h1 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-gray-800 mb-4`}>
              {product.name}
            </h1>

            {/* Flash Sale Badge */}
            {mainUnit.isFlashSale && (
              <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                    FLASH SALE -{mainUnit.discountPercentage}%
                  </span>
                  <span className="text-red-600 text-sm font-medium">
                    Kết thúc: {new Date(mainUnit.endTime!).toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>
            )}

            {/* Price Display */}
            <div className="mb-4">
              {mainUnit.isFlashSale ? (
                <div className={`flex items-center ${isMobile ? 'flex-col gap-1' : 'gap-3'}`}>
                  <span className={`${isMobile ? 'text-2xl' : 'text-3xl'} text-red-600 font-bold`}>
                    {mainUnit.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                  </span>
                  <span
                    className={`${isMobile ? 'text-base' : 'text-lg'} text-gray-400 line-through`}
                  >
                    {mainUnit.originalPrice.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    })}
                  </span>
                </div>
              ) : (
                <span
                  className={`${isMobile ? 'text-xl' : 'text-2xl'} text-green-600 font-semibold`}
                >
                  {mainUnit.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </span>
              )}
            </div>

            <div
              className={`flex items-center mb-6 ${isMobile ? 'text-xs flex-col gap-2' : 'text-sm space-x-4'} text-gray-600`}
            >
              <span className="flex items-center">
                <FaCheckCircle className="text-green-500 mr-1" size={isMobile ? 12 : 16} /> Còn hàng
              </span>
              <span className="flex items-center">
                <FaCheckCircle className="text-green-500 mr-1" size={isMobile ? 12 : 16} /> Giao
                hàng 2h
              </span>
              <span className="flex items-center">
                <FaCheckCircle className="text-green-500 mr-1" size={isMobile ? 12 : 16} /> Đổi trả
                7 ngày
              </span>
            </div>

            <p className={`text-gray-700 leading-relaxed mb-6 ${isMobile ? 'text-sm' : ''}`}>
              Sản phẩm được chọn lọc từ những nguyên liệu tươi ngon, đảm bảo chất lượng và an toàn
              cho sức khỏe. Hương vị tự nhiên, giàu dinh dưỡng, phù hợp cho mọi bữa ăn trong ngày.
              Hãy trải nghiệm sự tiện lợi và tươi ngon ngay tại nhà bạn.
            </p>

            {/* Không còn selector số lượng cho sản phẩm kg */}

            <button
              className={`bg-green-600 hover:bg-green-700 text-white ${isMobile ? 'text-base px-4 py-2.5' : 'text-lg px-6 py-3'} font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center w-full`}
              onClick={handleAddToCart}
            >
              <FaShoppingCart className="mr-2" size={isMobile ? 16 : 20} /> Thêm vào giỏ hàng
            </button>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className={`max-w-6xl mx-auto mb-16 ${isMobile ? 'px-2' : ''}`}>
            <h2
              className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-gray-800 mb-6 text-center`}
            >
              Sản phẩm liên quan
            </h2>
            <div
              className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'}`}
            >
              {relatedProducts.slice(0, 4).map(item => (
                <div
                  key={item.id}
                  className={`bg-white ${isMobile ? 'p-2' : 'p-4'} rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300`}
                >
                  <Link to={`/productdetail/${item.id}`}>
                    <img
                      ref={
                        imgRefs.current[Number(item.id)] ||
                        (imgRefs.current[Number(item.id)] = React.createRef<HTMLImageElement>())
                      }
                      src={item.image}
                      alt={item.name}
                      className={`w-full ${isMobile ? 'h-24' : 'h-40'} object-cover rounded-lg mb-2`}
                    />
                  </Link>
                  <h4
                    className={`${isMobile ? 'text-sm' : 'text-lg'} font-medium text-gray-800 mb-2 ${isMobile ? 'line-clamp-2' : ''}`}
                  >
                    {item.name}
                  </h4>
                  <p className={`text-green-600 font-semibold mb-2 ${isMobile ? 'text-xs' : ''}`}>
                    {item.price}
                  </p>
                  <button
                    onClick={e => handleAddToCartRelated(e, item)}
                    className={`w-full bg-green-600 text-white ${isMobile ? 'px-2 py-1.5 text-xs' : 'px-4 py-2'} rounded-md hover:bg-green-700 transition-all duration-300 flex items-center justify-center`}
                  >
                    <FaShoppingCart className="mr-1" size={isMobile ? 12 : 16} />
                    {isMobile ? 'Thêm' : 'Thêm vào giỏ'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product Details with Tabs */}
        <ProductDetailDisplay product={product} className="mt-8" />
      </div>
    </div>
  );
};

export default React.memo(ProductDetailPage);
