import React from 'react';
import type { Order } from '../../../types/order';

interface OrderGridViewProps {
  isDarkMode: boolean;
  currentOrders: Order[];
  selectedOrders: (string | number)[];
  onSelectOrder: (orderId: string | number) => void;
  onStatusChange: (orderId: string | number, status: Order['status']) => void;
  onViewOrder: (order: Order) => void;
  getStatusText: (status: string) => string;
  getPaymentText: (status: string) => string;
  formatPrice: (price: number) => string;
  formatDate: (dateString: string) => string;
  totalItems: number;
  search: string;
}

const OrderGridView: React.FC<OrderGridViewProps> = ({
  isDarkMode,
  currentOrders,
  selectedOrders,
  onSelectOrder,
  onStatusChange,
  onViewOrder,
  getStatusText,
  getPaymentText,
  formatPrice,
  formatDate,
  totalItems,
  search,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {currentOrders.map((order: Order) => (
        <div
          key={order.id}
          className="rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
          style={isDarkMode ? { backgroundColor: '#18181b' } : { backgroundColor: '#fff' }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedOrders.includes(order.id)}
                  onChange={() => onSelectOrder(order.id)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <div>
                  <h3
                    className="text-lg font-bold"
                    style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}
                  >
                    #{order.id}
                  </h3>
                  {order.trackingCode && (
                    <p
                      className="text-sm"
                      style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}
                    >
                      {order.trackingCode}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium border`}
                  style={
                    isDarkMode
                      ? order.status === 'pending'
                        ? { backgroundColor: '#23272f', color: '#fde68a', borderColor: '#fde68a' }
                        : order.status === 'confirmed'
                          ? { backgroundColor: '#23272f', color: '#60a5fa', borderColor: '#60a5fa' }
                          : order.status === 'shipping'
                            ? {
                                backgroundColor: '#23272f',
                                color: '#a78bfa',
                                borderColor: '#a78bfa',
                              }
                            : order.status === 'delivered'
                              ? {
                                  backgroundColor: '#23272f',
                                  color: '#4ade80',
                                  borderColor: '#4ade80',
                                }
                              : order.status === 'cancelled'
                                ? {
                                    backgroundColor: '#23272f',
                                    color: '#f87171',
                                    borderColor: '#f87171',
                                  }
                                : {
                                    backgroundColor: '#23272f',
                                    color: '#e5e7eb',
                                    borderColor: '#e5e7eb',
                                  }
                      : undefined
                  }
                >
                  {getStatusText(order.status)}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium border`}
                  style={
                    isDarkMode
                      ? order.paymentStatus === 'paid'
                        ? { backgroundColor: '#23272f', color: '#4ade80', borderColor: '#4ade80' }
                        : order.paymentStatus === 'pending'
                          ? { backgroundColor: '#23272f', color: '#fde68a', borderColor: '#fde68a' }
                          : order.paymentStatus === 'failed'
                            ? {
                                backgroundColor: '#23272f',
                                color: '#f87171',
                                borderColor: '#f87171',
                              }
                            : {
                                backgroundColor: '#23272f',
                                color: '#e5e7eb',
                                borderColor: '#e5e7eb',
                              }
                      : undefined
                  }
                >
                  {getPaymentText(order.paymentStatus)}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <h4
                className="font-semibold"
                style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}
              >
                {order.customerName}
              </h4>
              <p
                className="text-sm"
                style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}
              >
                {order.customerPhone}
              </p>
              <p
                className="text-xs truncate"
                style={isDarkMode ? { color: '#a1a1aa' } : { color: '#6b7280' }}
              >
                {order.customerAddress}
              </p>
            </div>

            <div className="mb-4">
              <div
                className="text-sm mb-2"
                style={isDarkMode ? { color: '#e5e7eb' } : { color: '#374151' }}
              >
                {order.items.length} sản phẩm
              </div>
              <div className="space-y-1">
                {order.items.slice(0, 2).map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 text-xs"
                    style={isDarkMode ? { color: '#a1a1aa' } : { color: '#6b7280' }}
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-6 h-6 rounded object-cover"
                      />
                    )}
                    <span className="truncate">
                      {item.productName} x{item.quantity}
                    </span>
                  </div>
                ))}
                {order.items.length > 2 && (
                  <div
                    className="text-xs"
                    style={isDarkMode ? { color: '#71717a' } : { color: '#a1a1aa' }}
                  >
                    +{order.items.length - 2} sản phẩm khác
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div
                className="text-sm"
                style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}
              >
                {formatDate(order.orderDate)}
              </div>
              <div
                className="text-lg font-bold"
                style={isDarkMode ? { color: '#4ade80' } : { color: '#16a34a' }}
              >
                {formatPrice(order.totalAmount)}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onViewOrder(order)}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Xem chi tiết
              </button>
              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <select
                  value={order.status}
                  onChange={e => onStatusChange(order.id, e.target.value as Order['status'])}
                  className="px-2 py-2 border border-gray-300 rounded-lg text-xs"
                >
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="shipping">Đang giao</option>
                  <option value="delivered">Đã giao</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              )}
            </div>
          </div>
        </div>
      ))}

      {totalItems === 0 && (
        <div className="col-span-full text-center py-12">
          <div
            className="text-6xl mb-4"
            style={isDarkMode ? { color: '#71717a' } : { color: '#a1a1aa' }}
          >
            📦
          </div>
          <h3
            className="text-lg font-medium mb-2"
            style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}
          >
            Không tìm thấy đơn hàng
          </h3>
          <p style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>
            {search ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc' : 'Chưa có đơn hàng nào'}
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderGridView;
