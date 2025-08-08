## Testing Summary - PayPal & MoMo Integration for Guest Orders

### Fixes Applied:

#### 1. Toast Notification Width Fix ✅
- Updated `ToastContainer.tsx`: Changed from `max-w-sm` to `max-w-md w-full sm:max-w-lg`
- Updated `ToastItem.tsx`: Removed `max-w-sm`, added `break-words` for better text wrapping
- **Result**: Login success notifications should no longer have cramped text

#### 2. PayPal Integration for Guest Orders ✅
- Added PayPal to `GuestOrder.ts` type definition
- Updated `GuestCheckoutPage.tsx` to include PayPal option
- Modified `GuestOrderController.ts` to handle PayPal with USD conversion (VND/24000)
- **Currency**: Automatically converts VND to USD for PayPal (1 USD ≈ 24,000 VND)

#### 3. MoMo Integration Fix ✅
- Updated `.env`: Changed `MOMO_REDIRECT_URL` from port 3000 to 5173
- Fixed logic in `GuestCheckoutPage.tsx` to properly handle payment gateway redirects
- Added error handling when payment URL is not generated

#### 4. JWT Token Expiry ✅
- Confirmed backend uses `JWT_EXPIRE=7d` from environment
- Token duration is already set to 7 days

### Testing Instructions:

1. **Test Toast Notifications:**
   - Login/Register and check if success messages display properly
   - Text should not wrap awkwardly

2. **Test Guest Checkout with PayPal:**
   - Add items to cart (without login)
   - Go to checkout as guest
   - Select PayPal payment method
   - Should redirect to PayPal sandbox

3. **Test Guest Checkout with MoMo:**
   - Add items to cart (without login) 
   - Go to checkout as guest
   - Select MoMo payment method
   - Should redirect to MoMo payment page

4. **Test COD/Bank Transfer:**
   - Should go directly to success page (no redirect)

### Environment Configuration:
```env
# PayPal Sandbox (Already configured)
PAYPAL_CLIENT_ID=AU9FTkDyPzmW7XGqJZub...
PAYPAL_MODE=sandbox
PAYPAL_RETURN_URL=http://localhost:5173/payment-result?method=paypal

# MoMo Test (Updated)
MOMO_REDIRECT_URL=http://localhost:5173/payment-result?method=momo

# JWT (Already configured)
JWT_EXPIRE=7d
```

### Notes:
- PayPal amounts are automatically converted from VND to USD
- MoMo uses official test credentials
- Payment failures now show proper error messages instead of false success
- Backend auto-restarts when files change (nodemon)
