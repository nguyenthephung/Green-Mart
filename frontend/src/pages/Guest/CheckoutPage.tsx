import { useEffect, useState } from 'react';
import Header from '../../components/Guest/Header';
// import Footer from '../../components/Guest/Footer'; // Remove Footer import
import CheckoutMain from '../../components/Guest/checkout/CheckoutMain';
import { useCart } from '../../reduxSlice/CartContext';
import { useUser } from '../../reduxSlice/UserContext';
import CheckoutSummary from '../../components/Guest/checkout/CheckoutSummary';
import { vouchers } from '../../data/Guest/vouchers';
import ShopeeVoucherModal from '../../components/Guest/cart/ShopeeVoucherModal';

const Checkout = () => {
  const { cart } = useCart();
  const { userInfo, addresses, payments, setPayments, voucher, setVoucher } = useUser();
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
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Header />
      <main className="w-full px-8 py-8 pt-[104px] md:pt-[88px] lg:pt-[80px] grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow">
        <div className="lg:col-span-2">
          <CheckoutMain
            items={checkoutItems}
            userInfo={userInfo}
            address={selectedAddress}
            payments={payments}
            onPaymentChange={handlePaymentChange}
          />
        </div>
        <div className="self-start">
          {/* Nút chọn voucher ngay tại đây */}
          <div className="mb-4 flex items-center gap-2">
            <span>Mã giảm giá:</span>
            {voucher ? (
              <>
                <span className="text-green-700">{voucher.code}</span>
                <button className="text-blue-600 underline" onClick={() => setShowVoucherModal(true)}>
                  Đổi mã
                </button>
                <button className="text-red-500 ml-2" onClick={() => setVoucher(null)}>
                  Bỏ
                </button>
              </>
            ) : (
              <button className="text-blue-600 underline" onClick={() => setShowVoucherModal(true)}>
                Chọn mã giảm giá
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
          <CheckoutSummary
            cart={cart}
            address={selectedAddress}
            payments={payments}
            userInfo={userInfo}
            voucherDiscount={voucherDiscount}
            voucher={voucher ? { 
              discount: voucher.discountValue ?? 0, 
              ...voucher 
            } : null}
            onRemoveVoucher={() => setVoucher(null)}
            onShowVoucherModal={() => setShowVoucherModal(true)}
          />
        </div>
      </main>
      {/* <Footer /> */}
    </div>
  );
};

export default Checkout;
