import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Guest/Header';
// import Footer from '../../components/Guest/Footer'; // Remove Footer import
import CheckoutMain from '../../components/Guest/checkout/CheckoutMain';
import { useCartStore } from '../../stores/useCartStore';
import { useUserStore } from '../../stores/useUserStore';
import CheckoutSummary from '../../components/Guest/checkout/CheckoutSummary';
import { vouchers } from '../../data/Guest/vouchers';
import ShopeeVoucherModal from '../../components/Guest/cart/ShopeeVoucherModal';

const Checkout = () => {
  const navigate = useNavigate();
  const cart = useCartStore(state => state.items);
  const user = useUserStore(state => state.user);
  const isAuthenticated = useUserStore(state => state.isAuthenticated);
  const userInfo = useUserStore(state => state.userInfo);
  const addresses = useUserStore(state => state.addresses);
  const payments = useUserStore(state => state.payments);
  const setPayments = useUserStore(state => state.setPayments);
  const voucher = useUserStore(state => state.voucher);
  const setVoucher = useUserStore(state => state.setVoucher);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    // Nếu chưa có payment nào được chọn, mặc định chọn COD (nếu có)
    if (payments && payments.length > 0 && !payments.some(p => p.isSelected)) {
      const cod = payments.find(p => p.method === 'cod');
      if (cod && setPayments) {
        setPayments(payments.map(p => ({ ...p, isSelected: p.method === 'cod' })));
      } else if (setPayments) {
        setPayments(payments.map((p, i) => ({ ...p, isSelected: i === 0 })));
      }
    }
  }, []);

  // Map cart context sang định dạng cần cho CheckoutMain
  const checkoutItems = cart.map(item => ({
    id: item.id,
    name: item.name,
    image: item.image,
    quantity: item.quantity,
  }));

  // Lấy địa chỉ và payment đang chọn trực tiếp từ context
  const selectedAddress = addresses.find(a => a.isSelected) || addresses[0];

  // Kiểm tra điều kiện để checkout
  const canCheckout = isAuthenticated && user && addresses.length > 0;
  const userDisplayInfo = userInfo || (user ? {
    fullName: user.name || '',
    phone: user.phone || '',
    email: user.email || '',
    avatar: user.avatar || ''
  } : null);

  // Hàm nhận payment method từ CheckoutMain
  const handlePaymentChange = (method: string) => {
    if (setPayments && payments && payments.length > 0) {
      setPayments(payments.map(p => ({ ...p, isSelected: p.method === method })));
    }
  };

  // Tính tổng tiền hàng
  const subtotal = cart.reduce((sum, item) => {
    const price = typeof item.price === 'string' ? parseInt(item.price.replace(/\D/g, "")) : item.price || 0;
    return sum + price * item.quantity;
  }, 0);

  // Tính giảm giá voucher
  let voucherDiscount = 0;
  if (voucher && subtotal >= voucher.minOrder) {
    if (voucher.discountType === 'percent') {
      voucherDiscount = Math.round(subtotal * voucher.discountValue / 100);
    } else {
      voucherDiscount = voucher.discountValue;
    }
    if (voucherDiscount > subtotal) voucherDiscount = subtotal;
  }

  return (
    <div className="bg-gradient-app-main min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <div className="pt-[104px] md:pt-[88px] lg:pt-[80px] pb-8">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center py-8">
            <h1 className="text-4xl font-bold text-app-primary mb-2">
              💳 Thanh toán đơn hàng
            </h1>
            <p className="text-lg text-app-secondary">
              {cart.length} sản phẩm • Tổng tiền: {subtotal.toLocaleString()} ₫
              {!isAuthenticated && (
                <span className="block text-orange-600 text-base mt-2">
                  ⚠️ Vui lòng đăng nhập để hoàn tất đặt hàng
                </span>
              )}
              {isAuthenticated && addresses.length === 0 && (
                <span className="block text-red-600 text-base mt-2">
                  ⚠️ Vui lòng thêm địa chỉ giao hàng để tiếp tục
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-8 pb-8 grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow">
        <div className="lg:col-span-2 space-y-6">
          {canCheckout ? (
            <CheckoutMain
              items={checkoutItems}
              userInfo={userDisplayInfo!}
              address={selectedAddress}
              payments={payments}
              onPaymentChange={handlePaymentChange}
            />
          ) : !isAuthenticated ? (
            <div className="bg-app-card rounded-2xl shadow-lg p-8 border border-red-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 13.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-app-primary mb-2">Vui lòng đăng nhập</h3>
                <p className="text-app-secondary mb-6">Bạn cần đăng nhập để tiếp tục thanh toán đơn hàng.</p>
                <div className="flex gap-4 justify-center">
                  <button 
                    className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
                    onClick={() => navigate('/login')}
                  >
                    Đăng nhập
                  </button>
                  <button 
                    className="px-6 py-3 border border-app-border text-app-secondary rounded-xl hover:bg-app-secondary-light transition"
                    onClick={() => navigate('/mycart')}
                  >
                    Quay lại giỏ hàng
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-app-card rounded-2xl shadow-lg p-8 border border-orange-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-app-primary mb-2">Chưa có địa chỉ giao hàng</h3>
                <p className="text-app-secondary mb-6">Bạn cần thêm địa chỉ giao hàng để tiếp tục thanh toán.</p>
                <div className="flex gap-4 justify-center">
                  <button 
                    className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition"
                    onClick={() => navigate('/myaddress')}
                  >
                    Thêm địa chỉ
                  </button>
                  <button 
                    className="px-6 py-3 border border-app-border text-app-secondary rounded-xl hover:bg-app-secondary-light transition"
                    onClick={() => navigate('/mycart')}
                  >
                    Quay lại giỏ hàng
                  </button>
                </div>
              </div>
            </div>
          )}
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
            onSelect={(v) => { setVoucher(v); setShowVoucherModal(false); }}
            onClose={() => setShowVoucherModal(false)}
          />
          
          {/* Checkout Summary */}
          {canCheckout ? (
            <CheckoutSummary
              cart={cart}
              address={selectedAddress}
              payments={payments}
              userInfo={userDisplayInfo}
              voucherDiscount={voucherDiscount}
              voucher={voucher ? { 
                discount: voucher.discountValue ?? 0, 
                ...voucher 
              } : null}
              onRemoveVoucher={() => setVoucher(null)}
              onShowVoucherModal={() => setShowVoucherModal(true)}
            />
          ) : !isAuthenticated ? (
            <div className="bg-app-card rounded-2xl shadow-lg p-6 border border-red-100">
              <h3 className="text-lg font-semibold text-app-primary mb-4 flex items-center gap-2">
                🔒 Chưa đăng nhập
              </h3>
              <p className="text-app-secondary mb-4">
                Vui lòng đăng nhập để xem thông tin đặt hàng và thanh toán.
              </p>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-app-secondary">
                  <span>Tạm tính ({cart.length} sản phẩm)</span>
                  <span className="font-medium text-app-primary">{subtotal.toLocaleString()} ₫</span>
                </div>
                {voucher && voucherDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá ({voucher.code})</span>
                    <span>-{voucherDiscount.toLocaleString()} ₫</span>
                  </div>
                )}
                <div className="border-t border-app-border pt-3 flex justify-between font-semibold text-app-primary">
                  <span>Tạm tính</span>
                  <span>{(subtotal - voucherDiscount).toLocaleString()} ₫</span>
                </div>
                <button
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium transition"
                  onClick={() => navigate('/login')}
                >
                  Đăng nhập để thanh toán
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-app-card rounded-2xl shadow-lg p-6 border border-orange-100">
              <h3 className="text-lg font-semibold text-app-primary mb-4 flex items-center gap-2">
                📍 Chưa có địa chỉ
              </h3>
              <p className="text-app-secondary mb-4">
                Vui lòng thêm địa chỉ giao hàng để tiếp tục thanh toán.
              </p>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-app-secondary">
                  <span>Tạm tính ({cart.length} sản phẩm)</span>
                  <span className="font-medium text-app-primary">{subtotal.toLocaleString()} ₫</span>
                </div>
                {voucher && voucherDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá ({voucher.code})</span>
                    <span>-{voucherDiscount.toLocaleString()} ₫</span>
                  </div>
                )}
                <div className="border-t border-app-border pt-3 flex justify-between font-semibold text-app-primary">
                  <span>Tạm tính</span>
                  <span>{(subtotal - voucherDiscount).toLocaleString()} ₫</span>
                </div>
                <button
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-medium transition"
                  onClick={() => navigate('/myaddress')}
                >
                  Thêm địa chỉ giao hàng
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      {/* <Footer /> */}
    </div>
  );
};

export default Checkout;
