import { useCartStore } from '../../stores/useCartStore';
import { useUserStore } from '../../stores/useUserStore';
import { useResponsive } from '../../hooks/useResponsive';
import { useEffect, useState } from 'react';
import CartSummary from '../../components/Guest/cart/CartSummary';
import MarketInfo from '../../components/Guest/cart/MarketInfo';
import SmartRecommendations from '../../components/Guest/cart/SmartRecommendations';
import OptimizedCartList from '../../components/Guest/cart/OptimizedCartList';
import { useProductStore } from '../../stores/useProductStore';
import type { CartItem } from '../../types/CartItem';
import { useNavigate } from 'react-router-dom';
import EmptyCart from '../../components/Guest/cart/EmptyCart';
import { districts } from '../../data/Guest/hcm_districts_sample';
import haversine from 'haversine-distance';
import { useVoucherStore } from '../../stores/useVoucherStore';
import ShopeeVoucherModal from '../../components/Guest/cart/CartVoucherModal';
import GuestVoucherModal from '../../components/Guest/cart/GuestVoucherModal';
import BannerManager from '../../components/Guest/BannerManager';

// Extend AddressInfo locally to match actual usage
type AddressInfo = {
  address: string;
  district?: string;
  ward?: string;
  wardName?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  isSelected?: boolean;
  fullName?: string;
  phone?: string;
};

// Tạm thời comment error handling trong quá trình phát triển
// import { useCartErrorHandling } from '../../components/Error/ErrorHandling';

export default function CartPage() {
  const cart = useCartStore(state => state.items) as CartItem[];
  const loading = useCartStore(state => state.loading);
  const fetchCart = useCartStore(state => state.fetchCart);
  const products = useProductStore(state => state.products) as any[];
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const removeFromCart = useCartStore(state => state.removeFromCart);
  const addresses = useUserStore(state => state.addresses as AddressInfo[]);
  const voucher = useUserStore(state => state.voucher);
  const setVoucher = useUserStore(state => state.setVoucher);
  const vouchers = useVoucherStore(state => state.vouchers);
  const fetchVouchers = useVoucherStore(state => state.fetchVouchers);
  const user = useUserStore(state => state.user);
  const { isMobile } = useResponsive();

  const navigate = useNavigate();
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showGuestVoucherModal, setShowGuestVoucherModal] = useState(false);

  // Function to handle voucher modal display
  const handleShowVoucherModal = () => {
    if (!user) {
      setShowGuestVoucherModal(true);
    } else {
      setShowVoucherModal(true);
    }
  };

  // Filter valid vouchers that user owns and are not expired
  const availableVouchers = vouchers.filter(v => {
    // Check if voucher is active and not expired
    const isActive = v.isActive === true;
    const notExpired = new Date(v.expired) >= new Date();
    const notFullyUsed = !v.maxUsage || v.currentUsage < v.maxUsage;

    // Check if user owns this voucher
    const userOwnsVoucher = user?.vouchers && user.vouchers[v._id] && user.vouchers[v._id] > 0;

    return isActive && notExpired && notFullyUsed && userOwnsVoucher;
  });

  // Cuộn lên đầu trang khi component được mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchCart(true); // Luôn lấy dữ liệu mới nhất từ backend
    fetchVouchers();
  }, [fetchCart, fetchVouchers]);

  // Clear voucher when user becomes guest (not authenticated)
  useEffect(() => {
    if (!user && voucher) {
      setVoucher(null);
    }
  }, [user, voucher, setVoucher]);

  // Clear addresses when user becomes guest (handled by store)

  // Lấy địa chỉ đang chọn
  const selectedAddress = addresses.find(a => a.isSelected) || addresses[0];

  // Hàm lấy lat/lng từ address
  function getLatLngFromAddress(address: any) {
    if (!address) return null;
    const district = districts.find(d => d.name === address.district);
    const ward = district?.wards.find(w => w.name === address.ward);
    if (ward) {
      return { latitude: ward.latitude, longitude: ward.longitude };
    }
    return null;
  }
  // Hàm tính phí ship
  function calculateShippingFee(userCoords: { latitude: number; longitude: number } | null) {
    const STORE_LOCATION = { latitude: 10.754027, longitude: 106.663874 };
    if (!userCoords) return 0;
    const distance = haversine(userCoords, STORE_LOCATION) / 1000; // km
    if (distance <= 3) return 15000;
    if (distance <= 7) return 25000;
    return 35000;
  }
  let dynamicDeliveryFee = 0;
  if (selectedAddress) {
    const coords = getLatLngFromAddress(selectedAddress);
    if (coords) dynamicDeliveryFee = calculateShippingFee(coords);
  }

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  // DEBUG LOG: log mỗi khi cart thay đổi
  // useEffect(() => {
  //   // Debug: log cart context
  // }, [cart]);

  // Map cart context sang CartList type
  const cartListItems = cart.map(item => {
    // Lấy id đúng: ưu tiên productId nếu có, fallback sang id
    const id = String(item.productId || item.id);
    const product = products.find(p => String(p.id) === id);
    let priceNumber = item.price;
    let originalPrice = item.price;
    let category = '';
    // Flash sale ưu tiên cao nhất
    if (item.flashSale?.isFlashSale) {
      priceNumber = item.price;
      originalPrice = item.flashSale.originalPrice || item.price;
      if (product && typeof product.category === 'string') category = product.category;
    } else if (product) {
      // Nếu là sale thường (isSale=true, salePrice < price)
      if (
        product.isSale &&
        typeof product.salePrice === 'number' &&
        product.salePrice < product.price
      ) {
        priceNumber = product.salePrice;
        originalPrice = product.price;
      } else if (Array.isArray(product.units)) {
        const mainUnit = product.units.find((u: any) => u.type === item.unit) || product.units[0];
        priceNumber = mainUnit.price;
        originalPrice = mainUnit.price;
      } else if (typeof product.price === 'number') {
        priceNumber = product.price;
        originalPrice = product.price;
      }
      if (typeof product.category === 'string') category = product.category;
    }
    return {
      ...item,
      id,
      unit: item.unit || '',
      type: item.type,
      price: priceNumber,
      originalPrice,
      category,
    };
  });

  // DEBUG: Log all cartListItems and their id/unit/type values

  const subtotal = cartListItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Tính giảm giá voucher với kiểm tra onlyOn (loại bỏ dấu tiếng Việt, trim, lowercase)
  function normalizeString(str: string) {
    return str
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }
  let voucherDiscount = 0;
  let voucherApplicable = true;
  if (
    voucher &&
    voucher.onlyOn &&
    typeof voucher.onlyOn === 'string' &&
    voucher.onlyOn.trim() !== ''
  ) {
    const onlyOn = normalizeString(voucher.onlyOn);
    voucherApplicable = cartListItems.some(item => {
      if (
        item.category &&
        typeof item.category === 'string' &&
        normalizeString(item.category) === onlyOn
      )
        return true;
      if (item.name && typeof item.name === 'string' && normalizeString(item.name) === onlyOn)
        return true;
      return false;
    });
  }
  if (voucher && subtotal >= voucher.minOrder && voucherApplicable) {
    if (voucher.discountType === 'percent') {
      voucherDiscount = Math.round((subtotal * voucher.discountValue) / 100);
      // Không cho giảm quá tổng tiền hàng
      if (voucherDiscount > subtotal) voucherDiscount = subtotal;
    } else {
      // discountValue là số tiền giảm, nhưng không vượt quá subtotal
      voucherDiscount = Math.min(voucher.discountValue, subtotal);
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-app-main min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg
            className="animate-spin h-10 w-10 text-green-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <span className="text-green-700 font-semibold text-lg">Đang tải giỏ hàng...</span>
        </div>
      </div>
    );
  }
  if (cart.length === 0) {
    return (
      <>
        <div className="bg-gradient-app-main min-h-screen pt-[104px] md:pt-[88px] lg:pt-[80px]">
          <EmptyCart />
        </div>
        {/* <Footer /> */}
      </>
    );
  }

  return (
    <>
      {/* Banner Manager */}
      <BannerManager page="cart" />

      <div className="bg-gradient-app-main min-h-screen">
        {/* Hero Section */}
        <div className={`pt-0 ${isMobile ? 'pb-1' : 'pb-2'}`}>
          <div className={`max-w-7xl mx-auto ${isMobile ? 'px-2 py-4' : 'px-4 py-6'}`}>
            <div className="text-center">
              <h1
                className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-app-primary mb-2`}
              >
                🛒 Giỏ hàng của bạn
              </h1>
              <p className={`${isMobile ? 'text-base' : 'text-lg'} text-app-secondary break-words`}>
                {cart.length} sản phẩm đã chọn
              </p>
            </div>
          </div>
        </div>

        <main
          className={`max-w-7xl mx-auto ${isMobile ? 'px-2 pb-4' : 'px-4 pb-8'} ${isMobile ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-1 lg:grid-cols-3 gap-8'}`}
        >
          <div className={`${isMobile ? 'space-y-4' : 'lg:col-span-2 space-y-6'}`}>
            <MarketInfo />
            <OptimizedCartList
              items={cartListItems}
              onQuantityChange={(id, value, unit, type) => {
                const item = cart.find(
                  cartItem =>
                    String(cartItem.id) === String(id) &&
                    cartItem.unit === unit &&
                    cartItem.type === type
                );
                updateQuantity(String(id), value, unit, type, item?.flashSale);
              }}
              onRemove={(id, unit, type) => {
                if (!id || id === 'undefined') {
                  alert('Không thể xóa sản phẩm: ID không hợp lệ.');
                  return;
                }
                const item = cart.find(
                  cartItem =>
                    String(cartItem.id) === String(id) &&
                    cartItem.unit === unit &&
                    cartItem.type === type
                );
                removeFromCart(String(id), unit, type, item?.flashSale)
                  .then(() => {
                    // ...existing code (đã xóa log)...
                  })
                  .catch(err => {
                    alert('Lỗi xóa sản phẩm: ' + (err?.message || err));
                  });
              }}
            />
            <SmartRecommendations maxItems={8} />
          </div>
          <div className="space-y-6">
            {/* Voucher Selection Card */}
            <div className="bg-app-card rounded-2xl shadow-lg p-6 border border-green-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-green-100 to-transparent rounded-bl-full opacity-50"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-app-primary flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                    </div>
                    Mã giảm giá
                  </h3>
                  {availableVouchers.length > 0 && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      {availableVouchers.length} voucher
                    </span>
                  )}
                </div>

                {voucher ? (
                  <div className="relative">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4 relative overflow-hidden">
                      {/* Decorative elements */}
                      <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>

                      <div className="pr-8">
                        {/* Voucher Code */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white">
                            {voucher.code}
                          </span>
                          <div className="flex-1 h-px bg-green-200" />
                        </div>

                        {/* Description */}
                        <p className="text-sm text-green-700 font-medium mb-3 line-clamp-2">
                          {voucher.description}
                        </p>

                        {/* Discount Info */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-bold text-red-600 bg-red-100 px-3 py-1 rounded-lg">
                            {voucher.discountType === 'percent'
                              ? `Giảm ${voucher.discountValue}%`
                              : `Giảm ${voucher.discountValue.toLocaleString()}₫`}
                          </span>
                          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            Đơn tối thiểu: {voucher.minOrder.toLocaleString()}₫
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2">
                          <button
                            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-1"
                            onClick={handleShowVoucherModal}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                              />
                            </svg>
                            Đổi voucher
                          </button>
                          <button
                            className="px-3 py-2 bg-red-100 text-red-600 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors duration-200 flex items-center justify-center"
                            onClick={() => setVoucher(null)}
                            title="Bỏ voucher"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    className="w-full p-6 border-2 border-dashed border-green-300 rounded-2xl text-green-600 hover:border-green-400 hover:bg-green-50 transition-all duration-200 flex items-center justify-center gap-3 group relative overflow-hidden"
                    onClick={handleShowVoucherModal}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/5 to-emerald-400/5 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                    <div className="relative flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors duration-200">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">Chọn mã giảm giá</div>
                        <div className="text-sm text-green-500">Tiết kiệm hơn cho đơn hàng</div>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Cart Summary Card */}
            <CartSummary
              itemsTotal={subtotal}
              deliveryFee={dynamicDeliveryFee}
              voucherDiscount={voucherDiscount}
              voucher={voucher}
              onRemoveVoucher={() => setVoucher(null)}
              onShowVoucherModal={handleShowVoucherModal}
              address={
                user && selectedAddress
                  ? {
                      district: selectedAddress.district || '',
                      ward: selectedAddress.wardName || selectedAddress.ward || '',
                      fullName: selectedAddress.fullName,
                      phone: typeof selectedAddress.phone === 'string' ? selectedAddress.phone : '',
                    }
                  : undefined
              }
            />

            {/* Checkout Buttons */}
            {user ? (
              <button
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 px-6 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-3"
                disabled={cart.length === 0}
                onClick={async () => {
                  await fetchCart(true);
                  navigate('/checkout');
                }}
              >
                <svg
                  className="w-6 h-6 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5H4M7 13l-2.293 2.293c-.39.39-.39 1.02 0 1.41L6.4 18H20M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z"
                  />
                </svg>
                <span className="min-w-0 flex-1 text-center">Tiến hành thanh toán</span>
                <span className="bg-emerald-500/30 px-3 py-1 rounded-full text-sm text-white flex-shrink-0 break-all">
                  {(subtotal + dynamicDeliveryFee - voucherDiscount).toLocaleString()} ₫
                </span>
              </button>
            ) : (
              <div className="space-y-3">
                <button
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 px-6 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-3"
                  disabled={cart.length === 0}
                  onClick={() => navigate('/guest-checkout')}
                >
                  <svg
                    className="w-6 h-6 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5H4M7 13l-2.293 2.293c-.39.39-.39 1.02 0 1.41L6.4 18H20M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z"
                    />
                  </svg>
                  <span className="min-w-0 flex-1 text-center">Mua ngay (Khách vãng lai)</span>
                  <span className="bg-emerald-500/30 px-3 py-1 rounded-full text-sm text-white flex-shrink-0 break-all">
                    {(subtotal + dynamicDeliveryFee).toLocaleString()} ₫
                  </span>
                </button>

                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    Hoặc đăng nhập để có thêm ưu đãi
                  </p>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-green-600 hover:text-green-700 font-medium text-sm underline"
                  >
                    Đăng nhập ngay
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Voucher Modals */}
        {user ? (
          <ShopeeVoucherModal
            open={showVoucherModal}
            vouchers={availableVouchers}
            selectedVoucher={voucher}
            onSelect={v => {
              if (!v) {
                setVoucher(null);
                setShowVoucherModal(false);
                return;
              }
              // Convert Voucher type to User.Voucher type
              const { id, ...rest } = v as any;
              setVoucher({
                ...rest,
                createdAt: (v as any).createdAt || '',
                updatedAt: (v as any).updatedAt || '',
                currentUsage: (v as any).currentUsage || 0,
                isActive: (v as any).isActive ?? true,
              });
              setShowVoucherModal(false);
            }}
            onClose={() => setShowVoucherModal(false)}
          />
        ) : (
          <GuestVoucherModal
            open={showGuestVoucherModal}
            onClose={() => setShowGuestVoucherModal(false)}
          />
        )}
      </div>
      {/* <Footer /> */}
    </>
  );
}
