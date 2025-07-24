
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
      <Link 
        to="/myorder"  
        className="text-sm text-brand-green hover:text-brand-green/80 hover:underline flex items-center gap-2 mb-4 bg-app-card px-4 py-2 rounded-lg border-app-border hover:bg-app-secondary transition-all duration-200" 
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Quay lại danh sách đơn hàng
      </Link>
      
      <div className="bg-app-card rounded-xl shadow-lg p-6 mb-6 border-app-border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
          <div className="flex items-center gap-3">
            <span className={`text-sm font-bold px-4 py-2 rounded-full border-2 ${
              status === 'Hoàn thành' ? 'text-green-600 border-green-500 bg-green-50' : 
              status === 'Đã hủy' ? 'text-red-600 border-red-500 bg-red-50' : 
              status === 'Chờ giao hàng' ? 'text-orange-600 border-orange-500 bg-orange-50' : 
              'text-app-secondary border-app-border bg-app-secondary'
            }`}>
              {status}
            </span>
            <div>
              <span className="text-xs text-app-muted">Mã đơn hàng:</span>
              <span className="text-sm font-bold text-app-primary ml-1">#{id}</span>
            </div>
          </div>
          <div className="text-xs text-app-muted">
            <span className="font-medium">Ngày đặt:</span> {date}
          </div>
        </div>
        
        <div className="bg-brand-green/5 rounded-lg p-4 border border-brand-green/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <span className="text-brand-green font-semibold text-sm">
                Đơn hàng đã rời kho phân loại tới HCM Mega SOC
              </span>
              <div className="text-xs text-brand-green/80 mt-1">
                Dự kiến giao hàng trong 1-2 ngày
              </div>
            </div>
            <span className="ml-auto px-3 py-1 bg-orange-100 text-orange-700 font-bold text-xs rounded-full border border-orange-200">
              CHỜ GIAO HÀNG
            </span>
          </div>
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
          <div className="mt-6 p-4 bg-app-card rounded-lg border-app-border">
            <div className="flex justify-between items-center">
              <span className="text-app-secondary text-sm font-medium">Thành tiền:</span>
              <span className="text-2xl font-bold text-brand-green">{total.toLocaleString()}₫</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}