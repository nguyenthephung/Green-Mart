import axios from 'axios';

export interface PayPalOrderRequest {
  intent: 'CAPTURE';
  purchase_units: Array<{
    amount: {
      currency_code: string;
      value: string;
    };
    description?: string;
    invoice_id?: string;
  }>;
  application_context?: {
    return_url?: string;
    cancel_url?: string;
    brand_name?: string;
    locale?: string;
    landing_page?: 'LOGIN' | 'BILLING' | 'NO_PREFERENCE';
    shipping_preference?: 'GET_FROM_FILE' | 'NO_SHIPPING' | 'SET_PROVIDED_ADDRESS';
    user_action?: 'CONTINUE' | 'PAY_NOW';
  };
}

export interface PayPalOrderResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface PayPalCaptureResponse {
  id: string;
  status: string;
  purchase_units: Array<{
    payments: {
      captures: Array<{
        id: string;
        status: string;
        amount: {
          currency_code: string;
          value: string;
        };
      }>;
    };
  }>;
}

export class PayPalService {
  private baseURL: string;
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor() {
    this.baseURL = process.env.PAYPAL_MODE === 'live' 
      ? 'https://api.paypal.com'
      : 'https://api.sandbox.paypal.com';
    
    this.clientId = process.env.PAYPAL_CLIENT_ID || '';
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';

    if (!this.clientId || !this.clientSecret) {
      console.error('PayPal configuration missing:', {
        clientId: !!this.clientId,
        clientSecret: !!this.clientSecret,
        mode: process.env.PAYPAL_MODE
      });
      throw new Error('PayPal credentials are required. Please check PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables.');
    }

    console.log('PayPal Service initialized:', {
      baseURL: this.baseURL,
      clientId: this.clientId?.slice(0, 10) + '...',
      mode: process.env.PAYPAL_MODE || 'sandbox'
    });
  }

  // Lấy access token từ PayPal
  private async getAccessToken(): Promise<string> {
    try {
      // Kiểm tra token còn hiệu lực không
      if (this.accessToken && Date.now() < this.tokenExpiresAt) {
        return this.accessToken;
      }

      console.log('PayPal: Requesting new access token...');
      console.log('PayPal: Using credentials:', {
        clientId: this.clientId?.slice(0, 10) + '...',
        clientSecretLength: this.clientSecret?.length,
        baseURL: this.baseURL
      });

      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await axios.post(
        `${this.baseURL}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 10000 // 10 second timeout
        }
      );

      console.log('PayPal: Access token obtained successfully');
      this.accessToken = response.data.access_token;
      // Token thường có thời hạn 9 giờ, trừ đi 5 phút để an toàn
      this.tokenExpiresAt = Date.now() + (response.data.expires_in - 300) * 1000;
      
      return this.accessToken!;
    } catch (error: any) {
      console.error('PayPal get access token error:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        console.error('PayPal Authentication Failed - Please check your credentials:');
        console.error('- CLIENT_ID should be exactly as provided by PayPal');
        console.error('- CLIENT_SECRET should be exactly as provided by PayPal');
        console.error('- Make sure the app is not suspended in PayPal Developer Console');
      }
      
      throw new Error('Failed to get PayPal access token');
    }
  }

  // Tạo PayPal order
  async createOrder(orderData: PayPalOrderRequest): Promise<PayPalOrderResponse> {
    try {
      console.log('PayPal createOrder called with:', JSON.stringify(orderData, null, 2));
      
      const accessToken = await this.getAccessToken();
      console.log('PayPal access token obtained successfully');

      const response = await axios.post(
        `${this.baseURL}/v2/checkout/orders`,
        orderData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'PayPal-Request-Id': `order-${Date.now()}`, // Unique request ID
          },
        }
      );

      console.log('PayPal create order response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('PayPal create order error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.data) {
        throw new Error(`PayPal API Error: ${JSON.stringify(error.response.data)}`);
      }
      throw new Error(`Failed to create PayPal order: ${error.message}`);
    }
  }

  // Capture PayPal order (hoàn tất thanh toán)
  async captureOrder(orderId: string): Promise<PayPalCaptureResponse> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.post(
        `${this.baseURL}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'PayPal-Request-Id': `capture-${Date.now()}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('PayPal capture order error:', error.response?.data || error.message);
      throw new Error('Failed to capture PayPal order');
    }
  }

  // Lấy thông tin order
  async getOrder(orderId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.get(
        `${this.baseURL}/v2/checkout/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('PayPal get order error:', error.response?.data || error.message);
      throw new Error('Failed to get PayPal order');
    }
  }

  // Convert VND to USD (PayPal không hỗ trợ VND)
  convertVNDToUSD(vndAmount: number, exchangeRate: number = 24000): string {
    const usdAmount = vndAmount / exchangeRate;
    return usdAmount.toFixed(2);
  }

  // Format amount cho PayPal (tối đa 2 chữ số thập phân)
  formatAmount(amount: number | string): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return numAmount.toFixed(2);
  }
}
