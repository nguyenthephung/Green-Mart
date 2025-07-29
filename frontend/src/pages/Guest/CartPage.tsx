
import { useCartStore } from '../../stores/useCartStore';
import { useUserStore } from '../../stores/useUserStore';
import { useEffect, useState } from "react";
import CartSummary from "../../components/Guest/cart/CartSummary";
import MarketInfo from "../../components/Guest/cart/MarketInfo";
import Recommendations from "../../components/Guest/cart/Recommendations";
import CartList from "../../components/Guest/cart/CartList";
import { useProductStore } from '../../stores/useProductStore';
import type { RecommendationItem } from '../../types/RecommendationItem';
import type { CartItem } from '../../types/CartItem';
import { useNavigate } from 'react-router-dom';
import EmptyCart from '../../components/Guest/cart/EmptyCart';
import { districts } from '../../data/Guest/hcm_districts_sample';
import haversine from 'haversine-distance';
import { useVoucherStore } from '../../stores/useVoucherStore';
import ShopeeVoucherModal from '../../components/Guest/cart/ShopeeVoucherModal';

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
  const navigate = useNavigate();
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  
  // Cuộn lên đầu trang khi component được mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchCart();
    fetchVouchers();
  }, [fetchCart, fetchVouchers]);
  


  // Lấy địa chỉ đang chọn
  const selectedAddress = addresses.find(a => a.isSelected) || addresses[0];

  // Hàm lấy lat/lng từ address
  function getLatLngFromAddress(address: any) {
    if (!address) return null;
    const district = districts.find((d) => d.name === address.district);
    const ward = district?.wards.find((w) => w.name === address.ward);
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
    if (product) {
      if (Array.isArray(product.units)) {
        const mainUnit = product.units.find((u: any) => u.type === item.unit) || product.units[0];
        priceNumber = mainUnit.price;
        originalPrice = mainUnit.price;
      } else if (typeof product.price === 'number') {
        priceNumber = product.price;
        originalPrice = product.price;
      }
    }
    // Always include id, unit, and type from the original item
    return {
      ...item,
      id, // luôn là string, đúng productId
      unit: item.unit,
      type: item.type,
      price: priceNumber,
      originalPrice,
    };
  });

  // DEBUG: Log all cartListItems and their id/unit/type values

  const subtotal = cartListItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Tính giảm giá voucher
  let voucherDiscount = 0;
  if (voucher && subtotal >= voucher.minOrder) {
    if (voucher.discountType === 'percent') {
      voucherDiscount = Math.round(subtotal * voucher.discountValue / 100);
      // Không cho giảm quá tổng tiền hàng
      if (voucherDiscount > subtotal) voucherDiscount = subtotal;
    } else {
      // discountValue là số tiền giảm, nhưng không vượt quá subtotal
      voucherDiscount = Math.min(voucher.discountValue, subtotal);
    }
  }

  // Random các sản phẩm không nằm trong giỏ hàng
  function getRandomRelatedProducts(count = 8) {
    // Loại bỏ sản phẩm đã có trong giỏ hàng
    const cartIds = cart.map(i => Number(i.id));
    const available = products.filter(p => !cartIds.includes(Number(p.id)));
    // Map về đúng định dạng RecommendationItem
    const mapped: RecommendationItem[] = available.map(p => {
      let price = 0;
      if (Array.isArray(p.units)) {
        price = p.units[0]?.price || 0;
      } else if (typeof p.price === 'number') {
        price = p.price;
      }
      return {
        id: Number(p.id),
        name: p.name,
        image: p.image,
        price,
        originalPrice: Math.round(price * 1.15), // giả sử giảm giá 15%
        stock: Math.floor(Math.random() * 10) + 1,
      };
    });
    // Xáo trộn random
    for (let i = mapped.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [mapped[i], mapped[j]] = [mapped[j], mapped[i]];
    }
    return mapped.slice(0, count);
  }
  const relatedItems = getRandomRelatedProducts(8);

  if (loading) {
    return (
      <div className="bg-gradient-app-main min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
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
    <div className="bg-gradient-app-main min-h-screen">
      {/* Hero Section */}
      <div className="pt-0 pb-2">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-app-primary mb-2">
              🛒 Giỏ hàng của bạn
            </h1>
            <p className="text-lg text-app-secondary">
              {cart.length} sản phẩm đã chọn • Tổng: {subtotal.toLocaleString()} ₫
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-8 pb-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <MarketInfo />
          <CartList
            items={cartListItems}
            onQuantityChange={(id, value, unit, type) => {
              updateQuantity(String(id), value, unit, type);
            }}
            onRemove={(id, unit, type) => {
              if (!id || id === 'undefined') {
                console.warn('[CartPage] Tried to remove cart item with undefined id:', { id, unit, type });
                alert('Không thể xóa sản phẩm: ID không hợp lệ.');
                return;
              }
              console.log('[CartPage] removeFromCart called:', { id, unit, type });
              removeFromCart(String(id), unit, type)
                .then(() => {
                  console.log('[CartPage] removeFromCart success');
                })
                .catch((err) => {
                  console.error('[CartPage] removeFromCart error:', err);
                  alert('Lỗi xóa sản phẩm: ' + (err?.message || err));
                });
            }}
          />
          <Recommendations items={relatedItems} />
        </div>
        <div className="space-y-6">
          {/* Voucher Selection Card */}
          <div className="bg-app-card rounded-2xl shadow-lg p-6 border border-green-100">
            <h3 className="text-lg font-semibold text-app-primary mb-4 flex items-center gap-2">
              🎫 Mã giảm giá
            </h3>
            <div className="flex items-center gap-3">
              {voucher ? (
                <div className="flex-1 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-green-700">{voucher.code}</span>
                      <p className="text-sm text-green-600">{voucher.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        className="text-blue-600 text-sm hover:text-blue-700 font-medium transition" 
                        onClick={() => setShowVoucherModal(true)}
                      >
                        Đổi
                      </button>
                      <button 
                        className="text-red-500 text-sm hover:text-red-600 font-medium transition" 
                        onClick={() => setVoucher(null)}
                      >
                        Bỏ
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button 
                  className="flex-1 p-4 border-2 border-dashed border-green-300 rounded-xl text-green-600 hover:border-green-400 hover:bg-green-50 transition duration-200 flex items-center justify-center gap-2" 
                  onClick={() => setShowVoucherModal(true)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Chọn mã giảm giá
                </button>
              )}
            </div>
          </div>

          <ShopeeVoucherModal
            open={showVoucherModal}
            vouchers={vouchers}
            selectedVoucher={voucher}
            onSelect={(v) => {
              if (!v) { setVoucher(null); setShowVoucherModal(false); return; }
              // Remove id field if present to match User.Voucher type
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

          {/* Cart Summary Card */}
          <CartSummary
            itemsTotal={subtotal}
            deliveryFee={dynamicDeliveryFee}
            voucherDiscount={voucherDiscount}
            voucher={voucher}
            onRemoveVoucher={() => setVoucher(null)}
            address={selectedAddress ? {
              district: selectedAddress.district || '',
              ward: selectedAddress.wardName || selectedAddress.ward || '',
              fullName: selectedAddress.fullName,
              phone: typeof selectedAddress.phone === 'string' ? selectedAddress.phone : '',
            } : undefined}
          />

          {/* Checkout Button */}
          <button
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 px-6 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-3"
            disabled={cart.length === 0}
            onClick={() => navigate('/checkout')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5H4M7 13l-2.293 2.293c-.39.39-.39 1.02 0 1.41L6.4 18H20M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
            Tiến hành thanh toán
            <span className="bg-emerald-500/30 px-3 py-1 rounded-full text-sm text-white">
              {(subtotal + dynamicDeliveryFee - voucherDiscount).toLocaleString()} ₫
            </span>
          </button>
        </div>
      </main>
    </div>
    {/* <Footer /> */}
    </>
  );
}