interface Item {
  name: string;
  price: number;
  oldPrice: number;
  quantity: number;
  image: string;
}

interface OrderSummaryProps {
  id: string;
  items: Item[];
  deliveryFee: number;
  payWith: string;
  deliveryAddress: string;
}

export default function OrderSummary({ id, items, deliveryFee, payWith, deliveryAddress }: OrderSummaryProps) {
  // Tính tổng giá trị các sản phẩm
  const subtotal = items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  // Tổng cuối cùng = subtotal + phí giao hàng
  const total = subtotal + deliveryFee;

  return (
    <div className="bg-white rounded-xl p-4 space-y-4 text-sm">
      <div>
        <div className="font-semibold">Order Number</div>
        <div className="text-pink-600">#{id}</div>
      </div>
      
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      
      <div className="flex justify-between">
        <span>Delivery Fees</span>
        <span>${deliveryFee.toFixed(2)}</span>
      </div>
      
      <div className="flex justify-between font-bold border-t pt-2">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
      
      <div>
        <div className="font-semibold">Pay With</div>
        <div className="text-purple-700">{payWith}</div>
      </div>
      
      <div>
        <div className="font-semibold">Delivery Address</div>
        <div className="text-pink-600">{deliveryAddress}</div>
      </div>
    </div>
  );
}