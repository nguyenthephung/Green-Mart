import type { FC } from 'react';
import { CreditCard, CalendarDays } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Item {
  id: string | number;
  name: string;
  image: string;
  price: number;
  unit: string;
  quantity: number;
  type?: 'count' | 'weight';
  weight?: number;
  isSale?: boolean;
  salePrice?: number;
  flashSale?: {
    flashSaleId: string;
    isFlashSale: boolean;
    originalPrice: number;
    discountPercentage: number;
  };
}

interface UserInfo {
  fullName: string;
  phone: string;
  email?: string;
}

interface AddressInfo {
  address: string;
  district?: string;
  ward?: string;
  city?: string;
}

interface PaymentInfo {
  id: number;
  method: string;
  isSelected: boolean;
  expiry?: string;
}

interface CheckoutMainProps {
  items: Item[];
  userInfo: UserInfo;
  address?: AddressInfo;
  payments: PaymentInfo[]; // nhận mảng payments
  onPaymentChange?: (method: string) => void;
}

const paymentOptions = [
  {
    label: 'Thanh toán khi nhận hàng (COD)',
    value: 'cod',
    icon: '💵',
    description: 'Thanh toán bằng tiền mặt khi nhận hàng',
  },
  {
    label: 'Chuyển khoản ngân hàng',
    value: 'bank_transfer',
    icon: '🏦',
    description: 'Chuyển khoản thủ công qua ngân hàng',
  },
  {
    label: 'Ví điện tử MoMo',
    value: 'momo',
    icon: '🎯',
    description: 'Thanh toán qua ví điện tử MoMo',
  },
  { label: 'PayPal', value: 'paypal', icon: '💳', description: 'Thanh toán quốc tế qua PayPal' },
];

const CheckoutMain: FC<CheckoutMainProps> = ({ items, payments, onPaymentChange }) => {
  // State cục bộ để lưu lựa chọn hiện tại
  const [localSelectedPayment, setLocalSelectedPayment] = useState<string>('');

  // Khi context payments thay đổi, chỉ đồng bộ lại nếu context khác local
  useEffect(() => {
    const selected = payments.find(p => p.isSelected)?.method || '';
    if (selected && selected !== localSelectedPayment) {
      setLocalSelectedPayment(selected);
    }
  }, [payments]);

  // Khi chọn payment method, cập nhật local ngay, đồng thời gọi callback để cập nhật context
  const handleSelectPayment = (method: string) => {
    setLocalSelectedPayment(method);
    if (onPaymentChange) {
      onPaymentChange(method);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-6 w-full">
      {/* Order Review Section */}
      <div className="mb-6">
        <h3 className="text-base font-semibold mb-3 text-app-primary flex items-center gap-2">
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" />
          </svg>
          Sản phẩm trong đơn hàng
        </h3>
        <div className="divide-y divide-gray-100 bg-white rounded-xl border border-gray-100 overflow-hidden">
          {items.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              Không có sản phẩm nào trong giỏ hàng.
            </div>
          ) : (
            items.map(item => (
              <div
                key={
                  (item.id && item.id !== 'NaN' && item.id !== undefined && item.id !== null
                    ? item.id
                    : Math.random()) +
                  '-' +
                  (item.unit || '')
                }
                className="flex items-center gap-3 p-3"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 object-cover rounded-lg border border-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{item.name}</div>
                  <div className="text-xs text-gray-500 truncate">{item.unit || ''}</div>
                  <div className="text-xs text-gray-500">
                    {item.type === 'weight'
                      ? `${item.weight || 0} kg`
                      : `Số lượng: ${item.quantity}`}
                  </div>
                </div>
                {/* Ẩn toàn bộ phần giá và tạm tính */}
              </div>
            ))
          )}
        </div>
      </div>
      {/* Checkout Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-green-50 rounded-full border border-green-700">
            <CalendarDays className="h-5 w-5 text-green-700" />
          </div>
          <h2 className="text-xl font-semibold">Thanh toán</h2>
        </div>
      </div>

      {/* Delivery Info */}
      {/* Đã xóa phần hiển thị địa chỉ giao hàng */}

      {/* Payment Method */}
      <div className="bg-white rounded-xl p-6 border hover:border-green-700 transition">
        <div className="mb-4">
          <p className="text-lg font-bold text-gray-700 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Phương thức thanh toán
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentOptions.map(option => (
            <div
              key={option.value}
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                localSelectedPayment === option.value
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 hover:border-green-300'
              }`}
              onClick={() => handleSelectPayment(option.value)}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{option.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">{option.label}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {option.value === 'cod' && 'Thanh toán bằng tiền mặt khi nhận hàng'}
                    {option.value === 'bank_transfer' && 'Chuyển khoản qua ngân hàng'}
                    {option.value === 'momo' && 'Thanh toán qua ví MoMo'}
                    {option.value === 'paypal' && 'Thanh toán quốc tế qua PayPal'}
                  </p>
                </div>
                {localSelectedPayment === option.value && (
                  <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional info for specific payment methods */}
              {localSelectedPayment === option.value && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  {option.value === 'cod' && (
                    <div className="text-xs text-green-700 space-y-1">
                      <p>✓ Kiểm tra hàng trước khi thanh toán</p>
                      <p>✓ Không tính phí thêm</p>
                    </div>
                  )}
                  {option.value === 'bank_transfer' && (
                    <div className="text-xs space-y-3 bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <div className="font-semibold text-blue-800 mb-2">
                        📌 Thông tin chuyển khoản:
                      </div>

                      <div className="space-y-2">
                        <div className="bg-white p-2 rounded border border-blue-300">
                          <div className="font-medium text-blue-700">🏦 Vietcombank</div>
                          <div>
                            <strong>STK:</strong> 1034567890123
                          </div>
                          <div>
                            <strong>Chủ TK:</strong> CONG TY TNHH GREEN MART
                          </div>
                          <div>
                            <strong>Chi nhánh:</strong> Quận 5, Hồ Chí Minh
                          </div>
                        </div>

                        <div className="bg-white p-2 rounded border border-blue-300">
                          <div className="font-medium text-blue-700">🏦 Techcombank</div>
                          <div>
                            <strong>STK:</strong> 19034567890
                          </div>
                          <div>
                            <strong>Chủ TK:</strong> CONG TY TNHH GREEN MART
                          </div>
                          <div>
                            <strong>Chi nhánh:</strong> Quận 5, Hồ Chí Minh
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-blue-200 pt-2 space-y-1">
                        <div className="font-medium text-blue-800">
                          ⏰ Thời hạn thanh toán: 24 giờ
                        </div>
                        <div className="font-medium text-blue-800">
                          💬 Nội dung CK: [Mã đơn hàng] - [Họ tên]
                        </div>
                      </div>

                      <div className="border-t border-blue-200 pt-2 space-y-1 text-blue-700">
                        <div className="font-medium">📋 Hướng dẫn:</div>
                        <div>1. Chuyển khoản theo đúng số tiền và nội dung</div>
                        <div>2. Chụp ảnh biên lai gửi cho shop</div>
                        <div>3. Admin sẽ kiểm tra và xác nhận trong 2-4h</div>
                        <div>4. Đơn hàng được chuẩn bị sau khi xác nhận</div>
                      </div>

                      <div className="border-t border-blue-200 pt-2">
                        <div className="font-medium text-blue-800">🤝 Cam kết:</div>
                        <div className="text-blue-700">
                          • Hoàn tiền 100% nếu không nhận được hàng
                          <br />• Hỗ trợ 24/7 qua hotline: <strong>1900-1234</strong>
                          <br />• Giao hàng miễn phí đơn từ 300k
                        </div>
                      </div>
                    </div>
                  )}
                  {option.value === 'momo' && (
                    <div className="text-xs text-purple-700">
                      <p>• Thanh toán nhanh chóng và bảo mật</p>
                      <p>• Nhận ưu đãi từ ví điện tử</p>
                    </div>
                  )}
                  {option.value === 'paypal' && (
                    <div className="text-xs text-blue-700 space-y-1">
                      <p>• Thanh toán quốc tế an toàn</p>
                      <p>• Hỗ trợ nhiều loại tiền tệ</p>
                      <p>• Bảo vệ người mua toàn diện</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Payment Security Notice */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-1">Bảo mật thanh toán</h4>
              <p className="text-xs text-gray-600">
                Tất cả giao dịch được mã hóa SSL 256-bit và tuân thủ tiêu chuẩn bảo mật PCI DSS.
                Thông tin thanh toán của bạn được bảo vệ tuyệt đối.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutMain;
