import type { GuestOrder } from '../types/GuestOrder';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Guest API client without authorization header
const guestApiClient = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string }> => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error('Invalid JSON response');
        }
      }
    }

    if (!response.ok) {
      throw new Error(data?.message || `HTTP error! status: ${response.status}`);
    }

    return data || { success: true };
  } catch (error) {
    console.error('Guest API Error:', error);
    throw error;
  }
};

export interface GuestOrderResponse {
  success: boolean;
  data: {
    orderId: string;
    orderNumber: string;
    totalAmount: number;
    paymentMethod: string;
    paymentUrl?: string;
  };
  message: string;
}

class GuestOrderService {
  async createGuestOrder(orderData: GuestOrder): Promise<GuestOrderResponse> {
    const response = await guestApiClient<GuestOrderResponse['data']>('/orders/guest', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data,
        message: 'Đặt hàng thành công',
      };
    }

    throw new Error((response as any).message || 'Đặt hàng thất bại');
  }

  async getGuestOrderStatus(orderNumber: string): Promise<any> {
    const response = await guestApiClient(`/orders/guest/${orderNumber}/status`, {
      method: 'GET',
    });

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error((response as any).message || 'Không thể lấy trạng thái đơn hàng');
  }
}

export const guestOrderService = new GuestOrderService();
export default guestOrderService;
