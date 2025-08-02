import React, { useState, useMemo, useEffect } from 'react';
import type { Order } from '../../data/Admin/orders';
import orderService from '../../services/orderService';
import Pagination from '../../components/Admin/Product/Pagination';

type SortField = 'id' | 'customerName' | 'orderDate' | 'totalAmount' | 'status';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'table' | 'grid';
type FilterStatus = 'all' | 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
type FilterPayment = 'all' | 'pending' | 'paid' | 'failed';

// Helper function to map API status to UI status
const mapOrderStatus = (apiStatus: string): 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled' => {
  switch (apiStatus) {
    case 'pending': return 'pending';
    case 'confirmed': return 'confirmed';
    case 'preparing': return 'confirmed';
    case 'shipping': return 'shipping';
    case 'delivered': return 'delivered';
    case 'cancelled': return 'cancelled';
    case 'returned': return 'cancelled';
    default: return 'pending';
  }
};

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
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
  const [error, setError] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  
  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await orderService.getAllOrders({ page: 1, limit: 100 });
        console.log('API Response:', response);
        
        if (response && response.orders) {
          // Convert API orders to UI format
          const convertedOrders: Order[] = response.orders.map((order: any, index: number) => ({
            id: parseInt(order._id.slice(-6), 16) || index + 1000,
            orderNumber: order._id,
            orderDate: order.createdAt,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone,
            customerAddress: order.customerAddress,
            items: order.items.map((item: any) => ({
              id: parseInt(item.productId._id?.slice(-6), 16) || Math.random(),
              productName: item.productName,
              price: item.price,
              quantity: item.quantity,
              image: item.image || item.productId?.images?.[0] || '',
            })),
            subtotal: order.subtotal,
            shippingFee: order.deliveryFee || 0,
            discount: order.voucherDiscount || 0,
            totalAmount: order.totalAmount,
            paymentMethod: order.paymentMethod as 'cod' | 'banking' | 'wallet',
            paymentStatus: order.paymentStatus as 'pending' | 'paid' | 'failed',
            status: mapOrderStatus(order.status),
            notes: order.notes || '',
            trackingCode: order.trackingCode || order._id.slice(-8).toUpperCase(),
            lastUpdated: order.updatedAt,
            shippingInfo: {
              address: order.customerAddress,
              estimatedDelivery: order.deliveryDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
              courier: 'GreenMart Express'
            }
          }));
          
          setOrders(convertedOrders);
          setLastRefresh(new Date());
        }
      } catch (err: any) {
        console.error('Failed to fetch orders:', err);
        setError(`Không thể tải dữ liệu đơn hàng: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);
  
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
    let filtered = orders.filter((order: Order) => {
      const matchesSearch = order.customerName.toLowerCase().includes(search.toLowerCase()) ||
                          order.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
                          order.customerPhone.includes(search) ||
                          order.id.toString().includes(search) ||
                          order.trackingCode?.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      const matchesPayment = filterPayment === 'all' || order.paymentStatus === filterPayment;
      
      return matchesSearch && matchesStatus && matchesPayment;
    });

    filtered.sort((a: Order, b: Order) => {
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

  const handleStatusChange = async (orderId: number, newStatus: Order['status']) => {
    try {
      setIsLoading(true);
      
      // Find the order to get the real MongoDB ObjectId
      const orderToUpdate = orders.find((order: Order) => order.id === orderId);
      if (!orderToUpdate || !orderToUpdate.orderNumber) {
        setError('Không tìm thấy đơn hàng để cập nhật');
        return;
      }
      
      await orderService.updateOrderStatus(orderToUpdate.orderNumber, newStatus);
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map((order: Order) => 
          order.id === orderId ? { 
            ...order, 
            status: newStatus,
            trackingCode: newStatus === 'confirmed' && !order.trackingCode 
              ? `GM${new Date().toISOString().slice(0,10).replace(/-/g, '')}${orderId.toString().padStart(4, '0')}`
              : order.trackingCode,
            lastUpdated: new Date().toISOString()
          } : order
        )
      );
      
      setError(null);
    } catch (err: any) {
      console.error('Failed to update order status:', err);
      setError(`Không thể cập nhật trạng thái: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Bulk actions handlers
  const handleSelectAll = () => {
    if (selectedOrders.length === currentOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(currentOrders.map(order => order.id));
    }
  };

  const handleSelectOrder = (orderId: number) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  const handleBulkStatusUpdate = async (newStatus: Order['status']) => {
    if (selectedOrders.length === 0) return;
    
    setIsLoading(true);
    try {
      // Update multiple orders via API
      const promises = selectedOrders.map(orderId => {
        const order = orders.find((o: Order) => o.id === orderId);
        if (order?.orderNumber) {
          return orderService.updateOrderStatus(order.orderNumber, newStatus);
        }
        return Promise.resolve();
      });
      
      await Promise.all(promises);
      
      setOrders(prevOrders => 
        prevOrders.map((order: Order) => 
          selectedOrders.includes(order.id) ? { 
            ...order, 
            status: newStatus,
            lastUpdated: new Date().toISOString()
          } : order
        )
      );
      
      setSelectedOrders([]);
    } catch (err: any) {
      setError(`Không thể cập nhật hàng loạt: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Mã đơn hàng', 'Khách hàng', 'Email', 'Điện thoại', 'Địa chỉ', 'Tổng tiền', 'Trạng thái', 'Phương thức thanh toán', 'Trạng thái thanh toán', 'Ngày đặt', 'Ghi chú'].join(','),
      ...orders.map((order: Order) => [
        order.id,
        `"${order.customerName}"`,
        order.customerEmail,
        order.customerPhone,
        `"${order.customerAddress}"`,
        order.totalAmount,
        order.status,
        order.paymentMethod,
        order.paymentStatus,
        new Date(order.orderDate).toLocaleDateString('vi-VN'),
        `"${order.notes || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportModal(false);
  };

  const exportOrderDetails = () => {
    const detailedData = orders.flatMap((order: Order) => 
      order.items.map((item: any) => ({
        'Mã đơn hàng': order.id,
        'Khách hàng': order.customerName,
        'Sản phẩm': item.productName,
        'Số lượng': item.quantity,
        'Đơn giá': item.price,
        'Thành tiền': item.quantity * item.price,
        'Trạng thái đơn hàng': order.status,
        'Ngày đặt': new Date(order.orderDate).toLocaleDateString('vi-VN')
      }))
    );

    const csvContent = [
      Object.keys(detailedData[0] || {}).join(','),
      ...detailedData.map((row: any) => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `order_details_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportModal(false);
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const response = await orderService.getAllOrders({ page: 1, limit: 100 });
      console.log('Refresh API Response:', response);
      
        if (response && response.orders) {
          // Re-use the same conversion logic
          const convertedOrders: Order[] = response.orders.map((order: any, index: number) => ({
            id: parseInt(order._id.slice(-6), 16) || index + 1000,
            orderNumber: order._id,
            orderDate: order.createdAt,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone,
            customerAddress: order.customerAddress,
            items: order.items.map((item: any) => ({
              id: parseInt(item.productId._id?.slice(-6), 16) || Math.random(),
              productName: item.productName,
              price: item.price,
              quantity: item.quantity,
              image: item.image || item.productId?.images?.[0] || '',
            })),
            subtotal: order.subtotal,
            shippingFee: order.deliveryFee || 0,
            discount: order.voucherDiscount || 0,
            totalAmount: order.totalAmount,
            paymentMethod: order.paymentMethod as 'cod' | 'banking' | 'wallet',
            paymentStatus: order.paymentStatus as 'pending' | 'paid' | 'failed',
            status: mapOrderStatus(order.status),
            notes: order.notes || '',
            trackingCode: order.trackingCode || order._id.slice(-8).toUpperCase(),
            lastUpdated: order.updatedAt,
            shippingInfo: {
              address: order.customerAddress,
              estimatedDelivery: order.deliveryDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
              courier: 'GreenMart Express'
            }
          }));        setOrders(convertedOrders);
        setLastRefresh(new Date());
        setError(null);
      }
    } catch (err: any) {
      setError(`Không thể làm mới dữ liệu: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const openViewModal = (order: Order) => {
    setViewOrder(order);
    setShowView(true);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
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
  const pendingOrders = orders.filter((o: Order) => o.status === 'pending').length;
  const shippingOrders = orders.filter((o: Order) => o.status === 'shipping').length;
  const totalRevenue = orders.filter((o: Order) => o.status === 'delivered').reduce((sum: number, o: Order) => sum + o.totalAmount, 0);
  const todayOrders = orders.filter((o: Order) => 
    new Date(o.orderDate).toDateString() === new Date().toDateString()
  ).length;
  const todayRevenue = orders.filter((o: Order) => 
    new Date(o.orderDate).toDateString() === new Date().toDateString() && o.status === 'delivered'
  ).reduce((sum: number, o: Order) => sum + o.totalAmount, 0);

  return (
    <div
      className="min-h-screen"
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
              <span>Hôm nay: <span className="font-semibold" style={{ color: '#f97316' }}>{todayOrders}</span> đơn</span>
              <span>Doanh thu: <span className="font-semibold" style={{ color: '#22c55e' }}>{formatPrice(totalRevenue)}</span></span>
              <span>DT hôm nay: <span className="font-semibold" style={{ color: '#16a34a' }}>{formatPrice(todayRevenue)}</span></span>
              <span className="text-xs">
                Cập nhật: {lastRefresh.toLocaleTimeString('vi-VN')}
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">{
            
            error && (
              <div className="px-3 py-2 rounded-lg text-sm bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200">
                {error}
              </div>
            )}
            
            <button
              onClick={refreshData}
              className="px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
              style={isDarkMode ? { backgroundColor: '#059669', color: '#fff' } : { backgroundColor: '#10b981', color: '#fff' }}
              disabled={isLoading}
            >
              <span>🔄</span>
              Làm mới
            </button>
            
            <button
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
              style={isDarkMode ? { backgroundColor: '#16a34a', color: '#fff' } : { backgroundColor: '#22c55e', color: '#fff' }}
            >
              <span>📊</span>
              Xuất báo cáo
            </button>
            
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

      {/* Bulk Actions Bar */}
      {selectedOrders.length > 0 && (
        <div className="rounded-xl shadow-sm border border-gray-200 p-4 mb-6" style={isDarkMode ? { backgroundColor: '#18181b', borderColor: '#374151' } : { backgroundColor: '#fff' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#374151' }}>
                Đã chọn {selectedOrders.length} đơn hàng
              </span>
              <button
                onClick={() => setSelectedOrders([])}
                className="text-sm underline"
                style={isDarkMode ? { color: '#60a5fa' } : { color: '#2563eb' }}
              >
                Bỏ chọn tất cả
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkStatusUpdate('confirmed')}
                className="px-3 py-1.5 rounded-lg text-sm transition-colors"
                style={isDarkMode ? { backgroundColor: '#1d4ed8', color: '#fff' } : { backgroundColor: '#3b82f6', color: '#fff' }}
              >
                Xác nhận
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('shipping')}
                className="px-3 py-1.5 rounded-lg text-sm transition-colors"
                style={isDarkMode ? { backgroundColor: '#7c3aed', color: '#fff' } : { backgroundColor: '#8b5cf6', color: '#fff' }}
              >
                Chuyển giao hàng
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('delivered')}
                className="px-3 py-1.5 rounded-lg text-sm transition-colors"
                style={isDarkMode ? { backgroundColor: '#16a34a', color: '#fff' } : { backgroundColor: '#22c55e', color: '#fff' }}
              >
                Hoàn thành
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('cancelled')}
                className="px-3 py-1.5 rounded-lg text-sm transition-colors"
                style={isDarkMode ? { backgroundColor: '#dc2626', color: '#fff' } : { backgroundColor: '#ef4444', color: '#fff' }}
              >
                Hủy đơn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Display */}
        {isLoading ? (
        <div className="rounded-xl shadow-sm border border-gray-200 p-8 text-center" style={isDarkMode ? { backgroundColor: '#18181b' } : { backgroundColor: '#fff' }}>
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>
              Đang tải dữ liệu từ API...
            </p>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="rounded-xl shadow-sm border border-gray-200 overflow-hidden" style={isDarkMode ? { backgroundColor: '#18181b' } : { backgroundColor: '#fff' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200" style={isDarkMode ? { backgroundColor: '#23272f' } : { backgroundColor: '#f9fafb' }}>
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === currentOrders.length && currentOrders.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </th>
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
                {currentOrders.map((order: Order) => (
                  <tr key={order.id}
                    style={{ ...isDarkMode ? { backgroundColor: '#18181b' } : { backgroundColor: '#fff' }, transition: 'none' }}
                    onMouseEnter={e => { if (isDarkMode) e.currentTarget.style.backgroundColor = '#23272f'; else e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
                    onMouseLeave={e => { if (isDarkMode) e.currentTarget.style.backgroundColor = '#18181b'; else e.currentTarget.style.backgroundColor = '#fff'; }}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
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
          {currentOrders.map((order: Order) => (
            <div key={order.id} className="rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1" style={isDarkMode ? { backgroundColor: '#18181b' } : { backgroundColor: '#fff' }}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleSelectOrder(order.id)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <div>
                      <h3 className="text-lg font-bold" style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}>#{order.id}</h3>
                      {order.trackingCode && (
                        <p className="text-sm" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>{order.trackingCode}</p>
                      )}
                    </div>
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
                    {order.items.slice(0, 2).map((item: any) => (
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
      {!isLoading && (
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
      )}

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

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          show={showExportModal}
          isDarkMode={isDarkMode}
          onClose={() => setShowExportModal(false)}
          onExportOrders={exportToCSV}
          onExportDetails={exportOrderDetails}
          totalOrders={orders.length}
        />
      )}
    </div>
  );
};

// Export Modal Component
const ExportModal: React.FC<{
  show: boolean;
  isDarkMode: boolean;
  onClose: () => void;
  onExportOrders: () => void;
  onExportDetails: () => void;
  totalOrders: number;
}> = ({ show, isDarkMode, onClose, onExportOrders, onExportDetails, totalOrders }) => {
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
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <h3 className="font-semibold">Xuất danh sách đơn hàng</h3>
                    <p className="text-sm" style={isDarkMode ? { color: '#a1a1aa' } : { color: '#6b7280' }}>
                      File CSV chứa thông tin tổng quan các đơn hàng
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={onExportDetails}
                className="w-full p-4 rounded-lg border text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                style={isDarkMode ? { backgroundColor: '#23272f', borderColor: '#374151', color: '#fff' } : { backgroundColor: '#fff', borderColor: '#d1d5db' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📋</span>
                  <div>
                    <h3 className="font-semibold">Xuất chi tiết sản phẩm</h3>
                    <p className="text-sm" style={isDarkMode ? { color: '#a1a1aa' } : { color: '#6b7280' }}>
                      File CSV chi tiết từng sản phẩm trong đơn hàng
                    </p>
                  </div>
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
