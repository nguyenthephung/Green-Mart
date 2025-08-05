import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, CreditCard, Phone, MapPin } from 'lucide-react';

const GuestOrderSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const orderData = location.state || {};
  const {
    orderId,
    orderNumber,
    totalAmount,
    paymentMethod,
    paymentUrl,
  } = orderData;

  const handleContinueShopping = () => {
    navigate('/');
  };

  const handlePayNow = () => {
    if (paymentUrl) {
      window.open(paymentUrl, '_blank');
    }
  };

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-4">
            Không tìm thấy thông tin đơn hàng
          </h2>
          <button
            onClick={handleContinueShopping}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Đặt hàng thành công!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Cảm ơn bạn đã tin tưởng và mua sắm tại GreenMart
          </p>
        </div>

        {/* Order Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2 text-green-600" />
            Thông tin đơn hàng
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Mã đơn hàng:</span>
              <span className="font-medium text-gray-900 dark:text-white">{orderNumber}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tổng tiền:</span>
              <span className="font-bold text-lg text-green-600 dark:text-green-400">
                {totalAmount?.toLocaleString('vi-VN')}₫
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Phương thức thanh toán:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {paymentMethod === 'cash' && 'Thanh toán khi nhận hàng (COD)'}
                {paymentMethod === 'momo' && 'Ví MoMo'}
                {paymentMethod === 'bank_transfer' && 'Chuyển khoản ngân hàng'}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Action (if needed) */}
        {paymentMethod !== 'cash' && paymentUrl && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6">
            <div className="flex items-center mb-3">
              <CreditCard className="w-5 h-5 mr-2 text-yellow-600 dark:text-yellow-400" />
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                Hoàn tất thanh toán
              </h3>
            </div>
            <p className="text-yellow-700 dark:text-yellow-300 mb-4">
              Vui lòng hoàn tất thanh toán để xác nhận đơn hàng của bạn.
            </p>
            <button
              onClick={handlePayNow}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Thanh toán ngay
            </button>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
            Các bước tiếp theo:
          </h3>
          <div className="space-y-2 text-blue-700 dark:text-blue-300">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span>Chúng tôi sẽ xác nhận đơn hàng trong vòng 15-30 phút</span>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span>Nhân viên sẽ liên hệ với bạn để xác nhận thông tin giao hàng</span>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span>Đơn hàng sẽ được giao trong vòng 1-2 ngày làm việc</span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Cần hỗ trợ?
          </h3>
          <div className="space-y-2">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Phone className="w-4 h-4 mr-2" />
              <span>Hotline: 1900 1234</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4 mr-2" />
              <span>Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleContinueShopping}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            Tiếp tục mua sắm
          </button>
          
          <button
            onClick={() => window.print()}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            In đơn hàng
          </button>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Vui lòng lưu lại mã đơn hàng <strong>{orderNumber}</strong> để tra cứu và hỗ trợ
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuestOrderSuccessPage;
