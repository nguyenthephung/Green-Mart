import { useEffect, useState } from 'react';
import Header from '../../components/Guest/Header';
// import Footer from '../../components/Guest/Footer'; // Remove Footer import
import CheckoutMain from '../../components/Guest/checkout/CheckoutMain';
import { useCart } from '../../reduxSlice/CartContext';
import { useUser } from '../../reduxSlice/UserContext';
import CheckoutSummary from '../../components/Guest/checkout/CheckoutSummary';

const Checkout = () => {
  const { cart } = useCart();
  const { userInfo, addresses, payments, setPayments } = useUser();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  // Map cart context sang định dạng cần cho CheckoutMain
  const checkoutItems = cart.map(item => ({
    id: item.id,
    name: item.name,
    image: item.image,
    quantity: item.quantity,
  }));

  // Lấy địa chỉ và payment đang chọn
  const selectedAddress = addresses.find(a => a.isSelected) || addresses[0];
  const selectedPayment = payments.find(p => p.isSelected) || payments[0];
  const [currentPayment, setCurrentPayment] = useState(selectedPayment);

  // Hàm nhận payment method từ CheckoutMain
  const handlePaymentChange = (method: string) => {
    // Cập nhật vào context nếu muốn đồng bộ toàn app
    if (setPayments && payments && payments.length > 0) {
      setPayments(payments.map(p => ({ ...p, isSelected: p.method === method })));
    }
    setCurrentPayment({ ...selectedPayment, method });
  };

  return (
  <div className="bg-gray-50 min-h-screen flex flex-col">
    <Header />
    <main className="w-full px-8 py-8 pt-[104px] md:pt-[88px] lg:pt-[80px] grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow">
      <div className="lg:col-span-2">
        <CheckoutMain
          items={checkoutItems}
          userInfo={userInfo}
          address={selectedAddress}
          payment={currentPayment}
          onPaymentChange={handlePaymentChange}
        />
      </div>
      <div className="self-start">
        <CheckoutSummary cart={cart} address={selectedAddress} payment={currentPayment} userInfo={userInfo} />
      </div>
    </main>
    {/* <Footer /> */}
  </div>
);

};

export default Checkout;
