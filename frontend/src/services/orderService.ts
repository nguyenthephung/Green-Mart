// Order Service for Frontend Integration
import { apiClient } from './api';

export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    name: string;
    image?: string;
    flashSale?: {
      flashSaleId: string;
      isFlashSale: boolean;
      originalPrice: number;
      discountPercentage: number;
    };
  }>;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    ward: string;
    district: string;
    province: string;
  };
  paymentMethod: string;
  voucherCode?: string;
  notes?: string;
  shippingFee?: number;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data?: {
    orderId: string;
    orderNumber: string;
    totalAmount: number;
    paymentMethod: string;
  };
}

export interface OrderDetails {
  _id: string;
  orderNumber: string;
  userId: string;
  items: Array<{
    productId: {
      _id: string;
      name: string;
      images?: string[];
      price: number;
    };
    quantity: number;
    price: number;
    name: string;
    image?: string;
  }>;
  subtotal: number;
  discount: number;
  shippingFee: number;
  totalAmount: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    ward: string;
    district: string;
    province: string;
  };
  paymentMethod: string;
  voucherId?: {
    _id: string;
    code: string;
    discountType: 'percent' | 'amount';
    discountValue: number;
  };
  paymentId?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'shipping' | 'delivered' | 'cancelled' | 'returned';
  paymentStatus: 'unpaid' | 'paid' | 'refunded' | 'partially_refunded';
  createdAt: string;
  updatedAt: string;
  deliveryDate?: string;
}

export interface OrderHistory {
  orders: OrderDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class OrderService {
  private readonly BASE_URL = '/orders';

  // Create a new order
  async createOrder(orderData: CreateOrderRequest): Promise<OrderResponse> {
    try {
      const response = await apiClient<OrderResponse>(this.BASE_URL, {
        method: 'POST',
        body: JSON.stringify(orderData)
      });
      // Return the response directly as it already has the correct structure
      return response as OrderResponse;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create order');
    }
  }

  // Get order details by ID (public tracking)
  async getOrder(orderId: string): Promise<OrderDetails> {
    try {
      // First try public tracking route (no auth required)
      const response = await apiClient<OrderDetails>(`${this.BASE_URL}/track/${orderId}`);
      return response.data!;
    } catch (error: any) {
      // If tracking fails, try authenticated route as fallback
      try {
        const authResponse = await apiClient<OrderDetails>(`${this.BASE_URL}/${orderId}`);
        return authResponse.data!;
      } catch (authError: any) {
        throw new Error(error.message || 'Failed to get order details');
      }
    }
  }

  // Get user's order history
  async getOrderHistory(params?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
  }): Promise<OrderHistory> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus);
      
      const url = `${this.BASE_URL}/history${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await apiClient<{success: boolean, data: OrderHistory}>(url);
      
      // Handle different response structures
      if ((response as any).data?.orders) {
        return (response as any).data;
      } else if (response.success && (response as any).data) {
        return (response as any).data;
      } else if ((response as any).orders) {
        // Direct response structure
        return response as unknown as OrderHistory;
      } else {
        // Empty fallback
        return { orders: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } };
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get order history');
    }
  }

  // Get all orders (admin only)
  async getAllOrders(params?: { 
    page?: number; 
    limit?: number; 
    status?: string; 
    paymentStatus?: string; 
    startDate?: string; 
    endDate?: string; 
  }): Promise<OrderHistory> {
  try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);

      const url = `${this.BASE_URL}/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient<any>(url);
      // Handle the response structure from backend
      if ((response as any).orders && (response as any).pagination) {
        return {
          orders: (response as any).orders,
          pagination: (response as any).pagination
        };
      } else if (response.data?.orders) {
        return response.data;
      } else if (response.success && (response as any).orders) {
        return {
          orders: (response as any).orders,
          pagination: (response as any).pagination || { page: 1, limit: 20, total: 0, pages: 0 }
        };
      } else {
        // Empty fallback
        return { orders: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } };
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get all orders');
    }
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    try {
      await apiClient(`${this.BASE_URL}/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update order status');
    }
  }

  // Cancel order
  async cancelOrder(orderId: string, reason?: string): Promise<void> {
    try {
      await apiClient(`${this.BASE_URL}/${orderId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to cancel order');
    }
  }

  // Get order status display info
  getOrderStatusInfo(status: string) {
    const statusMap = {
      pending: {
        label: 'Chờ xác nhận',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        icon: '⏳'
      },
      confirmed: {
        label: 'Đã xác nhận',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        icon: '✅'
      },
      preparing: {
        label: 'Đang chuẩn bị',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        icon: '📦'
      },
      shipping: {
        label: 'Đang giao hàng',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
        icon: '🚚'
      },
      delivered: {
        label: 'Đã giao hàng',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: '✅'
      },
      cancelled: {
        label: 'Đã hủy',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: '❌'
      },
      returned: {
        label: 'Đã trả hàng',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        icon: '↩️'
      }
    };

    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  }

  // Get payment status display info
  getPaymentStatusInfo(status: string) {
    const statusMap = {
      unpaid: {
        label: 'Chưa thanh toán',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: '💳'
      },
      paid: {
        label: 'Đã thanh toán',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: '✅'
      },
      refunded: {
        label: 'Đã hoàn tiền',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        icon: '↩️'
      },
      partially_refunded: {
        label: 'Hoàn tiền một phần',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        icon: '↪️'
      }
    };

    return statusMap[status as keyof typeof statusMap] || statusMap.unpaid;
  }
}

export default new OrderService();
