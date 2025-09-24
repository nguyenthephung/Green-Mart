// Admin Order Management Service
import { apiClient } from './api';

export interface AdminOrderItem {
  _id: string;
  orderNumber: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  orderDate: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
}

export interface AdminOrderResponse {
  success: boolean;
  message: string;
  data?: {
    orders: AdminOrderItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface UpdateOrderStatusRequest {
  status: string;
  adminNote?: string;
}

export interface UpdateOrderStatusResponse {
  success: boolean;
  message: string;
  data?: {
    orderId: string;
    status: string;
  };
}

class AdminOrderService {
  private readonly BASE_URL = '/orders';

  // Get orders pending admin confirmation
  async getPendingOrders(page: number = 1, limit: number = 20): Promise<AdminOrderResponse> {
    try {
      const response = await apiClient<AdminOrderResponse>(
        `${this.BASE_URL}/pending?page=${page}&limit=${limit}`,
        {
          method: 'GET',
        }
      );
      return response as AdminOrderResponse;
    } catch (error: any) {
      console.error('Get pending orders error:', error);
      throw new Error(error.message || 'Failed to fetch pending orders');
    }
  }

  // Get all orders (with filters)
  async getAllOrders(
    filters: {
      page?: number;
      limit?: number;
      status?: string;
      paymentStatus?: string;
      paymentMethod?: string;
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<AdminOrderResponse> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const queryString = params.toString();
      const url = `${this.BASE_URL}/all${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient<AdminOrderResponse>(url, {
        method: 'GET',
      });
      return response as AdminOrderResponse;
    } catch (error: any) {
      console.error('Get all orders error:', error);
      throw new Error(error.message || 'Failed to fetch orders');
    }
  }

  // Update order status
  async updateOrderStatus(
    orderId: string,
    data: UpdateOrderStatusRequest
  ): Promise<UpdateOrderStatusResponse> {
    try {
      const response = await apiClient<UpdateOrderStatusResponse>(
        `${this.BASE_URL}/${orderId}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify(data),
        }
      );
      return response as UpdateOrderStatusResponse;
    } catch (error: any) {
      console.error('Update order status error:', error);
      throw new Error(error.message || 'Failed to update order status');
    }
  }

  // Cancel order
  async cancelOrder(orderId: string, reason: string): Promise<UpdateOrderStatusResponse> {
    try {
      const response = await apiClient<UpdateOrderStatusResponse>(
        `${this.BASE_URL}/${orderId}/cancel`,
        {
          method: 'POST',
          body: JSON.stringify({ reason }),
        }
      );
      return response as UpdateOrderStatusResponse;
    } catch (error: any) {
      console.error('Cancel order error:', error);
      throw new Error(error.message || 'Failed to cancel order');
    }
  }

  // Get order statistics
  async getOrderStats(period: '7d' | '30d' | '90d' = '30d') {
    try {
      const response = await apiClient(`${this.BASE_URL}/stats?period=${period}`, {
        method: 'GET',
      });
      return response;
    } catch (error: any) {
      console.error('Get order stats error:', error);
      throw new Error(error.message || 'Failed to fetch order statistics');
    }
  }

  // Helper methods for order status management
  confirmOrder(orderId: string, adminNote?: string) {
    return this.updateOrderStatus(orderId, {
      status: 'confirmed',
      adminNote: adminNote || 'Order confirmed by admin',
    });
  }

  rejectOrder(orderId: string, reason: string) {
    return this.updateOrderStatus(orderId, {
      status: 'cancelled',
      adminNote: reason || 'Order rejected by admin',
    });
  }

  startPreparing(orderId: string) {
    return this.updateOrderStatus(orderId, {
      status: 'preparing',
      adminNote: 'Order preparation started',
    });
  }

  startShipping(orderId: string) {
    return this.updateOrderStatus(orderId, {
      status: 'shipping',
      adminNote: 'Order shipped',
    });
  }

  markDelivered(orderId: string) {
    return this.updateOrderStatus(orderId, {
      status: 'delivered',
      adminNote: 'Order delivered successfully',
    });
  }

  markCompleted(orderId: string) {
    return this.updateOrderStatus(orderId, {
      status: 'completed',
      adminNote: 'Order completed',
    });
  }
}

export const adminOrderService = new AdminOrderService();
export default adminOrderService;
