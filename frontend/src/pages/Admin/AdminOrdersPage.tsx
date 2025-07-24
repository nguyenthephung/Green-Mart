import React, { useState, useMemo } from 'react';
import { adminOrders } from '../../data/Admin/orders';
import type { Order } from '../../data/Admin/orders';
import Pagination from '../../components/Admin/Pagination';

type SortField = 'id' | 'customerName' | 'orderDate' | 'totalAmount' | 'status';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'table' | 'grid';
type FilterStatus = 'all' | 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
type FilterPayment = 'all' | 'pending' | 'paid' | 'failed';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(adminOrders);
  const [search, setSearch] = useState('');
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [showView, setShowView] = useState(false);
  const [sortField, setSortField] = useState<SortField>('orderDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterPayment, setFilterPayment] = useState<FilterPayment>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter and sort logic
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders.filter(order => {
      const matchesSearch = order.customerName.toLowerCase().includes(search.toLowerCase()) ||
                          order.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
                          order.customerPhone.includes(search) ||
                          order.id.toString().includes(search) ||
                          order.trackingCode?.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      const matchesPayment = filterPayment === 'all' || order.paymentStatus === filterPayment;
      
      return matchesSearch && matchesStatus && matchesPayment;
    });

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'customerName':
          aValue = a.customerName.toLowerCase();
          bValue = b.customerName.toLowerCase();
          break;
        case 'orderDate':
          aValue = new Date(a.orderDate).getTime();
          bValue = new Date(b.orderDate).getTime();
          break;
        case 'totalAmount':
          aValue = a.totalAmount;
          bValue = b.totalAmount;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [orders, search, sortField, sortOrder, filterStatus, filterPayment]);

  // Pagination calculations
  const totalItems = filteredAndSortedOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredAndSortedOrders.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, filterPayment, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleStatusChange = (orderId: number, newStatus: Order['status']) => {
    setIsLoading(true);
    setTimeout(() => {
      setOrders(orders.map(order => 
        order.id === orderId ? { 
          ...order, 
          status: newStatus,
          trackingCode: newStatus === 'confirmed' && !order.trackingCode 
            ? `GM${new Date().toISOString().slice(0,10).replace(/-/g, '')}${orderId.toString().padStart(4, '0')}`
            : order.trackingCode
        } : order
      ));
      setIsLoading(false);
    }, 500);
  };

  const openViewModal = (order: Order) => {
    setViewOrder(order);
    setShowView(true);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipping': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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

  const getPaymentText = (status: string) => {
    switch (status) {
      case 'paid': return 'Đã thanh toán';
      case 'pending': return 'Chờ thanh toán';
      case 'failed': return 'Thanh toán thất bại';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const shippingOrders = orders.filter(o => o.status === 'shipping').length;
  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={isDarkMode ? { backgroundColor: '#111827', color: '#fff' } : { backgroundColor: '#f9fafb' }}
    >
      {/* Header */}
      <div
        className="rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6"
        style={isDarkMode ? { backgroundColor: '#18181b' } : { backgroundColor: '#fff' }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2" style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}>Quản lý đơn hàng</h1>
            <div className="flex flex-wrap gap-4 text-sm" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>
              <span>Tổng: <span className="font-semibold" style={{ color: '#2563eb' }}>{totalOrders}</span> đơn hàng</span>
              <span>Chờ xác nhận: <span className="font-semibold" style={{ color: '#fde047' }}>{pendingOrders}</span></span>
              <span>Đang giao: <span className="font-semibold" style={{ color: '#a78bfa' }}>{shippingOrders}</span></span>
              <span>Doanh thu: <span className="font-semibold" style={{ color: '#22c55e' }}>{formatPrice(totalRevenue)}</span></span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
              style={isDarkMode ? (showFilters ? { backgroundColor: '#23272f', color: '#fff' } : { backgroundColor: '#23272f', color: '#60a5fa' }) : (showFilters ? { backgroundColor: '#2563eb', color: '#fff' } : { backgroundColor: '#dbeafe', color: '#1e40af' })}
            >
              <span>🔍</span>
              Bộ lọc
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('table')}
                className="px-3 py-2 rounded-lg transition-all duration-200"
                style={isDarkMode ? (viewMode === 'table' ? { backgroundColor: '#22c55e', color: '#fff' } : { backgroundColor: '#23272f', color: '#e5e7eb' }) : (viewMode === 'table' ? { backgroundColor: '#22c55e', color: '#fff' } : { backgroundColor: '#e5e7eb', color: '#374151' })}
                title="Xem dạng bảng"
              >
                📋
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className="px-3 py-2 rounded-lg transition-all duration-200"
                style={isDarkMode ? (viewMode === 'grid' ? { backgroundColor: '#22c55e', color: '#fff' } : { backgroundColor: '#23272f', color: '#e5e7eb' }) : (viewMode === 'grid' ? { backgroundColor: '#22c55e', color: '#fff' } : { backgroundColor: '#e5e7eb', color: '#374151' })}
                title="Xem dạng thẻ"
              >
                🔳
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="rounded-xl shadow-sm border border-gray-200 p-6 mb-6 animate-slideDown" style={isDarkMode ? { backgroundColor: '#18181b' } : { backgroundColor: '#fff' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}>Bộ lọc và tìm kiếm</h3>
            <button
              onClick={() => {
                setSearch('');
                setFilterStatus('all');
                setFilterPayment('all');
                setSortField('orderDate');
                setSortOrder('desc');
              }}
              className="text-sm underline"
              style={isDarkMode ? { color: '#60a5fa' } : { color: '#2563eb' }}
            >
              Xóa bộ lọc
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#374151' }}>Tìm kiếm</label>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Mã đơn, tên khách hàng, email..."
                  className="w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  style={isDarkMode ? { backgroundColor: '#23272f', color: '#fff', borderColor: '#374151' } : {}}
                />
                <span className="absolute left-3 top-2.5" style={isDarkMode ? { color: '#a1a1aa' } : { color: '#9ca3af' }}>🔍</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#374151' }}>Trạng thái đơn hàng</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                style={isDarkMode ? { backgroundColor: '#23272f', color: '#fff', borderColor: '#374151' } : {}}
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
              <label className="block text-sm font-medium mb-2" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#374151' }}>Thanh toán</label>
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value as FilterPayment)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                style={isDarkMode ? { backgroundColor: '#23272f', color: '#fff', borderColor: '#374151' } : {}}
              >
                <option value="all">Tất cả</option>
                <option value="paid">💰 Đã thanh toán</option>
                <option value="pending">⏳ Chờ thanh toán</option>
                <option value="failed">❌ Thất bại</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#374151' }}>Sắp xếp theo</label>
              <select
                value={`${sortField}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortField(field as SortField);
                  setSortOrder(order as SortOrder);
                }}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                style={isDarkMode ? { backgroundColor: '#23272f', color: '#fff', borderColor: '#374151' } : {}}
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
      )}

      {/* Orders Display */}
      {viewMode === 'table' ? (
        /* Table View */
        <div className="rounded-xl shadow-sm border border-gray-200 overflow-hidden" style={isDarkMode ? { backgroundColor: '#18181b' } : { backgroundColor: '#fff' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200" style={isDarkMode ? { backgroundColor: '#23272f' } : { backgroundColor: '#f9fafb' }}>
                <tr>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center gap-1">
                      Mã đơn {getSortIcon('id')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('customerName')}
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
                    onClick={() => handleSort('totalAmount')}
                  >
                    <div className="flex items-center gap-1">
                      Tổng tiền {getSortIcon('totalAmount')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('status')}
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
                    onClick={() => handleSort('orderDate')}
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
                {currentOrders.map((order) => (
                  <tr key={order.id} className="transition-colors" style={isDarkMode ? { backgroundColor: '#18181b' } : { backgroundColor: '#fff' }}
                    onMouseEnter={e => { if (isDarkMode) e.currentTarget.style.backgroundColor = '#23272f'; else e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
                    onMouseLeave={e => { if (isDarkMode) e.currentTarget.style.backgroundColor = '#18181b'; else e.currentTarget.style.backgroundColor = '#fff'; }}>
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
                        onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>
                      {formatDateTime(order.orderDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openViewModal(order)}
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
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentOrders.map((order) => (
            <div key={order.id} className="rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1" style={isDarkMode ? { backgroundColor: '#18181b' } : { backgroundColor: '#fff' }}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                  <h3 className="text-lg font-bold" style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}>#{order.id}</h3>
                    {order.trackingCode && (
                      <p className="text-sm" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>{order.trackingCode}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border`}
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
                    >
                      {getStatusText(order.status)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border`}
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
                </div>
                
                <div className="mb-4">
                  <h4 className="font-semibold" style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}>{order.customerName}</h4>
                  <p className="text-sm" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>{order.customerPhone}</p>
                  <p className="text-xs truncate" style={isDarkMode ? { color: '#a1a1aa' } : { color: '#6b7280' }}>{order.customerAddress}</p>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm mb-2" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#374151' }}>
                    {order.items.length} sản phẩm
                  </div>
                  <div className="space-y-1">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex items-center gap-2 text-xs" style={isDarkMode ? { color: '#a1a1aa' } : { color: '#6b7280' }}>
                        {item.image && (
                          <img src={item.image} alt={item.productName} className="w-6 h-6 rounded object-cover" />
                        )}
                        <span className="truncate">{item.productName} x{item.quantity}</span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <div className="text-xs" style={isDarkMode ? { color: '#71717a' } : { color: '#a1a1aa' }}>+{order.items.length - 2} sản phẩm khác</div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>
                    {formatDate(order.orderDate)}
                  </div>
                  <div className="text-lg font-bold" style={isDarkMode ? { color: '#4ade80' } : { color: '#16a34a' }}>
                    {formatPrice(order.totalAmount)}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => openViewModal(order)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Xem chi tiết
                  </button>
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
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
              <div className="text-6xl mb-4" style={isDarkMode ? { color: '#71717a' } : { color: '#a1a1aa' }}>📦</div>
              <h3 className="text-lg font-medium mb-2" style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}>Không tìm thấy đơn hàng</h3>
              <p style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>
                {search ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc' : 'Chưa có đơn hàng nào'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        startIndex={startIndex}
        endIndex={endIndex}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(newItemsPerPage) => {
          setItemsPerPage(newItemsPerPage);
          setCurrentPage(1);
        }}
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              <span className="text-gray-700">Đang cập nhật...</span>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {showView && viewOrder && (
        <ViewOrderModal
          show={showView}
          order={viewOrder}
          isDarkMode={isDarkMode}
          onClose={() => {
            setShowView(false);
            setViewOrder(null);
          }}
        />
      )}
    </div>
  );
};

// Order Detail Modal Component
const ViewOrderModal: React.FC<{show: boolean, order: Order, isDarkMode: boolean, onClose: () => void}> = ({ show, order, isDarkMode, onClose }) => {
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
      case 'cod': return 'Thanh toán khi nhận hàng';
      case 'banking': return 'Chuyển khoản ngân hàng';
      case 'wallet': return 'Ví điện tử';
      default: return method;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        style={isDarkMode ? { backgroundColor: '#18181b', color: '#fff' } : { backgroundColor: '#fff' }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}>Chi tiết đơn hàng #{order.id}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors"
              style={isDarkMode ? { backgroundColor: '#23272f', color: '#fff' } : { backgroundColor: '#f3f4f6', color: '#111827' }}
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Info */}
            <div className="space-y-4">
              <div
                className="rounded-lg p-4"
                style={isDarkMode ? { backgroundColor: '#23272f', color: '#fff' } : { backgroundColor: '#f9fafb' }}
              >
                <h3 className="font-semibold mb-3" style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}>Thông tin đơn hàng</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>Mã đơn hàng:</span>
                    <span className="font-medium">#{order.id}</span>
                  </div>
                  {order.trackingCode && (
                    <div className="flex justify-between">
                      <span style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>Mã vận đơn:</span>
                      <span className="font-medium">{order.trackingCode}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>Ngày đặt:</span>
                    <span>{new Date(order.orderDate).toLocaleString('vi-VN')}</span>
                  </div>
                  {order.deliveryDate && (
                    <div className="flex justify-between">
                      <span style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>Ngày giao:</span>
                      <span>{new Date(order.deliveryDate).toLocaleString('vi-VN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>Trạng thái:</span>
                    <span className="font-medium">{getStatusText(order.status)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>Thanh toán:</span>
                    <span>{getPaymentMethodText(order.paymentMethod)}</span>
                  </div>
                </div>
              </div>

              <div
                className="rounded-lg p-4"
                style={isDarkMode ? { backgroundColor: '#23272f', color: '#fff' } : { backgroundColor: '#f9fafb' }}
              >
                <h3 className="font-semibold mb-3" style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}>Thông tin khách hàng</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>Họ tên:</span>
                    <span className="font-medium">{order.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>Email:</span>
                    <span>{order.customerEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>Điện thoại:</span>
                    <span>{order.customerPhone}</span>
                  </div>
                  <div>
                    <span style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>Địa chỉ:</span>
                    <p className="mt-1">{order.customerAddress}</p>
                  </div>
                  {order.notes && (
                    <div>
                      <span style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>Ghi chú:</span>
                      <p className="mt-1 italic">{order.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <div
                className="rounded-lg p-4"
                style={isDarkMode ? { backgroundColor: '#23272f', color: '#fff' } : { backgroundColor: '#f9fafb' }}
              >
                <h3 className="font-semibold mb-3" style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}>Sản phẩm đã đặt</h3>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id}
                      className="flex items-center gap-3 rounded-lg p-3"
                      style={isDarkMode ? { backgroundColor: '#18181b', color: '#fff' } : { backgroundColor: '#fff' }}
                    >
                      {item.image && (
                        <img src={item.image} alt={item.productName} className="w-12 h-12 rounded-lg object-cover" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium" style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}>{item.productName}</h4>
                        <div className="text-sm" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>
                          Số lượng: {item.quantity} × {formatPrice(item.price)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold" style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}>
                          {formatPrice(item.quantity * item.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t mt-4 pt-4" style={isDarkMode ? { borderColor: '#374151' } : { borderColor: '#e5e7eb' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold" style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}>Tổng cộng:</span>
                    <span className="text-xl font-bold" style={isDarkMode ? { color: '#4ade80' } : { color: '#16a34a' }}>{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg transition-colors"
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

export default AdminOrders;
