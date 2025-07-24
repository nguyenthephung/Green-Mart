import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import OrderTabs from "../../components/Guest/myOrder/OrderTabs";
import OrderCard from "../../components/Guest/myOrder/OrderCard";
import { normalizeOrdersInLocalStorage } from '../../utils/normalizeOrdersStatus';

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
}

const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    normalizeOrdersInLocalStorage();
    const stored = localStorage.getItem("orders");
    setOrders(stored ? JSON.parse(stored) : []);
  }, []);

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
      <div className="bg-app-secondary p-8 rounded-3xl shadow-xl border-app-default">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-app-primary mb-2 flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            Đơn hàng của tôi
          </h1>
          <p className="text-app-secondary">Theo dõi và quản lý tất cả đơn hàng của bạn</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {tabKeys.map((tab) => (
            <div key={tab} className="bg-app-card rounded-2xl p-4 shadow-lg border-app-default">
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-green">{tabCounts[tab]}</div>
                <div className="text-sm text-app-secondary mt-1">{tab}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-app-card rounded-2xl shadow-lg border-app-default">
          <div className="p-6 border-b border-app-border">
            <OrderTabs activeTab={activeTab} setActiveTab={setActiveTab} counts={tabCounts} tabs={tabKeys} />
          </div>

          <div className="p-6">
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
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    id={order.id}
                    status={order.status}
                    date={order.date}
                    total={
                      order.items.reduce(
                        (sum: number, item: OrderItem) => sum + item.price * item.quantity,
                        0
                      ) + order.deliveryFee
                    }
                    items={order.items}
                    deliveryFee={order.deliveryFee}
                    payWith={order.payWith}
                    deliveryAddress={order.deliveryAddress}
                    shippingStatus={order.status === 'Chờ giao hàng' ? 'Đơn hàng đã rời kho phân loại tới HCM Mega SOC' : ''}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrdersPage;
