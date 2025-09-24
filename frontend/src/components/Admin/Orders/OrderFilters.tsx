import React from 'react';
import type { FilterStatus, FilterPayment, FilterPaymentMethod } from '../../../types/order';
type SortField = 'id' | 'customerName' | 'orderDate' | 'totalAmount' | 'status';
type SortOrder = 'asc' | 'desc';

interface OrderFiltersProps {
  isDarkMode: boolean;
  showFilters: boolean;
  search: string;
  filterStatus: FilterStatus;
  filterPayment: FilterPayment;
  filterPaymentMethod: FilterPaymentMethod;
  sortField: SortField;
  sortOrder: SortOrder;
  onSearchChange: (value: string) => void;
  onFilterStatusChange: (value: FilterStatus) => void;
  onFilterPaymentChange: (value: FilterPayment) => void;
  onFilterPaymentMethodChange: (value: FilterPaymentMethod) => void;
  onSortChange: (field: SortField, order: SortOrder) => void;
  onClearFilters: () => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
  isDarkMode,
  showFilters,
  search,
  filterStatus,
  filterPayment,
  filterPaymentMethod,
  sortField,
  sortOrder,
  onSearchChange,
  onFilterStatusChange,
  onFilterPaymentChange,
  onFilterPaymentMethodChange,
  onSortChange,
  onClearFilters,
}) => {
  if (!showFilters) return null;

  return (
    <div
      className="rounded-xl shadow-sm border border-gray-200 p-6 mb-6 animate-slideDown"
      style={isDarkMode ? { backgroundColor: '#18181b' } : { backgroundColor: '#fff' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-lg font-semibold"
          style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}
        >
          Bộ lọc và tìm kiếm
        </h3>
        <button
          onClick={onClearFilters}
          className="text-sm underline"
          style={isDarkMode ? { color: '#60a5fa' } : { color: '#2563eb' }}
        >
          Xóa bộ lọc
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={isDarkMode ? { color: '#e5e7eb' } : { color: '#374151' }}
          >
            Tìm kiếm
          </label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Mã đơn, tên khách hàng, email..."
              className="w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              style={
                isDarkMode
                  ? { backgroundColor: '#23272f', color: '#fff', borderColor: '#374151' }
                  : {}
              }
            />
            <span
              className="absolute left-3 top-2.5"
              style={isDarkMode ? { color: '#a1a1aa' } : { color: '#9ca3af' }}
            >
              🔍
            </span>
          </div>
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={isDarkMode ? { color: '#e5e7eb' } : { color: '#374151' }}
          >
            Trạng thái đơn hàng
          </label>
          <select
            value={filterStatus}
            onChange={e => onFilterStatusChange(e.target.value as FilterStatus)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            style={
              isDarkMode
                ? { backgroundColor: '#23272f', color: '#fff', borderColor: '#374151' }
                : {}
            }
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">⏳ Chờ xác nhận</option>
            <option value="confirmed">✅ Đã xác nhận</option>
            <option value="shipping">🚚 Đang giao</option>
            <option value="delivered">📦 Đã giao</option>
            <option value="cancelled">❌ Đã hủy</option>
          </select>
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={isDarkMode ? { color: '#e5e7eb' } : { color: '#374151' }}
          >
            Thanh toán
          </label>
          <select
            value={filterPayment}
            onChange={e => onFilterPaymentChange(e.target.value as FilterPayment)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            style={
              isDarkMode
                ? { backgroundColor: '#23272f', color: '#fff', borderColor: '#374151' }
                : {}
            }
          >
            <option value="all">Tất cả</option>
            <option value="paid">💰 Đã thanh toán</option>
            <option value="pending">⏳ Chờ thanh toán</option>
            <option value="failed">❌ Thất bại</option>
          </select>
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={isDarkMode ? { color: '#e5e7eb' } : { color: '#374151' }}
          >
            Phương thức thanh toán
          </label>
          <select
            value={filterPaymentMethod}
            onChange={e => onFilterPaymentMethodChange(e.target.value as FilterPaymentMethod)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            style={
              isDarkMode
                ? { backgroundColor: '#23272f', color: '#fff', borderColor: '#374151' }
                : {}
            }
          >
            <option value="all">Tất cả phương thức</option>
            <option value="cod">💰 COD - Thanh toán khi nhận hàng</option>
            <option value="momo">📱 MoMo - Ví điện tử</option>
            <option value="bank_transfer">🏦 Chuyển khoản ngân hàng</option>
            <option value="credit_card">💳 Thẻ tín dụng/ghi nợ</option>
          </select>
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={isDarkMode ? { color: '#e5e7eb' } : { color: '#374151' }}
          >
            Sắp xếp theo
          </label>
          <select
            value={`${sortField}-${sortOrder}`}
            onChange={e => {
              const [field, order] = e.target.value.split('-');
              onSortChange(field as SortField, order as SortOrder);
            }}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            style={
              isDarkMode
                ? { backgroundColor: '#23272f', color: '#fff', borderColor: '#374151' }
                : {}
            }
          >
            <option value="orderDate-desc">Mới nhất</option>
            <option value="orderDate-asc">Cũ nhất</option>
            <option value="totalAmount-desc">Giá trị cao nhất</option>
            <option value="totalAmount-asc">Giá trị thấp nhất</option>
            <option value="customerName-asc">Tên khách hàng A-Z</option>
            <option value="id-desc">Mã đơn hàng mới nhất</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default OrderFilters;
