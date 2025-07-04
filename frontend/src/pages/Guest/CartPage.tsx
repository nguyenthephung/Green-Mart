import { useState } from "react";
import Header from '../../components/Guest/Header';
import Footer from '../../components/Guest/Footer';
import CartSummary from "../../components/Guest/cart/CartSummary";
import MarketInfo from "../../components/Guest/cart/MarketInfo";
import Recommendations from "../../components/Guest/cart/Recommendations";
import CartList from "../../components/Guest/cart/CartList";
import { cartItems as initialItems } from "../../data/Guest/cart";
import { recommendations as recommendedItems } from "../../data/Guest/recommendations";

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialItems);
  const deliveryFee = 50000;

  const updateQuantity = (id: number, newQuantity: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <>
    <Header />
    <div className="bg-gray-50 min-h-screen">
      <main className="w-full px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <MarketInfo />
          <CartList
            items={cartItems}
            onQuantityChange={updateQuantity}
            onRemove={removeItem}
          />
          <Recommendations items={recommendedItems} />
        </div>
        <div className="self-start">
          <CartSummary itemsTotal={subtotal} deliveryFee={deliveryFee} />
        </div>
      </main>
    </div>
    <Footer />
    </>

  );
}
