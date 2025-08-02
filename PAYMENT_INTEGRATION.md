# Payment Gateway Integration Guide

## Overview

This project integrates with three major Vietnamese payment gateways:
- **VNPay** - Vietnam's leading payment gateway
- **MoMo** - Popular e-wallet in Vietnam  
- **ZaloPay** - Zalo's payment solution

All three providers offer free registration and sandbox environments for testing.

## Features

✅ **VNPay Integration**
- ATM/Internet Banking support
- Credit/Debit card processing
- QR code payments
- Real-time callback verification

✅ **MoMo Integration**  
- E-wallet payments
- QR code generation
- Mobile app deep linking
- Transaction status queries

✅ **ZaloPay Integration**
- Zalo app payments
- Bank transfers via ZaloPay
- Real-time payment confirmation
- Refund support

✅ **Additional Features**
- Payment result page with detailed status
- Test page for gateway verification
- Automatic cart clearing after payment
- Order tracking integration

## Setup Instructions

### 1. Backend Configuration

Copy the `.env.example` file to `.env` and configure the following variables:

```env
# VNPay Configuration
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_TMN_CODE=your-vnpay-terminal-code
VNPAY_HASH_SECRET=your-vnpay-hash-secret
VNPAY_RETURN_URL=http://localhost:3000/payment-result

# MoMo Configuration  
MOMO_PARTNER_CODE=your-momo-partner-code
MOMO_ACCESS_KEY=your-momo-access-key
MOMO_SECRET_KEY=your-momo-secret-key
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_REDIRECT_URL=http://localhost:3000/payment-result
MOMO_IPN_URL=http://localhost:5000/api/payments/callback/momo

# ZaloPay Configuration
ZALOPAY_APP_ID=your-zalopay-app-id
ZALOPAY_KEY1=your-zalopay-key1
ZALOPAY_KEY2=your-zalopay-key2
ZALOPAY_ENDPOINT=https://sb-openapi.zalopay.vn/v2/create
ZALOPAY_REDIRECT_URL=http://localhost:3000/payment-result
ZALOPAY_CALLBACK_URL=http://localhost:5000/api/payments/callback/zalopay
```

### 2. Get API Credentials

#### VNPay (Free Registration)
1. Visit [VNPay Sandbox](https://sandbox.vnpayment.vn/)
2. Register for a sandbox account
3. Get your Terminal Code (TMN_CODE) and Hash Secret
4. VNPay offers free integration with competitive transaction fees

#### MoMo (Free Registration)
1. Visit [MoMo Developer Portal](https://developers.momo.vn/)
2. Register as a developer
3. Create a new application
4. Get Partner Code, Access Key, and Secret Key
5. MoMo charges no setup fees, only transaction fees

#### ZaloPay (Free Registration)  
1. Visit [ZaloPay Developer Portal](https://developers.zalopay.vn/)
2. Register for developer account
3. Create new app and get App ID, Key1, Key2
4. ZaloPay offers competitive rates with no setup fees

### 3. Install Dependencies

```bash
cd backend
npm install axios node-fetch@2 @types/node-fetch
```

### 4. Start Services

```bash
# Backend
cd backend
npm run dev

# Frontend  
cd frontend
npm run dev
```

## Testing

### Using the Test Page

1. Navigate to `http://localhost:3000/payment-test`
2. Click on any payment gateway button to test
3. Check browser console for detailed logs
4. Use sandbox credentials for testing

### Demo Credentials

The system includes demo credentials that work in development mode:

**VNPay Sandbox:**
- Terminal Code: `VNPAYTEST`
- Hash Secret: `SANDBOXSECRETKEY`

**MoMo Test:**
- Partner Code: `MOMOIQA420180417`
- Access Key: `SvDmj2cOTYZmQQ3H`
- Secret Key: `PPuDXq1KowPT1ftR8DvlQTHhC03aul17`

**ZaloPay Demo:**
- App ID: `2553`
- Key1: `PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL`
- Key2: `kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz`

## Payment Flow

### 1. Order Creation
```javascript
// User places order with payment method selection
const orderData = {
  items: [...],
  shippingAddress: {...},
  paymentMethod: 'vnpay' // or 'momo', 'zalopay'
};

const order = await orderService.createOrder(orderData);
```

### 2. Payment Processing
```javascript
// For online payments, create payment and redirect
const payment = await paymentService.createPayment({
  orderId: order.orderId,
  paymentMethod: 'vnpay',
  returnUrl: '/payment-result'
});

// Redirect to payment gateway
window.location.href = payment.data.redirectUrl;
```

### 3. Payment Callback
```javascript
// Gateway sends callback to /api/payments/callback/{method}
// System verifies signature and updates order status
// User redirected to /payment-result with status
```

## API Endpoints

### Payment Routes
- `POST /api/payments` - Create new payment
- `GET /api/payments/:id` - Get payment details
- `GET /api/payments/history` - Get payment history
- `POST /api/payments/callback/vnpay` - VNPay callback
- `POST /api/payments/callback/momo` - MoMo callback  
- `POST /api/payments/callback/zalopay` - ZaloPay callback

### Order Routes
- `POST /api/orders` - Create order
- `GET /api/orders/track/:id` - Public order tracking
- `GET /api/orders/:id` - Get order (authenticated)
- `PATCH /api/orders/:id/status` - Update order status

## Security Features

- **Signature Verification**: All callbacks verified with HMAC signatures
- **SSL/TLS**: All communication encrypted
- **Input Validation**: Strict parameter validation
- **Error Handling**: Comprehensive error catching and logging
- **Rate Limiting**: Built-in rate limiting for API endpoints

## Production Deployment

### 1. Update Environment Variables
- Replace sandbox URLs with production URLs
- Use real merchant credentials
- Set proper return/callback URLs

### 2. SSL Certificate Required
- All payment gateways require HTTPS in production
- Get SSL certificate for your domain

### 3. Webhook URLs
- Ensure callback URLs are publicly accessible
- Test webhook delivery from each gateway

### 4. Compliance
- Review each gateway's terms of service
- Implement required security measures
- Consider PCI DSS compliance for card payments

## Transaction Fees

### VNPay
- ATM/Internet Banking: 1,650 - 6,600 VND per transaction
- Visa/Master: 2.2% + 6,600 VND per transaction
- No setup fees

### MoMo
- E-wallet: 0.5% - 1.5% per transaction  
- Bank transfer: 0.8% - 2.0% per transaction
- No setup fees, competitive rates

### ZaloPay
- E-wallet: 0.8% - 1.5% per transaction
- ATM/Banking: 1.0% - 2.0% per transaction  
- No setup fees, volume discounts available

*Note: Fees are subject to change. Check with each provider for current rates.*

## Support

- **VNPay**: support@vnpay.vn
- **MoMo**: developer-support@momo.vn  
- **ZaloPay**: developer@zalopay.vn

## License

This integration is part of the GreenMart project and follows the same license terms.
