import OrderProgress from "../components/myOrder/OrderProgress";
import OrderSummary from "../components/myOrder/OrderSummary";
import OrderItems from "../components/myOrder/OrderItems";
import { mockOrders } from "../data/mockOrderData";
import { Link, useParams } from 'react-router-dom';

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  
  // Tìm order theo ID hoặc lấy order đầu tiên làm mặc định
  const currentOrder = orderId  
    ? mockOrders.find(order => order.id === orderId) || mockOrders[0]
    : mockOrders[0];

  const { id, status, date, items, deliveryFee, payWith, deliveryAddress } = currentOrder;



  return (
    <div className="p-4 max-w-6xl mx-auto">
      <Link to="/myorder">
        <button className="mb-4 text-pink-600 hover:underline">← Back</button>
      </Link>
      
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

      {status === "In Progress" && (
        <div className="text-center mt-10">
          <p className="mb-2">You can cancel your order before it starts being prepared.</p>
          <button className="border border-pink-500 text-pink-500 px-6 py-2 rounded-full hover:bg-pink-100">
            Cancel Order
          </button>
        </div>
      )}
    </div>
  );
}