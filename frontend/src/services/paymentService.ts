// Payment Service for Frontend Integration
import { apiClient } from './api';

export interface PaymentRequest {
  orderId: string;
  paymentMethod: string;
  amount: number;
  returnUrl?: string;
  metadata?: any;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  data?: {
    paymentId: string;
    status: string;
    transactionId?: string;
    redirectUrl?: string;
    payUrl?: string; // Add payUrl for MoMo compatibility
    paymentUrl?: string; // Add paymentUrl for PayPal compatibility
    qrCode?: string;
    qrCodeUrl?: string; // Add qrCodeUrl for MoMo
    gatewayMessage?: string;
  };
  // Add top-level fields for flexibility
  redirectUrl?: string;
  payUrl?: string;
}

export interface PaymentDetails {
  _id: string;
  orderId: string;
  userId: string;
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  transactionId?: string;
  gatewayResponse?: any;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  failureReason?: string;
}

export interface PaymentHistory {
  payments: PaymentDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface RefundRequest {
  amount?: number;
  reason: string;
}

export interface RefundResponse {
  success: boolean;
  message: string;
  data?: {
    refundId: string;
    amount: number;
    status: string;
  };
}

class PaymentService {
  private readonly BASE_URL = '/payments';

  // Create a new payment
  async createPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      
      const response = await apiClient<any>(this.BASE_URL, {
        method: 'POST',
        body: JSON.stringify(paymentData)
      });
      
      // Handle different response structures
      let result: PaymentResponse;
      
      if (response.data && typeof response.data === 'object') {
        // Backend returns: { success: true, message: "...", data: { paymentId, redirectUrl, ... } }
        result = {
          success: response.success || true,
          message: response.message || 'Payment created successfully',
          data: response.data
        };
      } else if ((response as any).paymentId) {
        // Backend returns: { paymentId, redirectUrl, status, ... } (flat structure)
        result = {
          success: true,
          message: 'Payment created successfully',
          data: response as any
        };
      } else {
        // Fallback: treat the whole response as data
        result = response as PaymentResponse;
      }
      
      return result;
    } catch (error: any) {
      console.error('PaymentService: Payment creation error:', error);
      throw new Error(error.message || 'Failed to create payment');
    }
  }

  // Get payment details by ID
  async getPayment(paymentId: string): Promise<PaymentDetails> {
    try {
      const response = await apiClient<PaymentDetails>(`${this.BASE_URL}/${paymentId}`);
      return response.data!;
    } catch (error: any) {
      console.error('Get payment error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get payment details');
    }
  }

  // Get user's payment history
  async getPaymentHistory(params?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentMethod?: string;
  }): Promise<PaymentHistory> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.paymentMethod) queryParams.append('paymentMethod', params.paymentMethod);
      
      const url = `${this.BASE_URL}/history${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await apiClient<PaymentHistory>(url);
      return response.data!;
    } catch (error: any) {
      console.error('Get payment history error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get payment history');
    }
  }

  // Refund a payment
  async refundPayment(paymentId: string, refundData: RefundRequest): Promise<RefundResponse> {
    try {
      const response = await apiClient<RefundResponse>(`${this.BASE_URL}/${paymentId}/refund`, {
        method: 'POST',
        body: JSON.stringify(refundData)
      });
      return response.data || response as RefundResponse;
    } catch (error: any) {
      console.error('Payment refund error:', error);
      throw new Error(error.message || 'Failed to refund payment');
    }
  }

  // Process payment based on method
  async processPayment(paymentMethod: string, orderId: string, amount: number, metadata?: any): Promise<PaymentResponse> {
    const paymentData: PaymentRequest = {
      orderId,
      paymentMethod,
      amount,
      returnUrl: `${window.location.origin}/payment-result`,
      metadata: {
        ...metadata
      }
    };

    return await this.createPayment(paymentData);
  }

  // Handle payment result after redirect
  async handlePaymentResult(paymentId: string): Promise<PaymentDetails> {
    try {
      // Poll payment status for a few seconds to get updated status
      for (let i = 0; i < 10; i++) {
        const payment = await this.getPayment(paymentId);
        
        if (payment.status === 'completed' || payment.status === 'failed') {
          return payment;
        }
        
        // Wait 1 second before checking again
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // If still processing after 10 seconds, return current status
      return await this.getPayment(paymentId);
    } catch (error: any) {
      console.error('Payment result handling error:', error);
      throw new Error('Failed to get payment result');
    }
  }

  // Cancel payment (if supported by gateway)
  async cancelPayment(paymentId: string): Promise<void> {
    try {
      // This would be implemented based on gateway requirements
      // For now, we'll just update the status
    } catch (error: any) {
      console.error('Payment cancellation error:', error);
      throw new Error('Failed to cancel payment');
    }
  }

  // Get payment methods configuration
  getPaymentMethods() {
    return [
      {
        id: 'cod',
        name: 'Thanh toán khi nhận hàng (COD)',
        description: 'Thanh toán bằng tiền mặt khi nhận hàng',
        icon: '💰',
        isOnline: false,
        processingTime: 'Ngay lập tức'
      },
      {
        id: 'bank_transfer',
        name: 'Chuyển khoản ngân hàng',
        description: 'Chuyển khoản qua tài khoản ngân hàng',
        icon: '🏦',
        isOnline: false,
        processingTime: '1-2 giờ'
      },
      {
        id: 'momo',
        name: 'Ví điện tử MoMo',
        description: 'Thanh toán qua ứng dụng MoMo',
        icon: '🟣',
        isOnline: true,
        processingTime: 'Ngay lập tức'
      },
      {
        id: 'credit_card',
        name: 'Thẻ tín dụng/ghi nợ',
        description: 'Thanh toán bằng thẻ Visa, Mastercard, JCB',
        icon: '💳',
        isOnline: true,
        processingTime: 'Ngay lập tức'
      }
    ];
  }

  // Get payment status display info
  getPaymentStatusInfo(status: string) {
    const statusMap = {
      pending: {
        label: 'Chờ thanh toán',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        icon: '⏳'
      },
      processing: {
        label: 'Đang xử lý',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        icon: '⚙️'
      },
      completed: {
        label: 'Thành công',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: '✅'
      },
      failed: {
        label: 'Thất bại',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: '❌'
      },
      cancelled: {
        label: 'Đã hủy',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        icon: '🚫'
      },
      refunded: {
        label: 'Đã hoàn tiền',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        icon: '↩️'
      }
    };

    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  }

  // PayPal specific methods
  async capturePayPalPayment(orderId: string): Promise<any> {
    try {
      
      const response = await apiClient<any>('/payments/paypal/capture', {
        method: 'POST',
        body: JSON.stringify({ orderId })
      });
      
      return response;
    } catch (error: any) {
      console.error('PaymentService: PayPal capture error:', error);
      throw new Error(error.message || 'Failed to capture PayPal payment');
    }
  }

  // Create PayPal payment with proper return URLs
  async createPayPalPayment(orderId: string, amount: number): Promise<PaymentResponse> {
    const returnUrl = `${window.location.origin}/payment/paypal/success`;
    const cancelUrl = `${window.location.origin}/payment/paypal/cancel`;

    const paymentData: PaymentRequest = {
      orderId,
      paymentMethod: 'paypal',
      amount,
      returnUrl,
      metadata: {
        cancelUrl
      }
    };

    return await this.createPayment(paymentData);
  }

  // Handle PayPal return from checkout
  async handlePayPalReturn(token: string, PayerID?: string): Promise<any> {
    try {
      if (!PayerID) {
        throw new Error('PayPal payment was cancelled');
      }

      // Capture the payment
      const result = await this.capturePayPalPayment(token);
      return result;
    } catch (error: any) {
      console.error('PayPal return handling error:', error);
      throw new Error(error.message || 'Failed to complete PayPal payment');
    }
  }
}

export default new PaymentService();
