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
  const subtotal = items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  const total = subtotal + deliveryFee;
  return (
    <div className="bg-white rounded-2xl p-6 space-y-4 text-base shadow-[0_4px_24px_rgba(17,17,17,0.10),0_1.5px_8px_rgba(0,0,0,0.08)] border border-gray-100">
      <div>
        <div className="font-extrabold text-gray-900 text-lg">Mã đơn hàng</div>
        <div className="text-gray-800 text-xl font-extrabold drop-shadow-[0_2px_2px_rgba(17,17,17,0.10)]">#{id}</div>
      </div>
      <div className="flex justify-between">
        <span className="font-semibold">Tạm tính</span>
        <span className="font-bold text-gray-800">{subtotal.toLocaleString()}₫</span>
      </div>
      <div className="flex justify-between">
        <span className="font-semibold">Phí giao hàng</span>
        <span className="font-bold text-gray-800">{deliveryFee.toLocaleString()}₫</span>
      </div>
      <div className="flex justify-between font-extrabold border-t pt-2 text-lg">
        <span>Tổng cộng</span>
        <span className="text-gray-900">{total.toLocaleString()}₫</span>
      </div>
      <div>
        <div className="font-semibold">Thanh toán bằng</div>
        <div className="text-gray-700 font-bold">{payWith}</div>
      </div>
      <div>
        <div className="font-semibold">Địa chỉ nhận hàng</div>
        <div className="text-gray-900 font-bold">{deliveryAddress}</div>
      </div>
    </div>
  );
}