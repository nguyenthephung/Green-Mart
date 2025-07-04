import OrderProgress from "../../components/Guest/myOrder/OrderProgress";
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

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <Link to="/myorder"  className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-2" >
        <span className="text-lg">←</span> Quay lại danh sách đơn hàng
      </Link>
      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">Chi tiết đơn hàng</h1>
      <OrderProgress status={status} date={date} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <OrderItems items={items} />
        </div>
        <OrderSummary
          id={id}
          items={items}
          deliveryFee={deliveryFee}
          payWith={payWith}
          deliveryAddress={deliveryAddress}
        />
      </div>
      {status === "Đang xử lý" && (
        <div className="text-center mt-10">
          <p className="mb-2">Bạn có thể hủy đơn hàng trước khi cửa hàng bắt đầu chuẩn bị.</p>
          <button className="border border-gray-700 text-gray-800 px-6 py-2 rounded-full hover:bg-gray-100">
            Hủy đơn hàng
          </button>
        </div>
      )}
    </div>
  );
}