import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import OrderTabs from "../../components/Guest/myOrder/OrderTabs";
import OrderCard from "../../components/Guest/myOrder/OrderCard";

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

const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("orders");
    setOrders(stored ? JSON.parse(stored) : []);
  }, []);

  const filteredOrders = orders.filter(
    (order) => activeTab === "Tất cả" || order.status === activeTab
  );

  return (
    <DashboardLayout>
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">
        Đơn hàng của tôi
      </h1>
      <OrderTabs activeTab={activeTab} setActiveTab={setActiveTab} />

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
              items={order.items.reduce((sum: number, item: OrderItem) => sum + item.quantity, 0)}
              images={order.items.map((i: OrderItem) => i.image)}
              payWith={order.payWith}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default OrdersPage;
