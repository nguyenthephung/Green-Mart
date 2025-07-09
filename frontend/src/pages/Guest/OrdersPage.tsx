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
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">
        Đơn hàng của tôi
      </h1>
      <OrderTabs activeTab={activeTab} setActiveTab={setActiveTab} counts={tabCounts} tabs={tabKeys} />

      {filteredOrders.length === 0 ? (
        <p className="text-gray-500 mt-6 text-center">
          Không có đơn hàng nào trong mục này.
        </p>
      ) : (
        <div className="grid gap-6">
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
    </DashboardLayout>
  );
};

export default OrdersPage;
