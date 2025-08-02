import React, { useState } from 'react';
import type { Order, ViewMode, SortField } from '../../types/order';
import { useOrderManagement } from '../../hooks/useOrderManagement';
import Pagination from '../../components/Admin/Product/Pagination';
import OrderHeader from '../../components/Admin/Orders/OrderHeader';
import OrderFilters from '../../components/Admin/Orders/OrderFilters';
import OrderBulkActions from '../../components/Admin/Orders/OrderBulkActions';
import OrderTableView from '../../components/Admin/Orders/OrderTableView';
import OrderGridView from '../../components/Admin/Orders/OrderGridView';
import { ExportModal, ViewOrderModal } from '../../components/Admin/Orders/OrderModals';

const AdminOrders: React.FC = () => {
  // Use custom hook for order management
  const {
    orders,
    filteredAndSortedOrders,
    search,
    setSearch,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    filterStatus,
    setFilterStatus,
    filterPayment,
    setFilterPayment,
    filterPaymentMethod,
    setFilterPaymentMethod,
    isLoading,
    error,
    lastRefresh,
    handleStatusChange,
    refreshData
  } = useOrderManagement();

  // UI state
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [showView, setShowView] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Dark mode observer
  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Pagination calculations
  const totalItems = filteredAndSortedOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredAndSortedOrders.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, filterPayment, filterPaymentMethod, sortField, sortOrder]);

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

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
    
    try {
      await Promise.all(selectedOrders.map(async (orderId) => {
        await handleStatusChange(orderId, newStatus);
      }));
      setSelectedOrders([]);
    } catch (err: any) {
      console.error('Bulk status update failed:', err);
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

  const openViewModal = (order: Order) => {
    setViewOrder(order);
    setShowView(true);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  // Helper functions
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

  const getPaymentMethodText = (method: Order['paymentMethod']) => {
    switch (method) {
      case 'cod': return 'Thanh toán khi nhận hàng';
      case 'momo': return 'Ví MoMo';
      case 'bank_transfer': return 'Chuyển khoản ngân hàng';
      case 'credit_card': return 'Thẻ tín dụng';
      default: return method;
    }
  };

  const getPaymentMethodIcon = (method: Order['paymentMethod']) => {
    switch (method) {
      case 'cod': return '💰';
      case 'momo': return '🔶';
      case 'bank_transfer': return '🏦';
      case 'credit_card': return '💳';
      default: return '💳';
    }
  };

  const getPaymentMethodColor = (method: Order['paymentMethod']) => {
    switch (method) {
      case 'cod': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'momo': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'bank_transfer': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'credit_card': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  // Statistics calculations
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
      <OrderHeader
        isDarkMode={isDarkMode}
        totalOrders={totalOrders}
        pendingOrders={pendingOrders}
        shippingOrders={shippingOrders}
        totalRevenue={totalRevenue}
        todayOrders={todayOrders}
        todayRevenue={todayRevenue}
        lastRefresh={lastRefresh}
        error={error}
        isLoading={isLoading}
        onRefresh={refreshData}
        onExport={() => setShowExportModal(true)}
        onToggleFilters={() => setShowFilters(!showFilters)}
        showFilters={showFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        formatPrice={formatPrice}
      />

      {/* Filters */}
      <OrderFilters
        isDarkMode={isDarkMode}
        showFilters={showFilters}
        search={search}
        filterStatus={filterStatus}
        filterPayment={filterPayment}
        filterPaymentMethod={filterPaymentMethod}
        sortField={sortField}
        sortOrder={sortOrder}
        onSearchChange={setSearch}
        onFilterStatusChange={setFilterStatus}
        onFilterPaymentChange={setFilterPayment}
        onFilterPaymentMethodChange={setFilterPaymentMethod}
        onSortChange={(field, order) => {
          setSortField(field);
          setSortOrder(order);
        }}
        onClearFilters={() => {
          setSearch('');
          setFilterStatus('all');
          setFilterPayment('all');
          setFilterPaymentMethod('all');
          setSortField('orderDate');
          setSortOrder('desc');
        }}
      />

      {/* Bulk Actions Bar */}
      <OrderBulkActions
        isDarkMode={isDarkMode}
        selectedOrders={selectedOrders}
        onClearSelection={() => setSelectedOrders([])}
        onBulkStatusUpdate={handleBulkStatusUpdate}
      />

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
        <OrderTableView
          isDarkMode={isDarkMode}
          currentOrders={currentOrders}
          selectedOrders={selectedOrders}
          sortField={sortField}
          onSelectAll={handleSelectAll}
          onSelectOrder={handleSelectOrder}
          onSort={handleSort}
          onStatusChange={handleStatusChange}
          onViewOrder={openViewModal}
          getSortIcon={getSortIcon}
          getPaymentMethodText={getPaymentMethodText}
          getPaymentMethodIcon={getPaymentMethodIcon}
          getPaymentMethodColor={getPaymentMethodColor}
          getPaymentText={getPaymentText}
          formatPrice={formatPrice}
          formatDateTime={formatDateTime}
          totalItems={totalItems}
          search={search}
        />
      ) : (
        <OrderGridView
          isDarkMode={isDarkMode}
          currentOrders={currentOrders}
          selectedOrders={selectedOrders}
          onSelectOrder={handleSelectOrder}
          onStatusChange={handleStatusChange}
          onViewOrder={openViewModal}
          getStatusText={getStatusText}
          getPaymentText={getPaymentText}
          formatPrice={formatPrice}
          formatDate={formatDate}
          totalItems={totalItems}
          search={search}
        />
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

      {/* Modals */}
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

      <ExportModal
        show={showExportModal}
        isDarkMode={isDarkMode}
        onClose={() => setShowExportModal(false)}
        onExportOrders={exportToCSV}
        onExportDetails={exportOrderDetails}
        totalOrders={orders.length}
      />
    </div>
  );
};

export default AdminOrders;
