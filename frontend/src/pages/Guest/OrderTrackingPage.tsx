
import OrderSummary from "../../components/Guest/myOrder/OrderSummary";
import OrderItems from "../../components/Guest/myOrder/OrderItems";
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import orderService from '../../services/orderService';
import { tokenManager } from '../../services/api';

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
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('Không tìm thấy mã đơn hàng');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Check if user is logged in
        if (!tokenManager.exists()) {
          console.log('No auth token, checking localStorage for order');
          // Try localStorage first for non-authenticated users
          const stored = localStorage.getItem('orders');
          if (stored) {
            const orders = JSON.parse(stored);
            const foundOrder = orders.find((o: Order) => o.id === orderId);
            if (foundOrder) {
              setOrder(foundOrder);
              setLoading(false);
              return;
            }
          }
          setError('Đơn hàng không tồn tại hoặc bạn cần đăng nhập để xem chi tiết');
          setLoading(false);
          return;
        }

        const orderData = await orderService.getOrder(orderId);
        
        // Convert to legacy format using any type to handle backend data structure
        const convertedOrder: Order = {
          id: orderData._id,
          status: getStatusText(orderData.status),
          date: new Date(orderData.createdAt).toLocaleDateString('vi-VN'),
          items: orderData.items.map((item: any) => ({
            name: item.productName || item.name || 'Sản phẩm',
            price: item.price,
            oldPrice: item.price,
            quantity: item.quantity,
            image: item.image || '',
            variant: ''
          })),
          deliveryFee: (orderData as any).deliveryFee || 0,
          payWith: getPaymentMethodText(orderData.paymentMethod),
          deliveryAddress: (orderData as any).customerAddress || 'Chưa có địa chỉ'
        };
        
        setOrder(convertedOrder);
      } catch (err: any) {
        console.error('Failed to fetch order:', err);
        
        // Handle authentication errors specially
        if (err.message && err.message.includes('Unauthorized')) {
          setError('Bạn cần đăng nhập để xem chi tiết đơn hàng');
          
          // Try localStorage as fallback
          const stored = localStorage.getItem('orders');
          if (stored) {
            const orders = JSON.parse(stored);
            const foundOrder = orders.find((o: Order) => o.id === orderId);
            if (foundOrder) {
              setOrder(foundOrder);
              setError(null);
              setLoading(false);
              return;
            }
          }
        } else {
          setError('Không thể tải thông tin đơn hàng');
          
          // Fallback to localStorage
          const stored = localStorage.getItem('orders');
          if (stored) {
            const orders = JSON.parse(stored);
            const foundOrder = orders.find((o: Order) => o.id === orderId);
            if (foundOrder) {
              setOrder(foundOrder);
              setError(null);
            }
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: 'Chờ xác nhận',
      confirmed: 'Chờ giao hàng', 
      preparing: 'Chờ giao hàng',
      shipping: 'Chờ giao hàng',
      delivered: 'Hoàn thành',
      cancelled: 'Đã hủy',
      returned: 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  const getPaymentMethodText = (method: string) => {
    const methodMap: { [key: string]: string } = {
      cod: 'Tiền mặt',
      bank_transfer: 'Chuyển khoản',
      momo: 'MoMo',
      zalopay: 'ZaloPay',
      vnpay: 'VNPay',
      credit_card: 'Thẻ tín dụng',
      shopeepay: 'ShopeePay'
    };
    return methodMap[method] || method;
  };

  if (loading) {
    return (
      <div className="p-4 max-w-5xl mx-auto">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-4 max-w-5xl mx-auto">
        <div className="text-center py-16">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy đơn hàng</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/myorder" 
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors"
            >
              Quay lại danh sách đơn hàng
            </Link>
            {error && error.includes('đăng nhập') && (
              <Link 
                to="/login" 
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const { id, status, date, items, deliveryFee, payWith, deliveryAddress } = order;
  const total = items.reduce((sum: number, item: OrderItem) => sum + item.price * item.quantity, 0) + deliveryFee;

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