import { Link } from "react-router-dom";
import React, { useState } from "react";
import orderService from '../../../services/orderService';

export type OrderItem = {
  name: string;
  price: number;
  oldPrice: number;
  quantity: number;
  image: string;
  variant?: string;
};

export type OrderCardProps = {
  id: string;
  status: string;
  date: string;
  total: number;
  items: OrderItem[];
  deliveryFee: number;
  payWith: string;
  deliveryAddress: string;
  shippingStatus?: string;
  onCancelSuccess?: (orderId: string) => void;
};

const statusConfig: Record<string, { color: string; bg: string; icon: string }> = {
  "Hoàn thành": { 
    color: "text-green-700", 
    bg: "bg-green-100 border-green-200", 
    icon: "M5 13l4 4L19 7" 
  },
  "Đã hủy": { 
    color: "text-red-700", 
    bg: "bg-red-100 border-red-200", 
    icon: "M6 18L18 6M6 6l12 12" 
  },
  "Đang xử lý": { 
    color: "text-blue-700", 
    bg: "bg-blue-100 border-blue-200", 
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
  },
  "Chờ giao hàng": { 
    color: "text-orange-700", 
    bg: "bg-orange-100 border-orange-200", 
    icon: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m6.75 4.5v-3a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5v3m-6 0h4.5m0 0h2.625a1.125 1.125 0 001.125-1.125V11.25a1.125 1.125 0 00-1.125-1.125H15.75m-6.75 0H9.375a1.125 1.125 0 01-1.125-1.125V5.625m8.25 0h2.25a1.125 1.125 0 011.125 1.125v1.5m0 0H15.75m0 0v3M12 7.5V6a1.5 1.5 0 00-1.5-1.5h-3A1.5 1.5 0 006 6v1.5h6z" 
  },
  "Vận chuyển": { 
    color: "text-purple-700", 
    bg: "bg-purple-100 border-purple-200", 
    icon: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m6.75 4.5v-3a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5v3m-6 0h4.5m0 0h2.625a1.125 1.125 0 001.125-1.125V11.25a1.125 1.125 0 00-1.125-1.125H15.75m-6.75 0H9.375a1.125 1.125 0 01-1.125-1.125V5.625m8.25 0h2.25a1.125 1.125 0 011.125 1.125v1.5m0 0H15.75m0 0v3M12 7.5V6a1.5 1.5 0 00-1.5-1.5h-3A1.5 1.5 0 006 6v1.5h6z" 
  },
};

export default function OrderCard({
  id,
  status,
  date,
  total,
  items,
  shippingStatus = "Đơn hàng đã rời kho phân loại tới HCM Mega SOC",
  onCancelSuccess,
}: OrderCardProps) {
  const statusInfo = statusConfig[status] || { 
    color: "text-app-secondary", 
    bg: "bg-app-secondary border-app-border", 
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
  };

  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const handleCancelOrder = async () => {
    setIsCancelling(true);
    setCancelError(null);
    try {
      await orderService.cancelOrder(id);
      if (onCancelSuccess) onCancelSuccess(id);
    } catch (err: any) {
      setCancelError(err.message || 'Hủy đơn hàng thất bại');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="bg-app-card rounded-2xl border-app-border shadow-lg hover:shadow-xl transition-all duration-300 p-6 group">
      {/* Header with Status */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <div className="font-semibold text-app-primary">Đơn hàng #{id}</div>
            <div className="text-sm text-app-secondary">{date}</div>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${statusInfo.bg} ${statusInfo.color}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={statusInfo.icon} />
          </svg>
          <span className="font-semibold text-sm">{status}</span>
        </div>
      </div>

      {/* Shipping Status */}
      {status === "Chờ giao hàng" && (
        <div className="bg-brand-green/5 rounded-xl p-4 mb-6 border border-brand-green/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-brand-green">Đang vận chuyển</div>
              <div className="text-sm text-brand-green/80">{shippingStatus}</div>
            </div>
          </div>
        </div>
      )}

      {/* Products */}
      <div className="space-y-4 mb-6">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-4 p-4 bg-app-secondary rounded-xl hover:bg-app-secondary/80 transition-colors duration-200">
            <img
              src={item.image}
              alt={item.name}
              className="w-16 h-16 object-cover rounded-lg border-app-border"
            />
            <div className="flex-1">
              <div className="font-semibold text-app-primary mb-1">{item.name}</div>
              <div className="text-xs text-app-muted mb-2">
                Phân loại: {item.variant || "Mặc định"}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-brand-green font-bold">
                    {item.price.toLocaleString()}₫
                  </span>
                  {item.oldPrice > item.price && (
                    <span className="text-app-muted line-through text-sm">
                      {item.oldPrice.toLocaleString()}₫
                    </span>
                  )}
                </div>
                <span className="text-app-secondary text-sm font-medium">
                  x{item.quantity}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex justify-between items-center mb-6 p-4 bg-brand-green/5 rounded-xl border border-brand-green/20">
        <span className="text-app-primary font-medium">Tổng thanh toán:</span>
        <span className="text-2xl font-bold text-brand-green">
          {total.toLocaleString()}₫
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Link
          to={`/ordertracking/${id}`}
          className="bg-brand-green hover:bg-brand-green/90 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl group-hover:scale-105 transform flex items-center gap-2 hover:-translate-y-0.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Xem Chi Tiết
        </Link>
        {status === 'Chờ xác nhận' && (
          <button
            onClick={handleCancelOrder}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl group-hover:scale-105 transform flex items-center gap-2 hover:-translate-y-0.5"
            disabled={isCancelling}
          >
            {isCancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
          </button>
        )}
        {cancelError && (
          <div className="text-red-500 font-medium mt-2">{cancelError}</div>
        )}
      </div>
    </div>
  );
}