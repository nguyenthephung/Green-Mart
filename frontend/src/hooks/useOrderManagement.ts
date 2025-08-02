import { useState, useEffect, useMemo } from 'react';
import type { Order, SortField, SortOrder, FilterStatus, FilterPayment, FilterPaymentMethod } from '../types/order';
import orderService from '../services/orderService';

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

  // Convert API orders to UI format
  const convertApiOrdersToUI = (apiOrders: any[]): Order[] => {
    return apiOrders.map((order: any, index: number) => ({
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
      paymentMethod: order.paymentMethod as 'cod' | 'momo' | 'bank_transfer' | 'credit_card',
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
  };

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await orderService.getAllOrders({ page: 1, limit: 100 });
      
      if (response && response.orders) {
        const convertedOrders = convertApiOrdersToUI(response.orders);
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

  // Refresh data
  const refreshData = async () => {
    await fetchOrders();
  };

  // Update order status
  const handleStatusChange = async (orderId: number, newStatus: Order['status']) => {
    try {
      setIsLoading(true);
      
      const orderToUpdate = orders.find((order: Order) => order.id === orderId);
      if (!orderToUpdate || !orderToUpdate.orderNumber) {
        setError('Không tìm thấy đơn hàng để cập nhật');
        return;
      }
      
      await orderService.updateOrderStatus(orderToUpdate.orderNumber, newStatus);
      await refreshData();
      setError(null);
    } catch (err: any) {
      console.error('Failed to update order status:', err);
      setError(`Không thể cập nhật trạng thái: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

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
      const matchesPaymentMethod = filterPaymentMethod === 'all' || order.paymentMethod === filterPaymentMethod;
      
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
    refreshData
  };
};
