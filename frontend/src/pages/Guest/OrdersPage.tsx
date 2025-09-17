import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import OrderTabs from "../../components/Guest/myOrder/OrderTabs";
import OrderCard from "../../components/Guest/myOrder/OrderCard";
import orderService from '../../services/orderService';
import { useResponsive } from '../../hooks/useResponsive';

interface OrderItem {
  name: string;
  price: number;
  oldPrice: number;
  quantity: number;
  image: string;
  shop?: string;
}

interface Order {
  id: string;
  status: string;
  date: string;
  items: OrderItem[];
  deliveryFee: number;
  payWith: string;
  deliveryAddress: string;
  totalAmount: number; // Add totalAmount field
}

const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderTrackingMap] = useState<Record<string, { status: string; address: string }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Responsive hook
  const { isMobile } = useResponsive();
    // Xử lý khi hủy đơn thành công
    const handleOrderCancelled = (orderId: string) => {
      setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: 'Đã hủy' } : order));
    };

  // Fetch real orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
  // ...existing code (đã xóa log)...
        
  const response = await orderService.getOrderHistory();
        
        if (response.orders) {
          // setRealOrders(response.orders);
          
          // Convert to legacy format for existing components
          const convertedOrders: Order[] = response.orders.map((order: any) => ({
            id: order._id,
            status: getStatusText(order.status),
            date: new Date(order.createdAt || order.orderDate).toLocaleDateString('vi-VN'),
            items: order.items.map((item: any) => ({
              name: item.productName || 'Sản phẩm',
              price: item.price,
              oldPrice: item.price,
              quantity: item.quantity,
              image: item.image || '',
              shop: 'GreenMart'
            })),
            deliveryFee: order.deliveryFee || 0,
            payWith: getPaymentMethodText(order.paymentMethod),
            deliveryAddress: order.customerAddress || 'Chưa có địa chỉ',
            totalAmount: order.totalAmount || 0 // Add totalAmount from backend
          }));
          
          // ...existing code (đã xóa log)...
          setOrders(convertedOrders);
        }
      } catch (err: any) {
  // ...existing code (đã xóa log)...
        setError(`Không thể tải danh sách đơn hàng: ${err.message}`);
        
        // Fallback to localStorage if API fails
        const stored = localStorage.getItem("orders");
        if (stored) {
          try {
            setOrders(JSON.parse(stored));
            // ...existing code (đã xóa log)...
          } catch (parseError) {
            console.error('Error parsing localStorage orders:', parseError);
            setOrders([]);
          }
        } else {
          setOrders([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: 'Chờ xác nhận',
      confirmed: 'Chờ giao hàng', 
      preparing: 'Chờ giao hàng',
      shipping: 'Chờ giao hàng',
      delivered: 'Đã giao',
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

  const tabKeys = [
    "Tất cả",
    "Chờ xác nhận",
    "Chờ giao hàng",
    "Đã hủy"
  ];
  const tabCounts = tabKeys.reduce((acc, key) => {
    if (key === "Tất cả") acc[key] = orders.length;
    else acc[key] = orders.filter((o) => o.status === key).length;
    return acc;
  }, {} as Record<string, number>);

  const filteredOrders = orders.filter(
    (order) => activeTab === "Tất cả" || order.status === activeTab
  );

  return (
    <DashboardLayout>
      <div className={`bg-app-secondary ${isMobile ? 'p-4' : 'p-8'} rounded-3xl shadow-xl border-app-default`}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-app-primary mb-2 flex items-center justify-center gap-3`}>
            <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            Đơn hàng của tôi
          </h1>
          <p className="text-app-secondary">Theo dõi và quản lý tất cả đơn hàng của bạn</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải đơn hàng...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-16">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Stats Cards */}
            <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-2 md:grid-cols-4 gap-4'} mb-8`}>
              {tabKeys.map((tab) => (
                <div key={tab} className="bg-app-card rounded-2xl p-4 shadow-lg border-app-default">
                  <div className="text-center">
                    <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-brand-green`}>{tabCounts[tab]}</div>
                    <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-app-secondary mt-1`}>{tab}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-app-card rounded-2xl shadow-lg border-app-default">
              <div className={`${isMobile ? 'p-4' : 'p-6'} border-b border-app-border`}>
                <OrderTabs activeTab={activeTab} setActiveTab={setActiveTab} counts={tabCounts} tabs={tabKeys} />
              </div>

              <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-app-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-12 h-12 text-app-muted" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-app-primary mb-2">
                  {activeTab === "Tất cả" ? "Chưa có đơn hàng nào" : `Không có đơn hàng ${activeTab.toLowerCase()}`}
                </h3>
                <p className="text-app-secondary mb-6">
                  {activeTab === "Tất cả" 
                    ? "Hãy bắt đầu mua sắm để tạo đơn hàng đầu tiên của bạn!" 
                    : `Hiện tại không có đơn hàng nào ở trạng thái ${activeTab.toLowerCase()}.`
                  }
                </p>
                {activeTab === "Tất cả" && (
                  <button className="btn-primary">
                    Bắt đầu mua sắm
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order) => {
                  const tracking = orderTrackingMap[order.id];
                  const shippingStatus = tracking ? `${tracking.status} tại ${tracking.address}` : '';
                  return (
                    <OrderCard
                      key={order.id}
                      id={order.id}
                      status={order.status}
                      date={order.date}
                      total={order.totalAmount}
                      items={order.items}
                      deliveryFee={order.deliveryFee}
                      payWith={order.payWith}
                      deliveryAddress={order.deliveryAddress}
                      shippingStatus={shippingStatus}
                            onCancelSuccess={handleOrderCancelled}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
        </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OrdersPage;
