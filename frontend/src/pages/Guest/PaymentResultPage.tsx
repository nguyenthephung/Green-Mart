import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import orderService from '../../services/orderService';
import { useCartStore } from '../../stores/useCartStore';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface PaymentResult {
  success: boolean;
  message: string;
  orderId?: string;
  transactionId?: string;
  amount?: number;
  paymentMethod?: string;
}

const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const { clearCart } = useCartStore();

  useEffect(() => {
    const processPaymentResult = async () => {
      try {
        setLoading(true);

        // Get payment method from URL
        const paymentMethod = searchParams.get('method') || 
                            searchParams.get('vnp_TmnCode') ? 'vnpay' :
                            searchParams.get('partnerCode') ? 'momo' :
                            searchParams.get('status') ? 'zalopay' : 'unknown';

        let paymentResult: PaymentResult;

        // Process different payment methods
        if (paymentMethod === 'vnpay') {
          paymentResult = await processVNPayResult();
        } else if (paymentMethod === 'momo') {
          paymentResult = await processMoMoResult();
        } else if (paymentMethod === 'zalopay') {
          paymentResult = await processZaloPayResult();
        } else {
          // Generic processing
          paymentResult = await processGenericResult();
        }

        setResult(paymentResult);

        // Clear cart only if payment was successful
        if (paymentResult.success) {
          clearCart();
        }

        // Fetch order details if available
        if (paymentResult.orderId) {
          try {
            const orderData = await orderService.getOrder(paymentResult.orderId);
            setOrder(orderData);
          } catch (error) {
            console.error('Failed to fetch order details:', error);
          }
        }

      } catch (error) {
        console.error('Payment result processing error:', error);
        setResult({
          success: false,
          message: 'Có lỗi xảy ra khi xử lý kết quả thanh toán'
        });
      } finally {
        setLoading(false);
      }
    };

    processPaymentResult();
  }, [searchParams]);

  const processVNPayResult = async (): Promise<PaymentResult> => {
    const vnpResponseCode = searchParams.get('vnp_ResponseCode');
    const vnpTxnRef = searchParams.get('vnp_TxnRef');
    const vnpAmount = searchParams.get('vnp_Amount');
    const vnpTransactionNo = searchParams.get('vnp_TransactionNo');

    if (vnpResponseCode === '00') {
      return {
        success: true,
        message: 'Thanh toán VNPay thành công',
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
        message: errorMessages[vnpResponseCode || ''] || 'Thanh toán VNPay không thành công',
        orderId: vnpTxnRef || undefined,
        paymentMethod: 'vnpay'
      };
    }
  };

  const processMoMoResult = async (): Promise<PaymentResult> => {
    const resultCode = searchParams.get('resultCode');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');
    const transId = searchParams.get('transId');

    if (resultCode === '0') {
      return {
        success: true,
        message: 'Thanh toán MoMo thành công',
        orderId: orderId || undefined,
        transactionId: transId || undefined,
        amount: amount ? parseInt(amount) : undefined,
        paymentMethod: 'momo'
      };
    } else {
      const errorMessages: { [key: string]: string } = {
        '1': 'Giao dịch thất bại',
        '2': 'Giao dịch bị từ chối',
        '3': 'Giao dịch bị hủy',
        '4': 'Giao dịch đang chờ xử lý',
        '5': 'Giao dịch không hợp lệ',
        '6': 'Giao dịch bị từ chối do vi phạm chính sách',
        '7': 'Giao dịch bị hết hạn',
        '1000': 'Giao dịch được khởi tạo, chờ người dùng xác nhận thanh toán',
        '1001': 'Giao dịch đang được xử lý',
        '1002': 'Giao dịch bị từ chối do sai thông tin',
        '1003': 'Giao dịch bị hủy',
        '1004': 'Giao dịch thất bại do hết tiền trong tài khoản',
        '1005': 'Giao dịch thất bại do url hoặc QR code đã hết hạn',
        '1006': 'Giao dịch thất bại do người dùng đã hủy thanh toán',
        '1007': 'Giao dịch thất bại do tài khoản người dùng bị khóa',
        '4001': 'Giao dịch thất bại do sai định dạng dữ liệu gửi lên',
        '4100': 'Giao dịch thất bại do hết hạn',
      };

      return {
        success: false,
        message: errorMessages[resultCode || ''] || 'Thanh toán MoMo không thành công',
        orderId: orderId || undefined,
        paymentMethod: 'momo'
      };
    }
  };

  const processZaloPayResult = async (): Promise<PaymentResult> => {
    const status = searchParams.get('status');
    const orderId = searchParams.get('apptransid');
    const amount = searchParams.get('amount');

    if (status === '1') {
      return {
        success: true,
        message: 'Thanh toán ZaloPay thành công',
        orderId: orderId || undefined,
        amount: amount ? parseInt(amount) : undefined,
        paymentMethod: 'zalopay'
      };
    } else {
      return {
        success: false,
        message: 'Thanh toán ZaloPay không thành công',
        orderId: orderId || undefined,
        paymentMethod: 'zalopay'
      };
    }
  };

  const processGenericResult = async (): Promise<PaymentResult> => {
    const success = searchParams.get('success') === 'true';
    const orderId = searchParams.get('orderId');
    const message = searchParams.get('message');

    return {
      success,
      message: message || (success ? 'Thanh toán thành công' : 'Thanh toán không thành công'),
      orderId: orderId || undefined
    };
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  const handleViewOrder = () => {
    if (result?.orderId) {
      navigate(`/track-order?id=${result.orderId}`);
    }
  };

  const handleViewOrders = () => {
    navigate('/orders');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang xử lý kết quả thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        {/* Status Icon */}
        <div className="text-center mb-6">
          {result?.success ? (
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          ) : (
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          )}
          
          <h1 className={`text-2xl font-bold mb-2 ${result?.success ? 'text-green-700' : 'text-red-700'}`}>
            {result?.success ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}
          </h1>
          
          <p className="text-gray-600 text-sm">
            {result?.message}
          </p>
        </div>

        {/* Order Details */}
        {result?.success && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
            {result.orderId && (
              <div className="flex justify-between">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-medium text-gray-900">{result.orderId}</span>
              </div>
            )}
            
            {result.transactionId && (
              <div className="flex justify-between">
                <span className="text-gray-600">Mã giao dịch:</span>
                <span className="font-medium text-gray-900">{result.transactionId}</span>
              </div>
            )}
            
            {result.amount && (
              <div className="flex justify-between">
                <span className="text-gray-600">Số tiền:</span>
                <span className="font-medium text-green-600">{result.amount.toLocaleString()} ₫</span>
              </div>
            )}
            
            {result.paymentMethod && (
              <div className="flex justify-between">
                <span className="text-gray-600">Phương thức:</span>
                <span className="font-medium text-gray-900 capitalize">
                  {result.paymentMethod === 'vnpay' ? 'VNPay' :
                   result.paymentMethod === 'momo' ? 'MoMo' :
                   result.paymentMethod === 'zalopay' ? 'ZaloPay' :
                   result.paymentMethod}
                </span>
              </div>
            )}

            {order && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái đơn hàng:</span>
                  <span className={`font-medium ${
                    order.status === 'completed' ? 'text-green-600' :
                    order.status === 'pending' ? 'text-yellow-600' :
                    order.status === 'cancelled' ? 'text-red-600' :
                    'text-blue-600'
                  }`}>
                    {order.status === 'pending' ? 'Chờ xác nhận' :
                     order.status === 'confirmed' ? 'Đã xác nhận' :
                     order.status === 'preparing' ? 'Đang chuẩn bị' :
                     order.status === 'shipping' ? 'Đang giao hàng' :
                     order.status === 'delivered' ? 'Đã giao hàng' :
                     order.status === 'completed' ? 'Hoàn thành' :
                     order.status === 'cancelled' ? 'Đã hủy' :
                     order.status}
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {result?.success && result.orderId && (
            <button
              onClick={handleViewOrder}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Theo dõi đơn hàng
            </button>
          )}
          
          <button
            onClick={result?.success ? handleViewOrders : handleContinueShopping}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {result?.success ? 'Xem tất cả đơn hàng' : 'Tiếp tục mua sắm'}
          </button>
          
          <button
            onClick={handleContinueShopping}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Về trang chủ
          </button>
        </div>

        {/* Additional Information */}
        {result?.success && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Lưu ý quan trọng:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Đơn hàng của bạn đã được xác nhận và đang được xử lý</li>
                  <li>Bạn sẽ nhận được email xác nhận trong vài phút tới</li>
                  <li>Có thể theo dõi trạng thái đơn hàng trong trang "Đơn hàng của tôi"</li>
                  <li>Liên hệ hotline nếu cần hỗ trợ: 1900-xxxx</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentResultPage;
