import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import Footer from '../../components/Guest/Footer'; // Remove Footer import
import CheckoutMain from '../../components/Guest/checkout/CheckoutMain';
import { useCartStore } from '../../stores/useCartStore';
import { useUserStore } from '../../stores/useUserStore';
import CheckoutSummary from '../../components/Guest/checkout/CheckoutSummary';
import { useVoucherStore } from '../../stores/useVoucherStore';
import ShopeeVoucherModal from '../../components/Guest/cart/ShopeeVoucherModal';
import orderService from '../../services/orderService';
import type { CreateOrderRequest } from '../../services/orderService';
import paymentService from '../../services/paymentService';

const Checkout = () => {
  const navigate = useNavigate();
  const cart = useCartStore(state => state.items);
  const cartLoading = useCartStore(state => state.loading);
  const user = useUserStore(state => state.user);
  const isAuthenticated = useUserStore(state => state.isAuthenticated);
  const userInfo = useUserStore(state => state.userInfo);
  const addresses = useUserStore(state => state.addresses);
  const payments = useUserStore(state => state.payments);
  const setPayments = useUserStore(state => state.setPayments);
  const voucher = useUserStore(state => state.voucher);
  const setVoucher = useUserStore(state => state.setVoucher);
  const refreshUserData = useUserStore(state => state.refreshUserData);
  const vouchers = useVoucherStore(state => state.vouchers);
  const fetchVouchers = useVoucherStore(state => state.fetchVouchers);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  // Filter valid vouchers that user owns and are not expired
  const availableVouchers = vouchers.filter(v => {
    // Check if voucher is active and not expired
    const isActive = v.isActive === true;
    const notExpired = new Date(v.expired) >= new Date();
    const notFullyUsed = !v.maxUsage || v.currentUsage < v.maxUsage;
    
    // Check if user owns this voucher
    const userOwnsVoucher = user?.vouchers && user.vouchers[v._id] && user.vouchers[v._id] > 0;
    
    console.log(`CheckoutPage - Voucher ${v.code}:`, {
      isActive,
      notExpired,
      notFullyUsed,
      userOwnsVoucher,
      userVoucherQuantity: user?.vouchers?.[v._id] || 0
    });
    
    return isActive && notExpired && notFullyUsed && userOwnsVoucher;
  });

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    fetchVouchers();
    
    // Fetch cart data when entering checkout
    useCartStore.getState().fetchCart();
    
    // Clean invalid items from cart on page load
    useCartStore.getState().cleanInvalidItems();
  }, []); // Only run once on mount

  // Separate effect for payments
  useEffect(() => {
    // Nếu chưa có payment nào được chọn, để user tự chọn
    if (payments && payments.length > 0 && !payments.some(p => p.isSelected)) {
      // Không tự động chọn payment method nào cả
    }
  }, [payments]);

  // Map cart context sang định dạng cần cho CheckoutMain
  const checkoutItems = cart.map(item => ({
    id: Number(item.id),
    name: item.name,
    image: item.image,
    quantity: item.quantity,
  }));

  // Lấy địa chỉ và payment đang chọn trực tiếp từ context
  const selectedAddress = addresses.find(a => a.isSelected) || addresses[0];

  // Kiểm tra điều kiện để checkout
  const canCheckout = isAuthenticated && user && addresses.length > 0;
  const userDisplayInfo = userInfo || (user ? {
    fullName: user.name || '',
    phone: user.phone || '',
    email: user.email || '',
    avatar: user.avatar || ''
  } : null);

  // Hàm nhận payment method từ CheckoutMain
  const handlePaymentChange = (method: string) => {
    if (setPayments && payments && payments.length > 0) {
      const updatedPayments = payments.map(p => ({ 
        ...p, 
        isSelected: p.method === method 
      }));
      setPayments(updatedPayments);
    }
  };

  const handlePaymentSelect = (method: string) => {
    handlePaymentChange(method);
  };

  // Tính tổng tiền hàng
  const subtotal = cart.reduce((sum, item) => {
    const price = item.price || 0;
    return sum + price * item.quantity;
  }, 0);

  // Tính giảm giá voucher
  let voucherDiscount = 0;
  if (voucher && subtotal >= voucher.minOrder) {
    if (voucher.discountType === 'percent') {
      voucherDiscount = Math.round(subtotal * voucher.discountValue / 100);
    } else {
      voucherDiscount = voucher.discountValue;
    }
    if (voucherDiscount > subtotal) voucherDiscount = subtotal;
  }

  // Tính phí ship theo logic backend (dựa trên subtotal trước discount)
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const expectedTotal = subtotal - voucherDiscount + shippingFee;

  // Hàm xử lý đặt hàng và thanh toán
  const handleCheckout = async () => {
    if (!canCheckout || !selectedAddress || !userDisplayInfo) {
      alert('Vui lòng kiểm tra lại thông tin đặt hàng');
      return;
    }

    // Use fresh state from store instead of stale state
    const freshPayments = useUserStore.getState().payments;
    const selectedPayment = freshPayments.find(p => p.isSelected);
    
    if (!selectedPayment) {
      alert('Vui lòng chọn phương thức thanh toán');
      return;
    }

    if (cart.length === 0) {
      alert('Giỏ hàng trống');
      return;
    }

    setIsProcessingOrder(true);

    try {
      // Validate cart items - kiểm tra kỹ hơn
      const validItems = cart.filter(item => {
        const hasId = item.id && item.id !== '' && item.id !== 'undefined';
        const hasName = item.name && item.name.trim() !== '';
        const hasQuantity = item.quantity && item.quantity > 0;
        const hasPrice = item.price && item.price > 0;
        
        // Additional validation for MongoDB ObjectId (should be 24 hex characters)
        const idString = String(item.id).trim();
        const isValidObjectId = /^[a-fA-F0-9]{24}$/.test(idString);
        
        return hasId && isValidObjectId && hasName && hasQuantity && hasPrice;
      });
      
      console.log('Valid items after validation:', validItems);
      
      if (validItems.length === 0) {
        alert('Không có sản phẩm hợp lệ trong giỏ hàng. Có thể do dữ liệu sản phẩm bị lỗi. Vui lòng thêm lại sản phẩm vào giỏ hàng.');
        return;
      }
      
      if (validItems.length < cart.length) {
        const removedCount = cart.length - validItems.length;
        alert(`Đã loại bỏ ${removedCount} sản phẩm không hợp lệ khỏi đơn hàng.`);
      }

      // Tạo order request
      const orderData: CreateOrderRequest = {
        items: validItems.map(item => ({
          productId: String(item.id).trim(), // Now using consistent id field
          quantity: Number(item.quantity) || 0,
          price: Number(item.price) || 0,
          name: (item.name || '').trim(),
          image: (item.image || '').trim()
        })),
        shippingAddress: {
          fullName: selectedAddress.fullName,
          phone: selectedAddress.phone,
          address: selectedAddress.address,
          ward: selectedAddress.ward || selectedAddress.wardName || '',
          district: selectedAddress.district || '',
          province: selectedAddress.street || ''
        },
        paymentMethod: selectedPayment.method,
        // Only include voucherCode if it exists and is not empty
        ...(voucher?.code && voucher.code.trim() ? { voucherCode: voucher.code.trim() } : {}),
        notes: ''
      };

      console.log('=== CHECKOUT DEBUG ===');
      console.log('Subtotal calculated on frontend:', subtotal);
      console.log('Voucher used:', voucher);
      console.log('Voucher discount calculated on frontend:', voucherDiscount);
      console.log('Expected total after discount:', subtotal - voucherDiscount);
      console.log('Order data to send:', orderData);
      console.log('======================');

      // Tạo đơn hàng
      console.log('Creating order with data:', orderData);
      const orderResponse = await orderService.createOrder(orderData);
      
      console.log('Raw order response:', orderResponse);
      console.log('Response type:', typeof orderResponse);
      console.log('Response keys:', Object.keys(orderResponse || {}));
      
      // Check multiple possible response structures
      const isSuccess = orderResponse?.success === true || 
                       (orderResponse && 'orderId' in orderResponse && 'orderNumber' in orderResponse);
      
      console.log('Is success?', isSuccess);
      
      if (isSuccess) {
        // Handle different response structures
        const data = orderResponse.data || orderResponse;
        const orderId = (data as any).orderId;
        const orderNumber = (data as any).orderNumber;
        const totalAmount = (data as any).totalAmount;
        const paymentMethod = (data as any).paymentMethod || orderData.paymentMethod;
        
        console.log('=== ORDER CREATION RESULT ===');
        console.log('Order created successfully:', { orderId, orderNumber, totalAmount, paymentMethod });
        console.log('Frontend expected total:', expectedTotal);
        console.log('Backend returned totalAmount:', totalAmount);
        console.log('Difference:', expectedTotal - totalAmount);
        console.log('Voucher discount applied by frontend:', voucherDiscount);
        console.log('Shipping fee applied by frontend:', shippingFee);
        console.log('==============================');
        
        // Handle payment processing based on payment method
        if (paymentMethod === 'momo' || paymentMethod === 'credit_card') {
          // For online payment methods (momo, credit_card), create payment and redirect
          try {
            console.log('Creating payment for online method:', paymentMethod);
            
            const paymentResponse = await paymentService.createPayment({
              orderId: orderId,
              paymentMethod: paymentMethod,
              amount: totalAmount,
              returnUrl: `${window.location.origin}/payment-result?method=${paymentMethod}`
            });

            console.log('Payment response:', paymentResponse);

            // Check for different possible redirect URL field names
            const redirectUrl = paymentResponse.data?.redirectUrl || 
                              paymentResponse.data?.payUrl ||
                              paymentResponse.redirectUrl ||
                              paymentResponse.payUrl ||
                              (paymentResponse as any).redirectUrl ||
                              (paymentResponse as any).payUrl;

            console.log('Final redirect URL found:', redirectUrl);

            if (paymentResponse.success && redirectUrl) {
              // Redirect to payment gateway - cart will be cleared after successful payment
              console.log('Redirecting to payment gateway:', redirectUrl);
              window.location.href = redirectUrl;
              return; // Don't proceed to success page yet
            } else {
              console.error('Payment creation failed - missing redirect URL');
              alert(`Không thể tạo link thanh toán ${paymentMethod.toUpperCase()}. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.`);
              setIsProcessingOrder(false);
              return;
            }
          } catch (paymentError) {
            console.error('Payment creation failed:', paymentError);
            alert(`Thanh toán ${paymentMethod.toUpperCase()} thất bại: ${paymentError instanceof Error ? paymentError.message : 'Lỗi không xác định'}. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.`);
            setIsProcessingOrder(false);
            return;
          }
        }
        
        // For COD and Bank Transfer - create payment record and proceed to success page
        if (paymentMethod === 'cod' || paymentMethod === 'bank_transfer') {
          try {
            console.log('Creating payment record for:', paymentMethod);
            
            const paymentResponse = await paymentService.createPayment({
              orderId: orderId,
              paymentMethod: paymentMethod,
              amount: totalAmount
            });

            console.log('Payment record created:', paymentResponse);

            if (paymentResponse.success) {
              // Clear cart for both COD and Bank Transfer after successful order creation
              await useCartStore.getState().clearCart();
              console.log('Cart cleared successfully');
              
              // Clear voucher after successful order
              if (voucher) {
                setVoucher(null);
                console.log('Voucher cleared from UI');
              }
              
              // Refresh user data to get updated voucher list
              await refreshUserData();
              console.log('User data refreshed');
            } else {
              console.error('Payment record creation failed:', paymentResponse);
              alert(`Không thể tạo bản ghi thanh toán. Đơn hàng đã được tạo nhưng có thể cần liên hệ admin.`);
            }
          } catch (paymentError) {
            console.error('Payment record creation failed:', paymentError);
            // Still proceed since order was created, but log the error
            console.warn('Order created but payment record failed. This may need manual admin intervention.');
            
            // Clear cart anyway since order was created
            try {
              await useCartStore.getState().clearCart();
              // Clear voucher anyway since order was created
              if (voucher) {
                setVoucher(null);
              }
              
              // Refresh user data anyway since order was created
              await refreshUserData();
            } catch (clearError) {
              console.error('Error clearing cart:', clearError);
            }
          }
        }
        
        // Show success alert
        alert(`Đặt hàng thành công! Mã đơn hàng: ${orderNumber}`);
        
        // Navigate to success page
        navigate(`/order-success?orderId=${orderId}&orderNumber=${orderNumber}`, { replace: true });
      } else {
        // Order creation failed
        console.error('Order creation failed:', orderResponse);
        alert(`Tạo đơn hàng thất bại: ${(orderResponse as any)?.message || 'Lỗi không xác định'}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      
      // Detailed error handling
      if (error instanceof Error) {
        if (error.message.includes('Insufficient stock')) {
          // Extract product ID from error message and find product name
          const productIdMatch = error.message.match(/product (\w+)/);
          let productName = 'một sản phẩm';
          
          if (productIdMatch) {
            const productId = productIdMatch[1];
            const product = cart.find(item => String(item.id) === productId);
            if (product) {
              productName = product.name;
            }
          }
          
          alert(`Xin lỗi! Sản phẩm "${productName}" không đủ số lượng trong kho. Vui lòng giảm số lượng hoặc xóa khỏi giỏ hàng và thử lại.`);
        } else if (error.message.includes('fetch')) {
          alert('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!');
        } else if (error.message.includes('401')) {
          alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
          navigate('/login');
        } else if (error.message.includes('400')) {
          alert(`Lỗi dữ liệu: ${error.message}. Vui lòng kiểm tra lại thông tin đơn hàng.`);
        } else {
          alert(`Lỗi: ${error.message}`);
        }
      } else {
        alert('Có lỗi không xác định xảy ra khi đặt hàng. Vui lòng thử lại!');
      }
    } finally {
      setIsProcessingOrder(false);
    }
  };

  return (
    <div className="bg-gradient-app-main min-h-screen flex flex-col">
      
      {/* Hero Section */}
      <div className="pt-0 pb-2">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-app-primary">
              💳 Thanh toán đơn hàng
            </h1>
            
            <p className="text-lg text-app-secondary break-words">
              {cartLoading ? (
                <span>🔄 Đang tải giỏ hàng...</span>
              ) : (
                <>
                  {cart.length} sản phẩm • Tổng tiền: <span className="font-semibold break-all">{subtotal.toLocaleString()}</span> ₫
                  {!isAuthenticated && (
                    <span className="block text-orange-600 text-base mt-2">
                      ⚠️ Vui lòng đăng nhập để hoàn tất đặt hàng
                    </span>
                  )}
                </>
              )}
              {!cartLoading && cart.length === 0 && (
                <span className="block text-red-600 text-base mt-2">
                  ⚠️ Giỏ hàng trống - vui lòng thêm sản phẩm trước khi checkout
                </span>
              )}
              {isAuthenticated && addresses.length === 0 && (
                <span className="block text-red-600 text-base mt-2">
                  ⚠️ Vui lòng thêm địa chỉ giao hàng để tiếp tục
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-8 pb-8 grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow">
        <div className="lg:col-span-2 space-y-6">
          {canCheckout ? (
            <CheckoutMain
              items={checkoutItems}
              userInfo={userDisplayInfo!}
              address={selectedAddress}
              payments={payments}
              onPaymentChange={handlePaymentChange}
            />
          ) : !isAuthenticated ? (
            <div className="bg-app-card rounded-2xl shadow-lg p-8 border border-red-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 13.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-app-primary mb-2">Vui lòng đăng nhập</h3>
                <p className="text-app-secondary mb-6">Bạn cần đăng nhập để tiếp tục thanh toán đơn hàng.</p>
                <div className="flex gap-4 justify-center">
                  <button 
                    className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
                    onClick={() => navigate('/login')}
                  >
                    Đăng nhập
                  </button>
                  <button 
                    className="px-6 py-3 border border-app-border text-app-secondary rounded-xl hover:bg-app-secondary-light transition"
                    onClick={() => navigate('/mycart')}
                  >
                    Quay lại giỏ hàng
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-app-card rounded-2xl shadow-lg p-8 border border-orange-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-app-primary mb-2">Chưa có địa chỉ giao hàng</h3>
                <p className="text-app-secondary mb-6">Bạn cần thêm địa chỉ giao hàng để tiếp tục thanh toán.</p>
                <div className="flex gap-4 justify-center">
                  <button 
                    className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition"
                    onClick={() => navigate('/myaddress')}
                  >
                    Thêm địa chỉ
                  </button>
                  <button 
                    className="px-6 py-3 border border-app-border text-app-secondary rounded-xl hover:bg-app-secondary-light transition"
                    onClick={() => navigate('/mycart')}
                  >
                    Quay lại giỏ hàng
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          {/* Voucher Selection Card */}
          <div className="bg-app-card rounded-2xl shadow-lg p-6 border border-green-100">
            <h3 className="text-lg font-semibold text-app-primary mb-4 flex items-center gap-2">
              🎫 Mã giảm giá
            </h3>
            <div className="flex items-center gap-3">
              {voucher ? (
                <div className="flex-1 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-green-700 block truncate">{voucher.code}</span>
                      <p className="text-sm text-green-600 break-words">{voucher.description}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button 
                        className="text-blue-600 text-sm hover:text-blue-700 font-medium transition whitespace-nowrap" 
                        onClick={() => setShowVoucherModal(true)}
                      >
                        Đổi
                      </button>
                      <button 
                        className="text-red-500 text-sm hover:text-red-600 font-medium transition whitespace-nowrap" 
                        onClick={() => setVoucher(null)}
                      >
                        Bỏ
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button 
                  className="flex-1 p-4 border-2 border-dashed border-green-300 rounded-xl text-green-600 hover:border-green-400 hover:bg-green-50 transition duration-200 flex items-center justify-center gap-2" 
                  onClick={() => setShowVoucherModal(true)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Chọn mã giảm giá
                </button>
              )}
            </div>
          </div>

          <ShopeeVoucherModal
            open={showVoucherModal}
            vouchers={availableVouchers.map(v => ({
              _id: v._id,
              code: v.code,
              label: v.label,
              description: v.description,
              minOrder: v.minOrder,
              discountType: v.discountType,
              discountValue: v.discountValue,
              expired: v.expired,
              usedPercent: v.usedPercent,
              onlyOn: v.onlyOn,
              disabled: !v.isActive,
              note: v.note
            }))}
            selectedVoucher={voucher ? {
              _id: voucher._id,
              code: voucher.code,
              label: voucher.label,
              description: voucher.description,
              minOrder: voucher.minOrder,
              discountType: voucher.discountType,
              discountValue: voucher.discountValue,
              expired: voucher.expired,
              usedPercent: voucher.usedPercent,
              onlyOn: voucher.onlyOn,
              disabled: !voucher.isActive,
              note: voucher.note
            } : null}
            onSelect={(v) => { 
              if (v) {
                // Convert back to User.Voucher format
                setVoucher({
                  _id: String(v._id),
                  code: v.code,
                  label: v.label,
                  description: v.description,
                  minOrder: v.minOrder,
                  discountType: v.discountType,
                  discountValue: v.discountValue,
                  expired: v.expired,
                  usedPercent: v.usedPercent,
                  currentUsage: 0, // Default value
                  onlyOn: v.onlyOn,
                  isActive: !v.disabled,
                  note: v.note,
                  createdAt: new Date().toISOString(), // Default value
                  updatedAt: new Date().toISOString() // Default value
                });
              } else {
                setVoucher(null);
              }
              setShowVoucherModal(false); 
            }}
            onClose={() => setShowVoucherModal(false)}
          />
          
          {/* Checkout Summary */}
          {canCheckout ? (
            <CheckoutSummary
              cart={cart}
              address={selectedAddress}
              payments={payments}
              userInfo={userDisplayInfo}
              voucherDiscount={voucherDiscount}
              voucher={voucher ? { 
                code: voucher.code,
                description: voucher.description,
                discount: voucher.discountValue
              } : null}
              onRemoveVoucher={() => setVoucher(null)}
              onShowVoucherModal={() => setShowVoucherModal(true)}
              onPaymentSelect={handlePaymentSelect}
              onCheckout={handleCheckout}
              isProcessing={isProcessingOrder}
            />
          ) : !isAuthenticated ? (
            <div className="bg-app-card rounded-2xl shadow-lg p-6 border border-red-100">
              <h3 className="text-lg font-semibold text-app-primary mb-4 flex items-center gap-2">
                🔒 Chưa đăng nhập
              </h3>
              <p className="text-app-secondary mb-4">
                Vui lòng đăng nhập để xem thông tin đặt hàng và thanh toán.
              </p>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-app-secondary">
                  <span>Tạm tính ({cart.length} sản phẩm)</span>
                  <span className="font-medium text-app-primary break-all">{subtotal.toLocaleString()} ₫</span>
                </div>
                {voucher && voucherDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="truncate">Giảm giá ({voucher.code})</span>
                    <span className="break-all">-{voucherDiscount.toLocaleString()} ₫</span>
                  </div>
                )}
                <div className="border-t border-app-border pt-3 flex justify-between font-semibold text-app-primary">
                  <span>Tạm tính</span>
                  <span className="break-all">{(subtotal - voucherDiscount).toLocaleString()} ₫</span>
                </div>
                <button
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium transition"
                  onClick={() => navigate('/login')}
                >
                  Đăng nhập để thanh toán
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-app-card rounded-2xl shadow-lg p-6 border border-orange-100">
              <h3 className="text-lg font-semibold text-app-primary mb-4 flex items-center gap-2">
                📍 Chưa có địa chỉ
              </h3>
              <p className="text-app-secondary mb-4">
                Vui lòng thêm địa chỉ giao hàng để tiếp tục thanh toán.
              </p>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-app-secondary">
                  <span>Tạm tính ({cart.length} sản phẩm)</span>
                  <span className="font-medium text-app-primary">{subtotal.toLocaleString()} ₫</span>
                </div>
                {voucher && voucherDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá ({voucher.code})</span>
                    <span>-{voucherDiscount.toLocaleString()} ₫</span>
                  </div>
                )}
                <div className="border-t border-app-border pt-3 flex justify-between font-semibold text-app-primary">
                  <span>Tạm tính</span>
                  <span>{(subtotal - voucherDiscount).toLocaleString()} ₫</span>
                </div>
                <button
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-medium transition"
                  onClick={() => navigate('/myaddress')}
                >
                  Thêm địa chỉ giao hàng
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      {/* <Footer /> */}
    </div>
  );
};

export default Checkout;
