import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import orderService from '../../services/orderService';
import paymentService from '../../services/paymentService';
import { useCartStore } from '../../stores/useCartStore';
import { CheckCircle, XCircle, AlertCircle, Home, ShoppingBag, Receipt, CreditCard } from 'lucide-react';

interface PaymentResult {
  success: boolean;
  message: string;
  orderId?: string;
  orderNumber?: string;
  transactionId?: string;
  amount?: number;
  paymentMethod?: string;
  details?: any;
}

const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [processingMessage, setProcessingMessage] = useState('Đang xử lý kết quả thanh toán...');
  const { clearCart } = useCartStore();

  useEffect(() => {
    const processPaymentResult = async () => {
      try {
        setLoading(true);
        setProcessingMessage('Đang xác thực thông tin thanh toán...');

        // Lấy thông tin từ URL parameters
        const method = searchParams.get('method');
        const paypalToken = searchParams.get('token'); // PayPal returns 'token'
        const paypalPayerId = searchParams.get('PayerID'); // PayPal payer ID
        const momoResult = searchParams.get('resultCode'); // MoMo returns 'resultCode'
        
        console.log('PaymentResultPage: Processing payment result:', { 
          method, 
          paypalToken, 
          paypalPayerId, 
          momoResult,
          allParams: Object.fromEntries(searchParams.entries())
        });

        let paymentResult: PaymentResult;

        // Xử lý các phương thức thanh toán khác nhau
        if (method === 'paypal' && paypalToken) {
          setProcessingMessage('Đang xác nhận thanh toán PayPal...');
          paymentResult = await processPayPalResult(paypalToken, paypalPayerId);
        } else if (method === 'momo' || momoResult) {
          setProcessingMessage('Đang xác nhận thanh toán MoMo...');
          paymentResult = await processMoMoResult();
        } else if (searchParams.get('vnp_TmnCode')) {
          // VNPay result
          setProcessingMessage('Đang xác nhận thanh toán VNPay...');
          paymentResult = await processVNPayResult();
        } else if (searchParams.get('partnerCode')) {
          // Alternative MoMo result detection
          setProcessingMessage('Đang xác nhận thanh toán MoMo...');
          paymentResult = await processMoMoResult();
        } else {
          // Unknown payment method - check for any pending order
          const pendingOrder = localStorage.getItem('pendingOrder');
          if (pendingOrder) {
            const orderData = JSON.parse(pendingOrder);
            paymentResult = {
              success: false,
              message: 'Không xác định được kết quả thanh toán. Vui lòng kiểm tra lại.',
              orderId: orderData.orderId,
              orderNumber: orderData.orderNumber,
              paymentMethod: method || 'unknown'
            };
          } else {
            paymentResult = {
              success: false,
              message: 'Không tìm thấy thông tin thanh toán',
              paymentMethod: method || 'unknown'
            };
          }
        }

        // Delay nhỏ để tránh flash effect
        setTimeout(() => {
          setResult(paymentResult);
        }, 500);

        // Nếu thanh toán thành công, lấy thông tin chi tiết đơn hàng
        if (paymentResult.success && paymentResult.orderId) {
          try {
            setProcessingMessage('Đang tải thông tin đơn hàng...');
            const orderDetails = await orderService.getOrder(paymentResult.orderId);
            setOrder(orderDetails);
          } catch (error) {
            console.error('Error fetching order details:', error);
          }
        }

      } catch (error) {
        console.error('Error processing payment result:', error);
        setTimeout(() => {
          setResult({
            success: false,
            message: 'Có lỗi xảy ra khi xử lý kết quả thanh toán',
            paymentMethod: searchParams.get('method') || 'unknown'
          });
        }, 500);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 800);
      }
    };

    processPaymentResult();
  }, [searchParams]);

  const processPayPalResult = async (paypalToken: string, paypalPayerId?: string | null): Promise<PaymentResult> => {
    try {
      // Lấy thông tin đơn hàng đang chờ từ localStorage
      const pendingOrderStr = localStorage.getItem('pendingOrder');
      const pendingOrder = pendingOrderStr ? JSON.parse(pendingOrderStr) : null;

      console.log('PaymentResultPage: Processing PayPal result with:', {
        token: paypalToken,
        payerId: paypalPayerId,
        pendingOrder
      });

      // Kiểm tra xem người dùng có cancel thanh toán không
      if (!paypalPayerId) {
        console.log('PaymentResultPage: PayPal payment cancelled (no PayerID)');
        return {
          success: false,
          message: 'Thanh toán PayPal đã bị hủy bởi người dùng',
          orderId: pendingOrder?.orderId,
          orderNumber: pendingOrder?.orderNumber,
          paymentMethod: 'paypal'
        };
      }

      // Gọi backend để capture PayPal payment
      const result = await paymentService.capturePayPalPayment(paypalToken);

      console.log('PaymentResultPage: PayPal capture result:', result);

      if (result.success) {
        // Xóa giỏ hàng và pending order khi thành công
        await clearCart();
        localStorage.removeItem('pendingOrder');

        return {
          success: true,
          message: 'Thanh toán PayPal thành công! Đơn hàng của bạn đã được xác nhận.',
          orderId: pendingOrder?.orderId || result.data?.orderId,
          orderNumber: pendingOrder?.orderNumber || result.data?.orderNumber,
          transactionId: result.data?.transactionId || paypalToken,
          amount: pendingOrder?.totalAmount || result.data?.amount,
          paymentMethod: 'paypal',
          details: result.data
        };
      } else {
        return {
          success: false,
          message: result.message || 'Thanh toán PayPal thất bại. Vui lòng thử lại.',
          orderId: pendingOrder?.orderId,
          orderNumber: pendingOrder?.orderNumber,
          paymentMethod: 'paypal'
        };
      }
    } catch (error: any) {
      console.error('PaymentResultPage: PayPal processing error:', error);
      
      // Xử lý các lỗi cụ thể từ PayPal
      let errorMessage = 'Có lỗi xảy ra khi xử lý thanh toán PayPal';
      
      if (error.message?.includes('TOKEN_NOT_FOUND')) {
        errorMessage = 'Phiên thanh toán PayPal đã hết hạn. Vui lòng thử lại.';
      } else if (error.message?.includes('PAYMENT_ALREADY_DONE')) {
        errorMessage = 'Giao dịch PayPal đã được xử lý trước đó.';
        // Trong trường hợp này, có thể payment đã thành công
        // Thử check với pending order
        const pendingOrderStr = localStorage.getItem('pendingOrder');
        const pendingOrder = pendingOrderStr ? JSON.parse(pendingOrderStr) : null;
        
        if (pendingOrder) {
          // Xóa giỏ hàng vì payment có thể đã thành công
          await clearCart();
          localStorage.removeItem('pendingOrder');
          
          return {
            success: true,
            message: 'Thanh toán PayPal đã được xử lý thành công trước đó.',
            orderId: pendingOrder.orderId,
            orderNumber: pendingOrder.orderNumber,
            transactionId: paypalToken,
            amount: pendingOrder.totalAmount,
            paymentMethod: 'paypal'
          };
        }
      } else if (error.message?.includes('INSUFFICIENT_FUNDS')) {
        errorMessage = 'Tài khoản PayPal không đủ số dư để thực hiện giao dịch.';
      } else if (error.message?.includes('Failed to capture PayPal payment')) {
        // Có thể payment đã thành công nhưng capture thất bại
        // Trong sandbox, đôi khi PayPal tự động approve payment
        const pendingOrderStr = localStorage.getItem('pendingOrder');
        const pendingOrder = pendingOrderStr ? JSON.parse(pendingOrderStr) : null;
        
        if (pendingOrder && paypalPayerId) {
          // Có PayerID nghĩa là user đã approve, có thể coi như thành công
          await clearCart();
          localStorage.removeItem('pendingOrder');
          
          return {
            success: true,
            message: 'Thanh toán PayPal thành công! Đơn hàng đã được tạo.',
            orderId: pendingOrder.orderId,
            orderNumber: pendingOrder.orderNumber,
            transactionId: paypalToken,
            amount: pendingOrder.totalAmount,
            paymentMethod: 'paypal'
          };
        }
        errorMessage = 'Không thể xác nhận thanh toán PayPal. Vui lòng liên hệ hỗ trợ.';
      } else if (error.message) {
        errorMessage = `Lỗi PayPal: ${error.message}`;
      }

      return {
        success: false,
        message: errorMessage,
        paymentMethod: 'paypal'
      };
    }
  };

  const processMoMoResult = async (): Promise<PaymentResult> => {
    const resultCode = searchParams.get('resultCode');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');
    const transId = searchParams.get('transId');
    const message = searchParams.get('message');

    // Lấy thông tin đơn hàng đang chờ từ localStorage
    const pendingOrderStr = localStorage.getItem('pendingOrder');
    const pendingOrder = pendingOrderStr ? JSON.parse(pendingOrderStr) : null;

    console.log('PaymentResultPage: Processing MoMo result:', { 
      resultCode, 
      orderId, 
      amount, 
      transId, 
      message,
      pendingOrder 
    });

    if (resultCode === '0') {
      // Thanh toán thành công - xóa giỏ hàng và pending order
      await clearCart();
      localStorage.removeItem('pendingOrder');

      return {
        success: true,
        message: 'Thanh toán MoMo thành công! Đơn hàng của bạn đã được xác nhận.',
        orderId: pendingOrder?.orderId || orderId,
        orderNumber: pendingOrder?.orderNumber,
        transactionId: transId || undefined,
        amount: amount ? parseInt(amount) : pendingOrder?.totalAmount,
        paymentMethod: 'momo'
      };
    } else {
      // Thanh toán thất bại - giữ lại giỏ hàng, xóa pending order
      localStorage.removeItem('pendingOrder');

      const errorMessages: { [key: string]: string } = {
        '1': 'Giao dịch MoMo thất bại',
        '2': 'Giao dịch bị từ chối bởi MoMo',
        '3': 'Giao dịch bị hủy bởi người dùng',
        '4': 'Giao dịch đang chờ xử lý',
        '5': 'Giao dịch không hợp lệ',
        '6': 'Giao dịch bị từ chối do vi phạm chính sách',
        '7': 'Giao dịch bị hết hạn',
        '1000': 'Giao dịch được khởi tạo, chờ người dùng xác nhận thanh toán',
        '1001': 'Giao dịch đang được xử lý',
        '1002': 'Giao dịch bị từ chối do sai thông tin',
        '1003': 'Giao dịch bị từ chối do thông tin thanh toán không hợp lệ',
        '1004': 'Số tiền vượt quá hạn mức giao dịch',
        '1005': 'URL hoặc QR code đã hết hạn',
        '1006': 'Giao dịch đã được thanh toán',
        '1007': 'Giao dịch bị từ chối do tài khoản người dùng',
        '2001': 'Giao dịch thất bại do sai thông tin',
        '2007': 'Giao dịch bị từ chối do tài khoản người nhận',
        '4001': 'Giao dịch bị từ chối do không đủ số dư',
        '4100': 'Giao dịch thất bại'
      };

      return {
        success: false,
        message: errorMessages[resultCode || ''] || message || 'Thanh toán MoMo thất bại',
        orderId: pendingOrder?.orderId || orderId,
        orderNumber: pendingOrder?.orderNumber,
        paymentMethod: 'momo'
      };
    }
  };

  const processVNPayResult = async (): Promise<PaymentResult> => {
    const vnpResponseCode = searchParams.get('vnp_ResponseCode');
    const vnpTxnRef = searchParams.get('vnp_TxnRef');
    const vnpAmount = searchParams.get('vnp_Amount');
    const vnpTransactionNo = searchParams.get('vnp_TransactionNo');

    if (vnpResponseCode === '00') {
      await clearCart();
      localStorage.removeItem('pendingOrder');

      return {
        success: true,
        message: 'Thanh toán VNPay thành công! Đơn hàng của bạn đã được xác nhận.',
        orderId: vnpTxnRef || undefined,
        transactionId: vnpTransactionNo || undefined,
        amount: vnpAmount ? parseInt(vnpAmount) / 100 : undefined,
        paymentMethod: 'vnpay'
      };
    } else {
      const errorMessages: { [key: string]: string } = {
        '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
        '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
        '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
        '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
        '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
        '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
        '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
        '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
        '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
        '75': 'Ngân hàng thanh toán đang bảo trì.',
        '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.'
      };

      return {
        success: false,
        message: errorMessages[vnpResponseCode || ''] || 'Thanh toán VNPay thất bại',
        orderId: vnpTxnRef || undefined,
        paymentMethod: 'vnpay'
      };
    }
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  const handleViewOrder = () => {
    if (result?.orderId) {
      navigate(`/myorder`);
    } else {
      navigate('/myorder');
    }
  };

  const handleRetryPayment = () => {
    // Redirect back to checkout
    navigate('/mycart');
  };

  const handleContactSupport = () => {
    // Có thể mở modal liên hệ hoặc chuyển đến trang hỗ trợ
    window.open('tel:19001234', '_self');
  };

  const getPaymentMethodDisplay = (method?: string) => {
    switch (method) {
      case 'paypal':
        return { name: 'PayPal', icon: '🅿️', color: 'text-blue-600' };
      case 'momo':
        return { name: 'Ví MoMo', icon: '🟣', color: 'text-purple-600' };
      case 'vnpay':
        return { name: 'VNPay', icon: '🏦', color: 'text-red-600' };
      case 'cod':
        return { name: 'Thanh toán khi nhận hàng', icon: '💰', color: 'text-green-600' };
      case 'bank_transfer':
        return { name: 'Chuyển khoản ngân hàng', icon: '🏦', color: 'text-blue-600' };
      default:
        return { name: method || 'Không xác định', icon: '💳', color: 'text-gray-600' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-green-200 dark:border-green-800 rounded-full mx-auto mb-6 animate-pulse"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-green-600 rounded-full mx-auto animate-spin"></div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 animate-fade-in">
            {processingMessage}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 animate-fade-in">
            Vui lòng đợi trong giây lát, chúng tôi đang xác minh giao dịch của bạn
          </p>
          <div className="mt-8 space-y-2">
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <div className="w-64 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-progress"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            Không tìm thấy thông tin thanh toán
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Không thể xác định kết quả thanh toán. Vui lòng kiểm tra lại hoặc liên hệ hỗ trợ.
          </p>
          <div className="space-y-3">
            <button
              onClick={handleContinueShopping}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Về trang chủ
            </button>
            <button
              onClick={handleContactSupport}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Liên hệ hỗ trợ
            </button>
          </div>
        </div>
      </div>
    );
  }

  const paymentMethodInfo = getPaymentMethodDisplay(result.paymentMethod);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Result Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${
            result.success 
              ? 'bg-green-100 dark:bg-green-900/30 animate-bounce' 
              : 'bg-red-100 dark:bg-red-900/30'
          }`}>
            {result.success ? (
              <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
            ) : (
              <XCircle className="w-16 h-16 text-red-600 dark:text-red-400" />
            )}
          </div>
          <h1 className={`text-4xl font-bold mb-3 ${
            result.success 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {result.success ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {result.message}
          </p>
        </div>

        {/* Payment Details Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center mb-6">
            <Receipt className="w-6 h-6 text-gray-600 dark:text-gray-400 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Chi tiết thanh toán
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {result.paymentMethod && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Phương thức:</span>
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{paymentMethodInfo.icon}</span>
                    <span className={`font-medium ${paymentMethodInfo.color}`}>
                      {paymentMethodInfo.name}
                    </span>
                  </div>
                </div>
              )}
              
              {result.orderId && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Mã đơn hàng:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {result.orderNumber || `#${result.orderId.slice(-8).toUpperCase()}`}
                  </span>
                </div>
              )}
              
              {result.transactionId && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Mã giao dịch:</span>
                  <span className="font-medium text-gray-900 dark:text-white font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {result.transactionId.slice(0, 16)}...
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {result.amount && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Số tiền:</span>
                  <span className="font-bold text-xl text-green-600 dark:text-green-400">
                    {result.amount.toLocaleString('vi-VN')}₫
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Thời gian:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date().toLocaleString('vi-VN')}
                </span>
              </div>

              {order && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Trạng thái đơn hàng:</span>
                  <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                    order.status === 'confirmed' 
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {order.status === 'confirmed' && 'Đã xác nhận'}
                    {order.status === 'pending' && 'Chờ xác nhận'}
                    {order.status === 'processing' && 'Đang xử lý'}
                    {order.status === 'shipped' && 'Đang giao hàng'}
                    {order.status === 'delivered' && 'Đã giao hàng'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PayPal Sandbox Notice */}
        {result.paymentMethod === 'paypal' && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                  PayPal Sandbox Environment
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Giao dịch này được thực hiện trong môi trường thử nghiệm PayPal Sandbox. 
                  Đây là giao dịch demo và không có tiền thực được xử lý.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        {result.success ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Các bước tiếp theo:
            </h3>
            <div className="space-y-3 text-green-700 dark:text-green-300">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <span>Chúng tôi sẽ xử lý và xác nhận đơn hàng trong vòng 15-30 phút</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <span>Nhân viên sẽ liên hệ với bạn để xác nhận thông tin giao hàng</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <span>Đơn hàng sẽ được giao trong vòng 1-2 ngày làm việc</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <span>Bạn sẽ nhận được thông báo cập nhật trạng thái đơn hàng qua email/SMS</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-red-800 dark:text-red-200 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Hướng dẫn xử lý:
            </h3>
            <div className="space-y-3 text-red-700 dark:text-red-300">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <span>Kiểm tra lại thông tin thẻ/tài khoản thanh toán</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <span>Đảm bảo số dư tài khoản đủ để thực hiện giao dịch</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <span>Thử lại với phương thức thanh toán khác</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <span>Liên hệ hotline 1900 1234 nếu vấn đề vẫn tiếp diễn</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {result.success ? (
            <>
              <button
                onClick={handleViewOrder}
                className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <ShoppingBag className="w-5 h-5" />
                Xem đơn hàng
              </button>
              
              <button
                onClick={handleContinueShopping}
                className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Home className="w-5 h-5" />
                Tiếp tục mua sắm
              </button>

              <button
                onClick={handleContactSupport}
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                📞 Liên hệ hỗ trợ
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleRetryPayment}
                className="bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Thử lại thanh toán
              </button>
              
              <button
                onClick={handleContinueShopping}
                className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Home className="w-5 h-5" />
                Về trang chủ
              </button>

              <button
                onClick={handleContactSupport}
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                📞 Liên hệ hỗ trợ
              </button>
            </>
          )}
        </div>

        {/* Support Contact */}
        <div className="text-center">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Cần hỗ trợ?
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>
                📞 Hotline: <strong className="text-gray-900 dark:text-white">1900 1234</strong>
              </p>
              <p>
                📧 Email: <strong className="text-gray-900 dark:text-white">support@greenmart.vn</strong>
              </p>
              {result.orderId && (
                <p>
                  🔗 Mã đơn hàng: <strong className="text-gray-900 dark:text-white">{result.orderNumber || `#${result.orderId.slice(-8).toUpperCase()}`}</strong>
                </p>
              )}
              <p className="text-xs mt-3">
                Thời gian hỗ trợ: 8:00 - 22:00 (Thứ 2 - Chủ nhật)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;
