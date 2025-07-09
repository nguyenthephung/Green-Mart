import { useCart } from '../../reduxSlice/CartContext';
import { useEffect, useState } from "react";
import Header from '../../components/Guest/Header';
import CartSummary from "../../components/Guest/cart/CartSummary";
import MarketInfo from "../../components/Guest/cart/MarketInfo";
import Recommendations from "../../components/Guest/cart/Recommendations";
import CartList from "../../components/Guest/cart/CartList";
import { products } from '../../data/Guest/Home';
import { useNavigate } from 'react-router-dom';
import EmptyCart from '../../components/Guest/cart/EmptyCart';
import { useUser } from '../../reduxSlice/UserContext';
import { districts } from '../../data/Guest/hcm_districts_sample';
import haversine from 'haversine-distance';
import { vouchers } from '../../data/Guest/vouchers';
import ShopeeVoucherModal from '../../components/Guest/cart/ShopeeVoucherModal';


export default function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const { addresses, voucher, setVoucher } = useUser();
  const navigate = useNavigate();
  const [showVoucherModal, setShowVoucherModal] = useState(false);

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
  useEffect(() => {
    console.log('Cart context:', cart);
    const cartListItems = cart.map(item => {
      const product = products.find(p => p.id === item.id);
      const priceNumber = parseInt((typeof item.price === 'string' ? item.price : String(item.price)).replace(/\D/g, '')) || 0;
      const originalPrice = product ? parseInt((typeof product.price === 'string' ? product.price : String(product.price)).replace(/\D/g, '')) || priceNumber : priceNumber;
      return {
        ...item,
        price: priceNumber,
        originalPrice,
      };
    });
    console.log('CartListItems:', cartListItems);
  }, [cart]);

  // Map cart context sang CartList type
  const cartListItems = cart.map(item => {
    // Tìm sản phẩm gốc để lấy giá gốc nếu muốn
    const product = products.find(p => p.id === item.id);
    // Chuyển price từ string sang number
    const priceNumber = parseInt((typeof item.price === 'string' ? item.price : String(item.price)).replace(/\D/g, '')) || 0;
    // Nếu có originalPrice thì lấy, không thì lấy price
    const originalPrice = product ? parseInt((typeof product.price === 'string' ? product.price : String(product.price)).replace(/\D/g, '')) || priceNumber : priceNumber;
    return {
      ...item,
      price: priceNumber,
      originalPrice,
    };
  });

  const subtotal = cartListItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Tính giảm giá voucher
  let voucherDiscount = 0;
  if (voucher && subtotal >= voucher.minOrder) {
    if (voucher.discountType === 'percent') {
      voucherDiscount = Math.round(subtotal * voucher.discountValue / 100);
    } else {
      voucherDiscount = voucher.discountValue;
    }
    // Không cho giảm quá tổng tiền hàng
    if (voucherDiscount > subtotal) voucherDiscount = subtotal;
  }

  // Random các sản phẩm không nằm trong giỏ hàng
  function getRandomRelatedProducts(count = 8) {
    // Loại bỏ sản phẩm đã có trong giỏ hàng
    const cartIds = cart.map(i => i.id);
    const available = products.filter(p => !cartIds.includes(p.id));
    // Map về đúng định dạng RecommendationItem
    const mapped = available.map(p => {
      const price = parseInt((p.price || '').replace(/\D/g, '')) || 0;
      return {
        id: p.id,
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

  if (cart.length === 0) {
    return (
      <>
        <Header />
        <div className="bg-gray-50 min-h-screen pt-[104px] md:pt-[88px] lg:pt-[80px]">
          <EmptyCart />
        </div>
        {/* <Footer /> */}
      </>
    );
  }

  return (
    <>
    <Header />
    <div className="bg-gray-50 min-h-screen">
      <main className="w-full px-8 py-8 pt-[104px] md:pt-[88px] lg:pt-[80px] grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <MarketInfo />
          <CartList
            items={cartListItems}
            onQuantityChange={updateQuantity}
            onRemove={removeFromCart}
          />
          <Recommendations items={relatedItems} />
        </div>
        <div className="self-start">
          {/* Nút chọn voucher ngay tại đây */}
          <div className="mb-4 flex items-center gap-2">
            <span>Voucher:</span>
            {voucher ? (
              <>
                <span className="text-green-700">{voucher.code}</span>
                <button className="text-blue-600 underline" onClick={() => setShowVoucherModal(true)}>
                  Đổi voucher
                </button>
                <button className="text-red-500 ml-2" onClick={() => setVoucher(null)}>
                  Bỏ
                </button>
              </>
            ) : (
              <button className="text-blue-600 underline" onClick={() => setShowVoucherModal(true)}>
                Chọn voucher
              </button>
            )}
          </div>
          <ShopeeVoucherModal
            open={showVoucherModal}
            vouchers={vouchers}
            selectedVoucher={voucher}
            onSelect={(v) => { setVoucher(v); setShowVoucherModal(false); }}
            onClose={() => setShowVoucherModal(false)}
          />
          <CartSummary
            itemsTotal={subtotal}
            deliveryFee={dynamicDeliveryFee}
            voucherDiscount={voucherDiscount}
            voucher={voucher}
            onRemoveVoucher={() => setVoucher(null)}
            address={selectedAddress ? { district: selectedAddress?.district, ward: selectedAddress?.wardName } : undefined}
          />
          <button
            className="w-full mt-6 bg-green-700 hover:bg-green-800 text-white py-3 rounded-full font-semibold text-lg shadow-lg transition"
            disabled={cart.length === 0}
            onClick={() => navigate('/checkout')}
          >
            Thanh toán
          </button>
        </div>
      </main>
    </div>
    {/* <Footer /> */}
    </>
  );
}
