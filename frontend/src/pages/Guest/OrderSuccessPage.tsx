import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircleIcon, TruckIcon, CreditCardIcon } from '@heroicons/react/24/solid';

const OrderSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');

  if (!orderId || !orderNumber) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Lỗi</h2>
            <p className="text-red-600">Không tìm thấy thông tin đơn hàng</p>
            <Link to="/cart" className="mt-4 inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Quay lại giỏ hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h1>
          <p className="text-lg text-gray-600">
            Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được tạo thành công.
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Đơn hàng #{orderNumber}
              </h2>
              <p className="text-gray-600">
                Ngày đặt: {new Date().toLocaleDateString('vi-VN')}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-sm font-medium text-yellow-600 bg-yellow-100">
              Chờ xác nhận
            </span>
          </div>

          {/* Order Status Progress */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Trạng thái đơn hàng</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  ✓
                </div>
                <span className="ml-2 text-sm text-gray-900">Đã đặt hàng</span>
              </div>
              <div className="flex-1 h-1 bg-gray-200"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm">
                  2
                </div>
                <span className="ml-2 text-sm text-gray-500">Xác nhận</span>
              </div>
              <div className="flex-1 h-1 bg-gray-200"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm">
                  3
                </div>
                <span className="ml-2 text-sm text-gray-500">Giao hàng</span>
              </div>
              <div className="flex-1 h-1 bg-gray-200"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm">
                  4
                </div>
                <span className="ml-2 text-sm text-gray-500">Hoàn thành</span>
              </div>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Bước tiếp theo</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <CreditCardIcon className="h-6 w-6 text-blue-500 mt-1 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Thanh toán</h4>
                <p className="text-gray-600">
                  Đơn hàng của bạn sẽ được xác nhận sau khi thanh toán thành công.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <TruckIcon className="h-6 w-6 text-green-500 mt-1 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Giao hàng</h4>
                <p className="text-gray-600">
                  Chúng tôi sẽ giao hàng đến địa chỉ bạn đã cung cấp trong 2-3 ngày làm việc.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors text-center"
          >
            Tiếp tục mua sắm
          </Link>
          <Link
            to="myorder"
            className="bg-white text-green-600 border border-green-600 px-6 py-3 rounded-lg hover:bg-green-50 transition-colors text-center"
          >
            Xem đơn hàng của tôi
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;