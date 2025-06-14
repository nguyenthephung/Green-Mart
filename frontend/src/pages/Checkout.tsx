import Header from '../components/Header';
import Footer from '../components/Footer';
import CheckoutMain from '../components/CheckoutMain';
import { checkoutOrderItems } from '../data/checkoutOrderItems';
import CheckoutSummary from '../components/CheckoutSummary';

const Checkout = () => {
  return (
  <div className="bg-gray-50 min-h-screen flex flex-col">
    <Header />

    <main className="w-full px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow">
      <div className="lg:col-span-2">
        <CheckoutMain items={checkoutOrderItems} />
      </div>
      <div className="self-start">
        <CheckoutSummary />
      </div>
    </main>

    <Footer />
  </div>
);

};

export default Checkout;
