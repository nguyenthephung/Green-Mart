import { useState, useEffect, useMemo } from 'react';
import type {
  Order,
  SortField,
  SortOrder,
  FilterStatus,
  FilterPayment,
  FilterPaymentMethod,
} from '../types/order';
import orderService from '../services/orderService';

// Helper function to map API status to UI status
const mapOrderStatus = (
  apiStatus: string
): 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled' => {
  switch (apiStatus) {
    case 'pending':
      return 'pending';
    case 'confirmed':
      return 'confirmed';
    case 'preparing':
      return 'confirmed';
    case 'shipping':
      return 'shipping';
    case 'delivered':
      return 'delivered';
    case 'cancelled':
      return 'cancelled';
    case 'returned':
      return 'cancelled';
    default:
      return 'pending';
  }
};

export const useOrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('orderDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterPayment, setFilterPayment] = useState<FilterPayment>('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<FilterPaymentMethod>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Fetch orders from API
  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Optimized: fetch fewer orders initially, implement pagination if needed
      const response = await orderService.getAllOrders({ page: 1, limit: 100 });

      if (response && response.orders) {
        // Add safety check for orders array and optimize processing
        const validOrders = response.orders.filter((order: any) => order && order._id);

        // Memoize the conversion to avoid reprocessing on every render
        const convertedOrders = validOrders.map((order: any, index: number) => {
          try {
            return {
              id: order._id,
              orderNumber: order._id || `ORDER-${index}`,
              orderDate: order.createdAt || order.orderDate || new Date().toISOString(),
              // Handle both user orders and guest orders
              customerName:
                order.customerName || order.guestInfo?.name || order.userId?.name || 'Khách hàng',
              customerEmail:
                order.customerEmail || order.guestInfo?.email || order.userId?.email || '',
              customerPhone:
                order.customerPhone || order.guestInfo?.phone || order.userId?.phone || '',
              customerAddress: order.customerAddress || order.guestInfo?.address || '',
              items: (order.items || []).map((item: any) => ({
                // Handle both populated and non-populated productId
                id: item.productId?._id ? item.productId._id : Math.random().toString(),
                productName: item.productName || item.name || item.productId?.name || 'Sản phẩm',
                price: item.price || 0,
                quantity: item.quantity || 1,
                image: item.image || item.productId?.images?.[0] || '',
              })),
              subtotal: order.subtotal || 0,
              shippingFee: order.deliveryFee || order.shippingFee || 0,
              discount: order.voucherDiscount || 0,
              totalAmount: order.totalAmount || 0,
              paymentMethod: order.paymentMethod as
                | 'cod'
                | 'momo'
                | 'bank_transfer'
                | 'credit_card',
              paymentStatus: order.paymentStatus as 'pending' | 'paid' | 'failed',
              status: mapOrderStatus(order.status),
              notes: order.notes || '',
              trackingCode: order.trackingCode || order._id?.slice(-8).toUpperCase() || 'N/A',
              lastUpdated: order.updatedAt || order.createdAt || new Date().toISOString(),
              shippingInfo: {
                address: order.customerAddress || order.guestInfo?.address || '',
                estimatedDelivery:
                  order.deliveryDate ||
                  new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                courier: 'GreenMart Express',
              },
            };
          } catch (error) {
            console.error('Error processing order:', error, order);
            // Return a fallback order object
            return {
              id: index + 1000,
              orderNumber: `ERROR-${index}`,
              orderDate: new Date().toISOString(),
              customerName: 'Lỗi dữ liệu',
              customerEmail: '',
              customerPhone: '',
              customerAddress: '',
              items: [],
              subtotal: 0,
              shippingFee: 0,
              discount: 0,
              totalAmount: 0,
              paymentMethod: 'cod' as const,
              paymentStatus: 'pending' as const,
              status: 'pending' as const,
              notes: '',
              trackingCode: '',
              lastUpdated: new Date().toISOString(),
              shippingInfo: {
                address: '',
                estimatedDelivery: new Date().toISOString(),
                courier: 'GreenMart Express',
              },
            };
          }
        });

        setOrders(convertedOrders);
        setLastRefresh(new Date());
      } else {
        console.warn('No orders data received from API');
        setOrders([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
      setError(`Không thể tải dữ liệu đơn hàng: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh data
  const refreshData = async () => {
    await fetchOrders();
  };

  // Batch update multiple orders (for bulk operations)
  const batchUpdateOrders = async (
    updates: Array<{ orderId: number; newStatus: Order['status'] }>
  ) => {
    try {
      setIsLoading(true);

      // Apply optimistic updates
      const optimisticOrders = [...orders];
      for (const update of updates) {
        const orderIndex = optimisticOrders.findIndex(order => order.id === update.orderId);
        if (orderIndex !== -1) {
          optimisticOrders[orderIndex] = {
            ...optimisticOrders[orderIndex],
            status: update.newStatus,
            lastUpdated: new Date().toISOString(),
          };
        }
      }
      setOrders(optimisticOrders);

      // Execute all updates
      const updatePromises = updates.map(async update => {
        const orderToUpdate = orders.find(order => order.id === update.orderId);
        if (orderToUpdate?.orderNumber) {
          return orderService.updateOrderStatus(orderToUpdate.orderNumber, update.newStatus);
        }
      });

      await Promise.all(updatePromises);
      setError(null);
    } catch (err: any) {
      console.error('Failed to batch update orders:', err);
      setError(`Không thể cập nhật hàng loạt: ${err.message}`);

      // Revert on error and refresh
      await refreshData();
    } finally {
      setIsLoading(false);
    }
  };

  // Update order status
  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    const orderToUpdate = orders.find(
      (order: Order) => order.id === orderId || order.orderNumber === orderId
    );
    console.log(
      '[Order Status Change] orderId:',
      orderId,
      'newStatus:',
      newStatus,
      'orderToUpdate:',
      orderToUpdate
    );
    if (!orderToUpdate || !orderToUpdate.orderNumber) {
      setError('Không tìm thấy đơn hàng để cập nhật');
      return;
    }

    // Optimistically update the local state first
    const optimisticOrders = orders.map((order: Order) =>
      order.id === orderId
        ? { ...order, status: newStatus, lastUpdated: new Date().toISOString() }
        : order
    );
    setOrders(optimisticOrders);

    try {
      // Then update on the server
      await orderService.updateOrderStatus(orderToUpdate.orderNumber, newStatus);
      setError(null);
    } catch (err: any) {
      console.error('Failed to update order status:', err);
      setError(`Không thể cập nhật trạng thái: ${err.message}`);
      await refreshData();
    }
  };

  // Filter and sort logic
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders.filter((order: Order) => {
      const matchesSearch =
        order.customerName.toLowerCase().includes(search.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
        order.customerPhone.includes(search) ||
        order.id.toString().includes(search) ||
        order.trackingCode?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      const matchesPayment = filterPayment === 'all' || order.paymentStatus === filterPayment;
      const matchesPaymentMethod =
        filterPaymentMethod === 'all' || order.paymentMethod === filterPaymentMethod;

      return matchesSearch && matchesStatus && matchesPayment && matchesPaymentMethod;
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
  }, [orders, search, sortField, sortOrder, filterStatus, filterPayment, filterPaymentMethod]);

  // Initialize data fetch
  useEffect(() => {
    fetchOrders();
  }, []);

  return {
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
    setError,
    lastRefresh,
    handleStatusChange,
    batchUpdateOrders,
    refreshData,
  };
};
