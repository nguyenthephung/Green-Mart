import React, { useState } from 'react';
import type { Order, ViewMode, SortField } from '../../types/order';
import { useOrderManagement } from '../../hooks/useOrderManagement';
import { usePagination } from '../../hooks/usePagination';
import PaginationControls from '../../components/ui/PaginationControls';
import { LoadingSpinner } from '../../components/Loading';
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
  const [selectedOrders, setSelectedOrders] = useState<(string|number)[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  
  // Use pagination hook
  const pagination = usePagination({
    data: filteredAndSortedOrders,
    itemsPerPage: 10,
    initialPage: 1
  });

  // Dark mode observer
  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

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
    if (selectedOrders.length === pagination.currentData.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(pagination.currentData.map((order: Order) => order.id));
    }
  };

  const handleSelectOrder = (orderId: string | number) => {
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
        await handleStatusChange(orderId.toString(), newStatus);
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
      case 'unpaid': return 'Chưa thanh toán';
      default: return status;
    }
  };

  const getPaymentMethodText = (method: Order['paymentMethod']) => {
    switch (method) {
      case 'cod': return 'Thanh toán khi nhận hàng';
      case 'momo': return 'Ví MoMo';
      case 'bank_transfer': return 'Chuyển khoản ngân hàng';
      case 'credit_card': return 'Thẻ tín dụng';
      case 'paypal': return 'PayPal';
      default: return method;
    }
  };

  const getPaymentMethodIcon = (method: Order['paymentMethod']) => {
    switch (method) {
      case 'cod': return '💰';
      case 'momo': return '🔶';
      case 'bank_transfer': return '🏦';
      case 'credit_card': return '💳';
      case 'paypal': return '🅿️';
      default: return '💳';
    }
  };

  const getPaymentMethodColor = (method: Order['paymentMethod']) => {
    switch (method) {
      case 'cod': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'momo': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'bank_transfer': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'credit_card': return 'bg-green-100 text-green-800 border-green-200';
      case 'paypal': return 'bg-blue-100 text-blue-800 border-blue-200';
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
          currentOrders={pagination.currentData}
          selectedOrders={selectedOrders}
          sortField={sortField}
          onSelectAll={handleSelectAll}
          onSelectOrder={handleSelectOrder}
          onSort={handleSort}
          onStatusChange={(orderId, status) => handleStatusChange(orderId.toString(), status)}
          onViewOrder={openViewModal}
          getSortIcon={getSortIcon}
          getPaymentMethodText={getPaymentMethodText}
          getPaymentMethodIcon={getPaymentMethodIcon}
          getPaymentMethodColor={getPaymentMethodColor}
          getPaymentText={getPaymentText}
          formatPrice={formatPrice}
          formatDateTime={formatDateTime}
          totalItems={filteredAndSortedOrders.length}
          search={search}
        />
      ) : (
        <OrderGridView
          isDarkMode={isDarkMode}
          currentOrders={pagination.currentData}
          selectedOrders={selectedOrders}
          onSelectOrder={handleSelectOrder}
          onStatusChange={(orderId, status) => handleStatusChange(orderId.toString(), status)}
          onViewOrder={openViewModal}
          getStatusText={getStatusText}
          getPaymentText={getPaymentText}
          formatPrice={formatPrice}
          formatDate={formatDate}
          totalItems={filteredAndSortedOrders.length}
          search={search}
        />
      )}

      {/* Pagination */}
      {!isLoading && filteredAndSortedOrders.length > 0 && (
        <PaginationControls
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.goToPage}
          onFirstPage={pagination.goToFirst}
          onLastPage={pagination.goToLast}
          onPrevPage={pagination.prevPage}
          onNextPage={pagination.nextPage}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          itemsPerPage={pagination.itemsPerPage}
          onItemsPerPageChange={pagination.setItemsPerPage}
          totalItems={filteredAndSortedOrders.length}
          startIndex={pagination.startIndex}
          endIndex={pagination.endIndex}
          showItemsPerPage={true}
          className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
        />
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
          <LoadingSpinner
            size="lg"
            text="Đang cập nhật..."
            subText="Vui lòng chờ trong giây lát"
            variant="primary"
          />
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