## PayPal Debug Guide

### Issue Fixed:
- **Problem**: PayPal service was called with wrong interface
- **Solution**: Updated GuestOrderController to use correct PayPalOrderRequest format

### Test Steps:

1. **Add items to cart (guest mode)**
2. **Go to guest checkout page**
3. **Select PayPal payment method**
4. **Complete checkout**

### Expected Results:
- Should redirect to PayPal sandbox
- Amount should be converted from VND to USD (divide by 24,000)
- Minimum amount enforced: $0.01

### Debug Information:

#### Backend Console Logs to Look For:
```
Creating PayPal order with amount USD: [amount] from VND: [amount]
PayPal createOrder called with: [JSON]
PayPal access token obtained successfully
PayPal create order response: [response]
```

#### If Still Getting Errors:
1. Check backend console for PayPal API errors
2. Verify PayPal credentials in .env
3. Check internet connection to PayPal sandbox
4. Ensure amounts are > $0.01

#### Common Issues:
- **Amount too small**: PayPal requires minimum $0.01
- **Invalid credentials**: Check PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET
- **Network issues**: PayPal sandbox must be accessible
- **Wrong format**: OrderRequest interface must match PayPal API

#### Environment Check:
```env
PAYPAL_CLIENT_ID=AU9FTkDyPzmW7XGqJZub...
PAYPAL_CLIENT_SECRET=EIko34uifViWtTfXJCAt...
PAYPAL_MODE=sandbox
PAYPAL_RETURN_URL=http://localhost:5173/payment-result?method=paypal
PAYPAL_CANCEL_URL=http://localhost:5173/payment-result?method=paypal&cancelled=true
```

### Currency Conversion:
- VND to USD rate: 1 USD = 24,000 VND
- Example: 240,000 VND = $10.00 USD
- Minimum: Any amount < $0.01 will be set to $0.01
