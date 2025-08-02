import React from 'react';
import type { Order, SortField } from '../../../types/order';

interface OrderTableViewProps {
  isDarkMode: boolean;
  currentOrders: Order[];
  selectedOrders: number[];
  sortField: SortField;
  onSelectAll: () => void;
  onSelectOrder: (orderId: number) => void;
  onSort: (field: SortField) => void;
  onStatusChange: (orderId: number, status: Order['status']) => void;
  onViewOrder: (order: Order) => void;
  getSortIcon: (field: SortField) => string;
  getPaymentMethodText: (method: Order['paymentMethod']) => string;
  getPaymentMethodIcon: (method: Order['paymentMethod']) => string;
  getPaymentMethodColor: (method: Order['paymentMethod']) => string;
  getPaymentText: (status: string) => string;
  formatPrice: (price: number) => string;
  formatDateTime: (dateString: string) => string;
  totalItems: number;
  search: string;
}

const OrderTableView: React.FC<OrderTableViewProps> = ({
  isDarkMode,
  currentOrders,
  selectedOrders,
  onSelectAll,
  onSelectOrder,
  onSort,
  onStatusChange,
  onViewOrder,
  getSortIcon,
  getPaymentMethodText,
  getPaymentMethodIcon,
  getPaymentMethodColor,
  getPaymentText,
  formatPrice,
  formatDateTime,
  totalItems,
  search
}) => {
  return (
    <div className="rounded-xl shadow-sm border border-gray-200 overflow-hidden" style={isDarkMode ? { backgroundColor: '#18181b' } : { backgroundColor: '#fff' }}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200" style={isDarkMode ? { backgroundColor: '#23272f' } : { backgroundColor: '#f9fafb' }}>
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedOrders.length === currentOrders.length && currentOrders.length > 0}
                  onChange={onSelectAll}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSort('id')}
              >
                <div className="flex items-center gap-1">
                  Mã đơn {getSortIcon('id')}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSort('customerName')}
              >
                <div className="flex items-center gap-1">
                  Khách hàng {getSortIcon('customerName')}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sản phẩm
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSort('totalAmount')}
              >
                <div className="flex items-center gap-1">
                  Tổng tiền {getSortIcon('totalAmount')}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSort('status')}
              >
                <div className="flex items-center gap-1">
                  Trạng thái {getSortIcon('status')}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thanh toán
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSort('orderDate')}
              >
                <div className="flex items-center gap-1">
                  Ngày đặt {getSortIcon('orderDate')}
                </div>
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200" style={isDarkMode ? { backgroundColor: '#18181b' } : { backgroundColor: '#fff' }}>
            {currentOrders.map((order: Order) => (
              <tr key={order.id}
                style={{ ...isDarkMode ? { backgroundColor: '#18181b' } : { backgroundColor: '#fff' }, transition: 'none' }}
                onMouseEnter={e => { if (isDarkMode) e.currentTarget.style.backgroundColor = '#23272f'; else e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
                onMouseLeave={e => { if (isDarkMode) e.currentTarget.style.backgroundColor = '#18181b'; else e.currentTarget.style.backgroundColor = '#fff'; }}>
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id)}
                    onChange={() => onSelectOrder(order.id)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                  {order.trackingCode && (
                    <div className="text-xs text-gray-500">{order.trackingCode}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                  <div className="text-xs text-gray-500">{order.customerPhone}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {order.items.length} sản phẩm
                  </div>
                  <div className="text-xs text-gray-500">
                    {order.items[0]?.productName}
                    {order.items.length > 1 && ` +${order.items.length - 1} khác`}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}>
                  {formatPrice(order.totalAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={order.status}
                    onChange={(e) => onStatusChange(order.id, e.target.value as Order['status'])}
                    className={`text-xs font-medium border rounded-full px-2.5 py-0.5`}
                    style={isDarkMode
                      ? order.status === 'pending'
                        ? { backgroundColor: '#23272f', color: '#fde68a', borderColor: '#fde68a' }
                        : order.status === 'confirmed'
                          ? { backgroundColor: '#23272f', color: '#60a5fa', borderColor: '#60a5fa' }
                          : order.status === 'shipping'
                            ? { backgroundColor: '#23272f', color: '#a78bfa', borderColor: '#a78bfa' }
                            : order.status === 'delivered'
                              ? { backgroundColor: '#23272f', color: '#4ade80', borderColor: '#4ade80' }
                              : order.status === 'cancelled'
                                ? { backgroundColor: '#23272f', color: '#f87171', borderColor: '#f87171' }
                                : { backgroundColor: '#23272f', color: '#e5e7eb', borderColor: '#e5e7eb' }
                      : undefined}
                    disabled={order.status === 'delivered' || order.status === 'cancelled'}
                  >
                    <option value="pending">Chờ xác nhận</option>
                    <option value="confirmed">Đã xác nhận</option>
                    <option value="shipping">Đang giao</option>
                    <option value="delivered">Đã giao</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPaymentMethodColor(order.paymentMethod)}`}>
                      <span className="mr-1">{getPaymentMethodIcon(order.paymentMethod)}</span>
                      {getPaymentMethodText(order.paymentMethod)}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border`}
                      style={isDarkMode
                        ? order.paymentStatus === 'paid'
                          ? { backgroundColor: '#23272f', color: '#4ade80', borderColor: '#4ade80' }
                          : order.paymentStatus === 'pending'
                            ? { backgroundColor: '#23272f', color: '#fde68a', borderColor: '#fde68a' }
                            : order.paymentStatus === 'failed'
                              ? { backgroundColor: '#23272f', color: '#f87171', borderColor: '#f87171' }
                              : { backgroundColor: '#23272f', color: '#e5e7eb', borderColor: '#e5e7eb' }
                        : undefined}
                    >
                      {getPaymentText(order.paymentStatus)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>
                  {formatDateTime(order.orderDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onViewOrder(order)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                    title="Xem chi tiết"
                  >
                    👁️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalItems === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4" style={isDarkMode ? { color: '#71717a' } : { color: '#a1a1aa' }}>📦</div>
          <h3 className="text-lg font-medium mb-2" style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}>Không tìm thấy đơn hàng</h3>
          <p style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>
            {search ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc' : 'Chưa có đơn hàng nào'}
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderTableView;
