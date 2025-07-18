
import OrderSummary from "../../components/Guest/myOrder/OrderSummary";
import OrderItems from "../../components/Guest/myOrder/OrderItems";
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface OrderItem {
  name: string;
  price: number;
  oldPrice: number;
  quantity: number;
  image: string;
  variant?: string;
}

interface Order {
  id: string;
  status: string;
  date: string;
  items: OrderItem[];
  deliveryFee: number;
  payWith: string;
  deliveryAddress: string;
}

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('orders');
    setOrders(stored ? JSON.parse(stored) : []);
  }, []);

  const currentOrder = orderId
    ? orders.find(order => order.id === orderId) || orders[0]
    : orders[0];

  if (!currentOrder) return <div className="p-4">Không tìm thấy đơn hàng.</div>;

  const { id, status, date, items, deliveryFee, payWith, deliveryAddress } = currentOrder;
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0) + deliveryFee;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <Link to="/myorder"  className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-2" >
        <span className="text-lg">←</span> Quay lại danh sách đơn hàng
      </Link>
      <div className="bg-white rounded-xl shadow p-6 mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-2">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold px-3 py-1 rounded-full border ${status === 'Hoàn thành' ? 'text-green-600 border-green-600' : status === 'Đã hủy' ? 'text-red-600 border-red-600' : status === 'Chờ giao hàng' ? 'text-orange-600 border-orange-600' : 'text-gray-700 border-gray-300'} bg-white`}>{status}</span>
            <span className="text-xs text-gray-400 ml-2">Mã đơn hàng: <b>{id}</b></span>
          </div>
          <div className="text-xs text-gray-400">Ngày đặt: {date}</div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-green-700 font-semibold flex items-center gap-1">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M7 17l5-5 5 5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Đơn hàng đã rời kho phân loại tới HCM Mega SOC
          </span>
          <span className="ml-3 text-orange-600 font-bold">CHỜ GIAO HÀNG</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <OrderItems items={items} />
        </div>
        <div>
          <OrderSummary
            id={id}
            items={items}
            deliveryFee={deliveryFee}
            payWith={payWith}
            deliveryAddress={deliveryAddress}
          />
          <div className="mt-4 text-right">
            <span className="text-gray-500 text-sm">Thành tiền:</span>
            <span className="text-2xl font-bold text-orange-600 ml-2">{total.toLocaleString()}₫</span>
          </div>
        </div>
      </div>
    </div>
  );
}