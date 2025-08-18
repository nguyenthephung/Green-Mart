// import OrderTrackingTimeline from '../../OrderTracking/OrderTrackingTimeline';
import React, { useEffect, useState } from 'react';
import { addOrderTracking, getOrderTrackingHistory, updateOrderTracking, deleteOrderTracking } from '../../../services/orderTrackingService';
import OrderTrackingTimeline from '../../OrderTracking/OrderTrackingTimeline';
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
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [editId, setEditId] = useState<string|null>(null);
  const [editLat, setEditLat] = useState('');
  const [editLng, setEditLng] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const handleEditTracking = (item: any) => {
    setEditId(item._id);
    setEditLat(item.location.lat.toString());
    setEditLng(item.location.lng.toString());
    setEditAddress(item.location.address || '');
    setEditStatus(item.status);
  };

  const handleUpdateTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setLoading(true);
    await updateOrderTracking(editId, {
      lat: Number(editLat),
      lng: Number(editLng),
      address: editAddress,
      status: editStatus,
    });
  const trackingId = String(order.orderNumber || '');
  const res = await getOrderTrackingHistory(trackingId);
    setTrackingHistory(res.data);
    setEditId(null);
    setLoading(false);
  };

  const handleDeleteTracking = async (id: string) => {
    setLoading(true);
    await deleteOrderTracking(id);
  const trackingId = String(order.orderNumber || '');
  const res = await getOrderTrackingHistory(trackingId);
    setTrackingHistory(res.data);
    setLoading(false);
  };
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);


  useEffect(() => {
  const trackingId = String(order.orderNumber || '');
    if (trackingId.length > 0) {
      getOrderTrackingHistory(trackingId).then(res => setTrackingHistory(res.data));
    }
  }, [order]);

  const handleAddTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const trackingId = order.orderNumber;
    if (typeof trackingId === 'string' && trackingId.length > 0) {
      await addOrderTracking({ orderId: trackingId, lat: Number(lat), lng: Number(lng), address, status });
      const res = await getOrderTrackingHistory(trackingId);
      setTrackingHistory(res.data);
    }
    setLat(''); setLng(''); setAddress(''); setStatus('');
    setLoading(false);
  };

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

          {/* Order Tracking Section */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3" style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}>
              Lịch sử vị trí đơn hàng
            </h3>
            <div className="space-y-4">
              {trackingHistory.map((item: any) => (
                <div key={item._id} className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:gap-4">
                  <div className="flex-1">
                    <div className="font-semibold text-emerald-700 dark:text-emerald-300">{item.status}</div>
                    <div className="text-gray-600 dark:text-gray-300 text-sm">{item.location.address || `${item.location.lat}, ${item.location.lng}`}</div>
                    <div className="text-xs text-gray-400 mt-1">{new Date(item.updatedAt).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2 mt-2 md:mt-0">
                    <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={() => handleEditTracking(item)}>Sửa</button>
                    <button className="px-3 py-1 bg-red-500 text-white rounded" onClick={() => handleDeleteTracking(item._id)}>Xóa</button>
                  </div>
                </div>
              ))}
            </div>
            {editId && (
              <form className="mt-4 space-y-3" onSubmit={handleUpdateTracking}>
                <div className="flex gap-2">
                  <div className="flex flex-col w-1/4">
                    <input className="p-2 border rounded" placeholder="Vĩ độ (Latitude)" value={editLat} onChange={e => setEditLat(e.target.value)} required />
                  </div>
                  <div className="flex flex-col w-1/4">
                    <input className="p-2 border rounded" placeholder="Kinh độ (Longitude)" value={editLng} onChange={e => setEditLng(e.target.value)} required />
                  </div>
                  <div className="flex flex-col w-1/3">
                    <input className="p-2 border rounded" placeholder="Địa chỉ chi tiết" value={editAddress} onChange={e => setEditAddress(e.target.value)} />
                  </div>
                  <div className="flex flex-col w-1/4">
                    <input className="p-2 border rounded" placeholder="Trạng thái đơn" value={editStatus} onChange={e => setEditStatus(e.target.value)} required />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-bold" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
                  <button type="button" className="bg-gray-400 text-white px-6 py-2 rounded font-bold" onClick={() => setEditId(null)}>Hủy</button>
                </div>
              </form>
            )}
            {order.status === 'shipping' && (
              <form className="mt-6 space-y-3" onSubmit={handleAddTracking}>
                <div className="flex gap-2">
                  <div className="flex flex-col w-1/4">
                    <input className="p-2 border rounded" placeholder="Vĩ độ (Latitude)" value={lat} onChange={e => setLat(e.target.value)} required />
                    <span className="text-xs text-gray-500 mt-1">Nhập vĩ độ GPS, ví dụ: 10.762622</span>
                  </div>
                  <div className="flex flex-col w-1/4">
                    <input className="p-2 border rounded" placeholder="Kinh độ (Longitude)" value={lng} onChange={e => setLng(e.target.value)} required />
                    <span className="text-xs text-gray-500 mt-1">Nhập kinh độ GPS, ví dụ: 106.660172</span>
                  </div>
                  <div className="flex flex-col w-1/3">
                    <input className="p-2 border rounded" placeholder="Địa chỉ chi tiết" value={address} onChange={e => setAddress(e.target.value)} />
                    <span className="text-xs text-gray-500 mt-1">Nhập địa chỉ cụ thể (tùy chọn)</span>
                  </div>
                  <div className="flex flex-col w-1/4">
                    <input className="p-2 border rounded" placeholder="Trạng thái đơn" value={status} onChange={e => setStatus(e.target.value)} required />
                    <span className="text-xs text-gray-500 mt-1">Ví dụ: Đang giao, Đã đến kho, Đang chuyển phát...</span>
                  </div>
                </div>
                <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded font-bold" disabled={loading}>
                  {loading ? 'Đang cập nhật...' : 'Cập nhật vị trí'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { ExportModal, ViewOrderModal };
