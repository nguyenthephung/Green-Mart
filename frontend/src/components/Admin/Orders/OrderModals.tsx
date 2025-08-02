import React from 'react';
import type { Order } from '../../../types/order';

// Export Modal Component
interface ExportModalProps {
  show: boolean;
  isDarkMode: boolean;
  onClose: () => void;
  onExportOrders: () => void;
  onExportDetails: () => void;
  totalOrders: number;
}

const ExportModal: React.FC<ExportModalProps> = ({ 
  show, 
  isDarkMode, 
  onClose, 
  onExportOrders, 
  onExportDetails, 
  totalOrders 
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div
        className="rounded-xl w-full max-w-md"
        style={{
          ...(isDarkMode ? { backgroundColor: '#18181b', color: '#fff' } : { backgroundColor: '#fff' }),
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          margin: '16px'
        }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold" style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}>
              Xuất báo cáo đơn hàng
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors"
              style={isDarkMode ? { backgroundColor: '#23272f', color: '#fff' } : { backgroundColor: '#f3f4f6', color: '#111827' }}
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div className="text-sm" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>
              Tổng số đơn hàng: <span className="font-semibold">{totalOrders}</span>
            </div>

            <div className="space-y-3">
              <button
                onClick={onExportOrders}
                className="w-full p-4 rounded-lg border text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                style={isDarkMode ? { backgroundColor: '#23272f', borderColor: '#374151', color: '#fff' } : { backgroundColor: '#fff', borderColor: '#d1d5db' }}
              >
                <div className="font-medium">📋 Xuất danh sách đơn hàng</div>
                <div className="text-sm mt-1" style={isDarkMode ? { color: '#a1a1aa' } : { color: '#6b7280' }}>
                  Xuất thông tin tổng quan các đơn hàng (CSV)
                </div>
              </button>

              <button
                onClick={onExportDetails}
                className="w-full p-4 rounded-lg border text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                style={isDarkMode ? { backgroundColor: '#23272f', borderColor: '#374151', color: '#fff' } : { backgroundColor: '#fff', borderColor: '#d1d5db' }}
              >
                <div className="font-medium">📊 Xuất chi tiết sản phẩm</div>
                <div className="text-sm mt-1" style={isDarkMode ? { color: '#a1a1aa' } : { color: '#6b7280' }}>
                  Xuất chi tiết từng sản phẩm trong đơn hàng (CSV)
                </div>
              </button>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg transition-colors"
              style={isDarkMode ? { backgroundColor: '#23272f', color: '#fff' } : { backgroundColor: '#6b7280', color: '#fff' }}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Order Detail Modal Component
interface ViewOrderModalProps {
  show: boolean;
  order: Order;
  isDarkMode: boolean;
  onClose: () => void;
}

const ViewOrderModal: React.FC<ViewOrderModalProps> = ({ show, order, isDarkMode, onClose }) => {
  if (!show) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'shipping': return 'Đang giao';
      case 'delivered': return 'Đã giao';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cod': return 'COD - Thanh toán khi nhận hàng';
      case 'momo': return 'MoMo - Ví điện tử';
      case 'bank_transfer': return 'Chuyển khoản ngân hàng';
      case 'credit_card': return 'Thẻ tín dụng/ghi nợ';
      default: return method;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div
        className="rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        style={{
          ...(isDarkMode ? { backgroundColor: '#18181b', color: '#fff' } : { backgroundColor: '#fff' }),
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          margin: '16px'
        }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}>
              Chi tiết đơn hàng #{order.id}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors"
              style={isDarkMode ? { backgroundColor: '#23272f', color: '#fff' } : { backgroundColor: '#f3f4f6', color: '#111827' }}
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}>
                Thông tin khách hàng
              </h3>
              <div className="space-y-2">
                <p><span className="font-medium">Tên:</span> {order.customerName}</p>
                <p><span className="font-medium">Email:</span> {order.customerEmail}</p>
                <p><span className="font-medium">Điện thoại:</span> {order.customerPhone}</p>
                <p><span className="font-medium">Địa chỉ:</span> {order.customerAddress}</p>
              </div>
            </div>

            {/* Order Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}>
                Thông tin đơn hàng
              </h3>
              <div className="space-y-2">
                <p><span className="font-medium">Mã theo dõi:</span> {order.trackingCode}</p>
                <p><span className="font-medium">Trạng thái:</span> {getStatusText(order.status)}</p>
                <p><span className="font-medium">Phương thức thanh toán:</span> {getPaymentMethodText(order.paymentMethod)}</p>
                <p><span className="font-medium">Ngày đặt:</span> {new Date(order.orderDate).toLocaleString('vi-VN')}</p>
                {order.notes && <p><span className="font-medium">Ghi chú:</span> {order.notes}</p>}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4" style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}>
              Sản phẩm đã đặt
            </h3>
            <div className="space-y-3">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg border" style={isDarkMode ? { borderColor: '#374151' } : { borderColor: '#d1d5db' }}>
                  {item.image && (
                    <img src={item.image} alt={item.productName} className="w-16 h-16 rounded object-cover" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium">{item.productName}</h4>
                    <p className="text-sm" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>
                      Số lượng: {item.quantity} × {formatPrice(item.price)} = {formatPrice(item.quantity * item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="mt-6 p-4 rounded-lg" style={isDarkMode ? { backgroundColor: '#23272f' } : { backgroundColor: '#f9fafb' }}>
            <h3 className="text-lg font-semibold mb-3" style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}>
              Tổng kết đơn hàng
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span>{formatPrice(order.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span>{formatPrice(order.shippingFee || 0)}</span>
              </div>
              {(order.discount || 0) > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Giảm giá:</span>
                  <span>-{formatPrice(order.discount || 0)}</span>
                </div>
              )}
              <hr className="my-2" style={isDarkMode ? { borderColor: '#374151' } : { borderColor: '#d1d5db' }} />
              <div className="flex justify-between text-lg font-bold">
                <span>Tổng cộng:</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ExportModal, ViewOrderModal };
