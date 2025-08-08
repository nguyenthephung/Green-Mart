import type { FC } from 'react';
import { MapPin, CreditCard, ChevronRight, CalendarDays } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Item {
  id: number;
  name: string;
  image: string;
  quantity: number;
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
  { label: 'Thanh toán khi nhận hàng (COD)', value: 'cod', icon: '💵', description: 'Thanh toán bằng tiền mặt khi nhận hàng' },
  { label: 'Chuyển khoản ngân hàng', value: 'bank_transfer', icon: '🏦', description: 'Chuyển khoản thủ công qua ngân hàng' },
  { label: 'Ví điện tử MoMo', value: 'momo', icon: '🎯', description: 'Thanh toán qua ví điện tử MoMo' },
  { label: 'PayPal', value: 'paypal', icon: '💳', description: 'Thanh toán quốc tế qua PayPal' },
];

const CheckoutMain: FC<CheckoutMainProps> = ({ items, userInfo, address, payments, onPaymentChange }) => {
  // State cục bộ để lưu lựa chọn hiện tại
  const [localSelectedPayment, setLocalSelectedPayment] = useState<string>('');

  // Khi context payments thay đổi, chỉ đồng bộ lại nếu context khác local
  useEffect(() => {
    console.log('CheckoutMain - Payments received:', payments); // Debug log
    const selected = payments.find(p => p.isSelected)?.method || '';
    console.log('CheckoutMain - Selected method found:', selected); // Debug log
    if (selected && selected !== localSelectedPayment) {
      console.log('CheckoutMain - Updating local payment to:', selected); // Debug log
      setLocalSelectedPayment(selected);
    }
  }, [payments]);

  const visibleItems = items.slice(0, 10);
  const remainingCount = items.length - visibleItems.length;

  // Khi chọn payment method, cập nhật local ngay, đồng thời gọi callback để cập nhật context
  const handleSelectPayment = (method: string) => {
    console.log('CheckoutMain - Payment selected:', method); // Debug log
    setLocalSelectedPayment(method);
    if (onPaymentChange) { 
      onPaymentChange(method); 
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-6 w-full">
      {/* Checkout Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-green-50 rounded-full border border-green-700">
            <CalendarDays className="h-5 w-5 text-green-700" />
          </div>
          <h2 className="text-xl font-semibold">Checkout</h2>
        </div>
        <div className="text-sm text-gray-700 flex items-center gap-1">
          <MapPin className="w-4 h-4 text-green-700" />
          <span>{address ? address.address : 'Chưa chọn địa chỉ'}</span>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="bg-white rounded-xl p-4 border hover:border-green-700 transition cursor-pointer">
        <div className="flex justify-between items-center">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-700">Delivery info</p>
            <div className="mt-1 text-sm text-green-700 flex items-center gap-1">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="break-words">{userInfo.fullName} - {userInfo.phone}</span>
            </div>
            <div className="text-xs text-gray-500 ml-5 break-words">{address ? address.address : 'Chưa chọn địa chỉ'}</div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-500 hover:text-green-700 flex-shrink-0" />
        </div>
      </div>

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
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
                      <div className="font-semibold text-blue-800 mb-2">📌 Thông tin chuyển khoản:</div>
                      
                      <div className="space-y-2">
                        <div className="bg-white p-2 rounded border border-blue-300">
                          <div className="font-medium text-blue-700">🏦 Vietcombank</div>
                          <div><strong>STK:</strong> 1034567890123</div>
                          <div><strong>Chủ TK:</strong> CONG TY TNHH GREEN MART</div>
                          <div><strong>Chi nhánh:</strong> Quận 5, Hồ Chí Minh</div>
                        </div>
                        
                        <div className="bg-white p-2 rounded border border-blue-300">
                          <div className="font-medium text-blue-700">🏦 Techcombank</div>
                          <div><strong>STK:</strong> 19034567890</div>
                          <div><strong>Chủ TK:</strong> CONG TY TNHH GREEN MART</div>
                          <div><strong>Chi nhánh:</strong> Quận 5, Hồ Chí Minh</div>
                        </div>
                      </div>

                      <div className="border-t border-blue-200 pt-2 space-y-1">
                        <div className="font-medium text-blue-800">⏰ Thời hạn thanh toán: 24 giờ</div>
                        <div className="font-medium text-blue-800">💬 Nội dung CK: [Mã đơn hàng] - [Họ tên]</div>
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
                          • Hoàn tiền 100% nếu không nhận được hàng<br/>
                          • Hỗ trợ 24/7 qua hotline: <strong>1900-1234</strong><br/>
                          • Giao hàng miễn phí đơn từ 300k
                        </div>
                      </div>
                    </div>
                  )}
                  {(option.value === 'momo') && (
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
              <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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

      {/* Review Order */}
      <div className="bg-white rounded-xl p-4 border hover:border-green-700 transition cursor-pointer">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-bold text-gray-700">Review Order</p>
        </div>
        <div className="bg-green-50 rounded-lg p-2 justify-between flex items-center space-x-2">
          <div className="flex items-center space-x-2">
          {visibleItems.map((item, index) => (
            <img
              key={index}
              src={item.image}
              alt={item.name}
              className="w-15 h-15 rounded object-cover"
            />
          ))}
          {remainingCount > 0 && (
            <div className="w-10 h-10 flex items-center justify-center bg-green-50 text-green-700 rounded text-sm font-medium">
              +{remainingCount}
            </div>
          )}
          </div>
          <ChevronRight className="w-5 h-5 text-gray-500 hover:text-green-700" />
        </div>
      </div>
    </div>
  );
};

export default CheckoutMain;
