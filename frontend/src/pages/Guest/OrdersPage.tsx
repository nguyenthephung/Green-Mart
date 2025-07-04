import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import OrderTabs from "../../components/Guest/myOrder/OrderTabs";
import OrderCard from "../../components/Guest/myOrder/OrderCard";
import { mockOrders } from "../../data/Guest/mockOrderData"; // sửa file name cho đúng

const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState("All");

  const filteredOrders = mockOrders.filter(
    (order) => activeTab === "All" || order.status === activeTab
  );

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      <OrderTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {filteredOrders.length === 0 ? (
        <p className="text-gray-500 mt-6">No orders in this category.</p>
      ) : (
        filteredOrders.map((order) => (
          <OrderCard
            key={order.id}
            id={order.id}
            status={order.status}
            date={order.date}
            total={
              order.items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
              ) + order.deliveryFee
            }
            items={order.items.reduce((sum, item) => sum + item.quantity, 0)}
            images={order.items.map((i) => i.image)}
            payWith={order.payWith}
          />
        ))
      )}
    </DashboardLayout>
  );
};

export default OrdersPage;
