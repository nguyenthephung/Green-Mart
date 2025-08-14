import crypto from 'crypto';
import axios from 'axios';

export interface MoMoConfig {
  partnerCode: string;
  accessKey: string;
  secretKey: string;
  endpoint: string;
  redirectUrl: string;
  ipnUrl: string;
}

export interface MoMoPaymentRequest {
  orderId: string;
  amount: number;
  orderInfo: string;
  extraData?: string;
  requestType?: string;
}

export interface MoMoPaymentResponse {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  responseTime: number;
  message: string;
  resultCode: number;
  payUrl?: string;
  deeplink?: string;
  qrCodeUrl?: string;
  shortLink?: string;
}

export class MoMoService {
  private config: MoMoConfig;

  constructor() {
    this.config = {
      partnerCode: process.env.MOMO_PARTNER_CODE!,
      accessKey: process.env.MOMO_ACCESS_KEY!,
      secretKey: process.env.MOMO_SECRET_KEY!,
      endpoint: process.env.MOMO_ENDPOINT!,
      redirectUrl: process.env.MOMO_REDIRECT_URL!,
      ipnUrl: process.env.MOMO_IPN_URL!
    };

    console.log('=== MoMo Config Loaded ===');
    console.log('Partner Code:', this.config.partnerCode);
    console.log('Endpoint:', this.config.endpoint);
    console.log('Redirect URL:', this.config.redirectUrl);
    console.log('IPN URL:', this.config.ipnUrl);
  }

  async createPayment(paymentRequest: MoMoPaymentRequest): Promise<MoMoPaymentResponse> {
  const { orderId, amount: rawAmount, orderInfo, extraData = '', requestType = 'captureWallet' } = paymentRequest;
  // Ensure amount is always an integer for MoMo
  const amount = Math.round(rawAmount);
  const requestId = `${orderId}-${Date.now()}`;

    // Try URL encoding the parameters for signature calculation as per some MoMo examples
    const encodedOrderInfo = encodeURIComponent(orderInfo);
    const encodedRedirectUrl = encodeURIComponent(this.config.redirectUrl);
    const encodedIpnUrl = encodeURIComponent(this.config.ipnUrl);
    const encodedExtraData = encodeURIComponent(extraData);

    // Create raw signature with URL-encoded values (some examples suggest this)
  const rawSignatureEncoded = `accessKey=${this.config.accessKey}&amount=${amount}&extraData=${encodedExtraData}&ipnUrl=${encodedIpnUrl}&orderId=${orderId}&orderInfo=${encodedOrderInfo}&partnerCode=${this.config.partnerCode}&redirectUrl=${encodedRedirectUrl}&requestId=${requestId}&requestType=${requestType}`;

  // Also try without encoding (original approach)
  const rawSignature = `accessKey=${this.config.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${this.config.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.config.partnerCode}&redirectUrl=${this.config.redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto
      .createHmac('sha256', this.config.secretKey)
      .update(rawSignature)
      .digest('hex');

    const signatureEncoded = crypto
      .createHmac('sha256', this.config.secretKey)
      .update(rawSignatureEncoded)
      .digest('hex');

    const requestBody = {
      partnerCode: this.config.partnerCode,
      accessKey: this.config.accessKey,
      requestId,
      amount, // integer
      orderId,
      orderInfo,
      redirectUrl: this.config.redirectUrl,
      ipnUrl: this.config.ipnUrl,
      extraData,
      requestType,
      signature,
      lang: 'vi'
    };

    console.log('=== MoMo Payment Request Debug ===');
    console.log('Endpoint:', this.config.endpoint);
    console.log('Partner Code:', this.config.partnerCode);
    console.log('Access Key:', this.config.accessKey);
    console.log('Secret Key Length:', this.config.secretKey?.length || 'undefined');
    console.log('Amount:', amount);
    console.log('Order ID:', orderId);
    console.log('Request ID:', requestId);
    console.log('Order Info:', orderInfo);
    console.log('Extra Data:', extraData);
    console.log('Request Type:', requestType);
    console.log('Redirect URL:', this.config.redirectUrl);
    console.log('IPN URL:', this.config.ipnUrl);
    console.log('RawSignature (original):', rawSignature);
    console.log('RawSignature (encoded):', rawSignatureEncoded);
    console.log('Signature (original):', signature);
    console.log('Signature (encoded):', signatureEncoded);
    
    // Try alternative signature calculations for debugging
    const altSignature1 = crypto.createHmac('sha256', this.config.secretKey).update(rawSignature, 'utf8').digest('hex');
    const altSignature2 = crypto.createHmac('sha256', this.config.secretKey).update(rawSignature, 'ascii').digest('hex');
    console.log('Alternative signature 1 (utf8):', altSignature1);
    console.log('Alternative signature 2 (ascii):', altSignature2);
    
    console.log('RequestBody:', JSON.stringify(requestBody, null, 2));

    try {
      const response = await axios.post(this.config.endpoint, requestBody, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      });

      console.log('=== MoMo Response Debug ===');
      console.log(JSON.stringify(response.data, null, 2));

      return response.data as MoMoPaymentResponse;
    } catch (err: any) {
      console.error('MoMo API Error:', err.response?.data || err.message);
      throw err;
    }
  }

  /**
   * Verify MoMo IPN/callback signature
   */
  verifyCallback(callbackData: any): boolean {
    try {
      const { signature, ...params } = callbackData;
      
      // Build raw signature string with correct parameter order
      const rawSignature = `accessKey=${params.accessKey}&amount=${params.amount}&extraData=${params.extraData}&message=${params.message}&orderId=${params.orderId}&orderInfo=${params.orderInfo}&orderType=${params.orderType}&partnerCode=${params.partnerCode}&payType=${params.payType}&requestId=${params.requestId}&responseTime=${params.responseTime}&resultCode=${params.resultCode}&transId=${params.transId}`;
      
      const expectedSignature = crypto
        .createHmac('sha256', this.config.secretKey)
        .update(rawSignature)
        .digest('hex');

      console.log('=== MoMo Callback Verification Debug ===');
      console.log('Raw signature string:', rawSignature);
      console.log('Expected signature:', expectedSignature);
      console.log('Received signature:', signature);
      console.log('Signature match:', signature === expectedSignature);

      return signature === expectedSignature;
    } catch (error) {
      console.error('MoMo verify callback error:', error);
      return false;
    }
  }

  /**
   * Query transaction status from MoMo
   */
  async queryTransaction(orderId: string, requestId?: string): Promise<any> {
    try {
      const queryRequestId = requestId || orderId + new Date().getTime();
      
      // Create signature parameters and sort alphabetically
      const signatureParams = {
        accessKey: this.config.accessKey,
        orderId: orderId,
        partnerCode: this.config.partnerCode,
        requestId: queryRequestId
      };

      const sortedKeys = Object.keys(signatureParams).sort();
      const rawSignature = sortedKeys
        .map(key => `${key}=${signatureParams[key as keyof typeof signatureParams]}`)
        .join('&');
      
      const signature = crypto
        .createHmac('sha256', this.config.secretKey)
        .update(rawSignature)
        .digest('hex');

      const requestBody = {
        partnerCode: this.config.partnerCode,
        accessKey: this.config.accessKey,
        requestId: queryRequestId,
        orderId,
        signature,
        lang: 'vi'
      };

      const queryEndpoint = process.env.MOMO_QUERY_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/query';
      
      const response = await axios.post(queryEndpoint, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      return response.data;

    } catch (error) {
      console.error('MoMo query transaction error:', error);
      
      // Return demo response if API fails
      if (process.env.NODE_ENV === 'development') {
        return {
          partnerCode: this.config.partnerCode,
          orderId,
          requestId: requestId || orderId + new Date().getTime(),
          resultCode: 0,
          message: 'Success (Demo)',
          responseTime: new Date().getTime(),
          extraData: '',
          amount: 0,
          transId: Math.floor(Math.random() * 1000000000)
        };
      }
      
      throw error;
    }
  }

  /**
   * Refund transaction (if supported by merchant account)
   */
  async refundTransaction(orderId: string, amount: number, description: string): Promise<any> {
    try {
      const refundId = 'RF' + orderId + new Date().getTime();
      
      // Create signature parameters and sort alphabetically
      const signatureParams = {
        accessKey: this.config.accessKey,
        amount: amount.toString(),
        description: description,
        orderId: orderId,
        partnerCode: this.config.partnerCode,
        requestId: refundId,
        transId: orderId
      };

      const sortedKeys = Object.keys(signatureParams).sort();
      const rawSignature = sortedKeys
        .map(key => `${key}=${signatureParams[key as keyof typeof signatureParams]}`)
        .join('&');
      
      const signature = crypto
        .createHmac('sha256', this.config.secretKey)
        .update(rawSignature)
        .digest('hex');

      const requestBody = {
        partnerCode: this.config.partnerCode,
        accessKey: this.config.accessKey,
        requestId: refundId,
        orderId,
        amount,
        transId: orderId,
        description,
        signature,
        lang: 'vi'
      };

      const refundEndpoint = process.env.MOMO_REFUND_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/refund';
      
      const response = await axios.post(refundEndpoint, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      return response.data;

    } catch (error) {
      console.error('MoMo refund transaction error:', error);
      
      // Return demo response
      if (process.env.NODE_ENV === 'development') {
        return {
          partnerCode: this.config.partnerCode,
          orderId,
          requestId: 'RF' + orderId + new Date().getTime(),
          resultCode: 0,
          message: 'Refund Success (Demo)',
          responseTime: new Date().getTime(),
          amount,
          transId: Math.floor(Math.random() * 1000000000)
        };
      }
      
      throw error;
    }
  }

  /**
   * Generate QR code for payment
   */
  generateQRCode(orderId: string, amount: number, note: string): string {
    // This would integrate with MoMo QR generation API
    // For demo, return a placeholder QR URL
    return `https://test-payment.momo.vn/qr/${orderId}?amount=${amount}&note=${encodeURIComponent(note)}`;
  }

  /**
   * Test signature calculation for debugging - multiple methods
   */
  testSignature(testData: any): { rawSignature: string; signature: string; alternatives: any[] } {
    // Method 1: Alphabetical order
    const signatureParams = {
      accessKey: testData.accessKey,
      amount: testData.amount.toString(),
      extraData: testData.extraData,
      ipnUrl: testData.ipnUrl,
      orderId: testData.orderId,
      orderInfo: testData.orderInfo,
      partnerCode: testData.partnerCode,
      redirectUrl: testData.redirectUrl,
      requestId: testData.requestId,
      requestType: testData.requestType
    };

    const sortedKeys = Object.keys(signatureParams).sort();
    const rawSignature = sortedKeys
      .map(key => `${key}=${signatureParams[key as keyof typeof signatureParams]}`)
      .join('&');
    
    const signature = crypto
      .createHmac('sha256', this.config.secretKey)
      .update(rawSignature)
      .digest('hex');

    // Alternative methods for testing
    const alternatives = [
      {
        method: 'Original Order',
        raw: `accessKey=${testData.accessKey}&amount=${testData.amount}&extraData=${testData.extraData}&ipnUrl=${testData.ipnUrl}&orderId=${testData.orderId}&orderInfo=${testData.orderInfo}&partnerCode=${testData.partnerCode}&redirectUrl=${testData.redirectUrl}&requestId=${testData.requestId}&requestType=${testData.requestType}`,
        signature: crypto.createHmac('sha256', this.config.secretKey).update(`accessKey=${testData.accessKey}&amount=${testData.amount}&extraData=${testData.extraData}&ipnUrl=${testData.ipnUrl}&orderId=${testData.orderId}&orderInfo=${testData.orderInfo}&partnerCode=${testData.partnerCode}&redirectUrl=${testData.redirectUrl}&requestId=${testData.requestId}&requestType=${testData.requestType}`).digest('hex')
      },
      {
        method: 'URL Encoded',
        raw: sortedKeys.map(key => `${key}=${encodeURIComponent(signatureParams[key as keyof typeof signatureParams])}`).join('&'),
        signature: crypto.createHmac('sha256', this.config.secretKey).update(sortedKeys.map(key => `${key}=${encodeURIComponent(signatureParams[key as keyof typeof signatureParams])}`).join('&')).digest('hex')
      }
    ];

    return { rawSignature, signature, alternatives };
  }

  /**
   * Get payment methods supported by MoMo
   */
  getPaymentMethods(): Array<{ code: string; name: string; description: string }> {
    return [
      {
        code: 'wallet',
        name: 'Ví MoMo',
        description: 'Thanh toán qua ví điện tử MoMo'
      },
      {
        code: 'credit',
        name: 'Thẻ tín dụng qua MoMo',
        description: 'Thanh toán bằng thẻ tín dụng/ghi nợ qua MoMo'
      },
      {
        code: 'atm',
        name: 'ATM qua MoMo',
        description: 'Thanh toán qua thẻ ATM nội địa qua MoMo'
      }
    ];
  }
}

export default new MoMoService();
