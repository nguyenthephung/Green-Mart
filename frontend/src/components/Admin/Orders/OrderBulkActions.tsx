import React from 'react';
import type { Order } from '../../../types/order';

interface OrderBulkActionsProps {
  isDarkMode: boolean;
  selectedOrders: (string | number)[];
  onClearSelection: () => void;
  onBulkStatusUpdate: (status: Order['status']) => void;
}

const OrderBulkActions: React.FC<OrderBulkActionsProps> = ({
  isDarkMode,
  selectedOrders,
  onClearSelection,
  onBulkStatusUpdate,
}) => {
  if (selectedOrders.length === 0) return null;

  return (
    <div
      className="rounded-xl shadow-sm border border-gray-200 p-4 mb-6"
      style={
        isDarkMode
          ? { backgroundColor: '#18181b', borderColor: '#374151' }
          : { backgroundColor: '#fff' }
      }
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span
            className="text-sm font-medium"
            style={isDarkMode ? { color: '#e5e7eb' } : { color: '#374151' }}
          >
            Đã chọn {selectedOrders.length} đơn hàng
          </span>
          <button
            onClick={onClearSelection}
            className="text-sm underline"
            style={isDarkMode ? { color: '#60a5fa' } : { color: '#2563eb' }}
          >
            Bỏ chọn tất cả
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onBulkStatusUpdate('confirmed')}
            className="px-3 py-1.5 rounded-lg text-sm transition-colors"
            style={
              isDarkMode
                ? { backgroundColor: '#1d4ed8', color: '#fff' }
                : { backgroundColor: '#3b82f6', color: '#fff' }
            }
          >
            Xác nhận
          </button>
          <button
            onClick={() => onBulkStatusUpdate('shipping')}
            className="px-3 py-1.5 rounded-lg text-sm transition-colors"
            style={
              isDarkMode
                ? { backgroundColor: '#7c3aed', color: '#fff' }
                : { backgroundColor: '#8b5cf6', color: '#fff' }
            }
          >
            Chuyển giao hàng
          </button>
          <button
            onClick={() => onBulkStatusUpdate('delivered')}
            className="px-3 py-1.5 rounded-lg text-sm transition-colors"
            style={
              isDarkMode
                ? { backgroundColor: '#16a34a', color: '#fff' }
                : { backgroundColor: '#22c55e', color: '#fff' }
            }
          >
            Hoàn thành
          </button>
          <button
            onClick={() => onBulkStatusUpdate('cancelled')}
            className="px-3 py-1.5 rounded-lg text-sm transition-colors"
            style={
              isDarkMode
                ? { backgroundColor: '#dc2626', color: '#fff' }
                : { backgroundColor: '#ef4444', color: '#fff' }
            }
          >
            Hủy đơn
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderBulkActions;
