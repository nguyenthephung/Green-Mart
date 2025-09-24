import type { CartItem } from '../../../stores/useCartStore';
import { useMemo, useState, useEffect } from 'react';
import { useProductStore } from '../../../stores/useProductStore';

// Define interfaces locally instead of importing from removed UserContext
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
  latitude?: number;
  longitude?: number;
}

interface PaymentInfo {
  id: number;
  method: string;
  isSelected: boolean;
  expiry?: string;
}

// Define VoucherInfo type if not imported from elsewhere
export interface VoucherInfo {
  code: string;
  discount: number;
  [key: string]: any;
}

const tipOptions = [5000, 10000, 15000, 20000, 30000, 40000, 50000];

interface CheckoutSummaryProps {
  cart: CartItem[];
  subtotal?: number;
  address?: AddressInfo;
  payments: PaymentInfo[]; // nhận mảng payments
  userInfo?: UserInfo | null;
  voucherDiscount?: number;
  voucher?: VoucherInfo | null;
  onRemoveVoucher?: () => void;
  onShowVoucherModal?: () => void;
  onCheckout?: () => void;
  onPaymentSelect?: (method: string) => void; // Add payment selection handler
  isProcessing?: boolean;
}

// ...existing code...
function getPaymentMethodLabel(method: string): string {
  switch (method) {
    case 'cod':
      return 'COD - Thanh toán khi nhận hàng';
    case 'bank_transfer':
      return 'Chuyển khoản ngân hàng';
    case 'momo':
      return 'Ví MoMo';
    case 'paypal':
      return 'PayPal - Thanh toán quốc tế';
    default:
      return 'Phương thức khác';
  }
}

const CheckoutSummary = ({
  cart,
  address,
  payments,
  userInfo,
  voucherDiscount = 0,
  voucher,
  subtotal,
  onRemoveVoucher,
  onShowVoucherModal,
  onCheckout,
  onPaymentSelect,
  isProcessing = false,
}: CheckoutSummaryProps) => {
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [localPayment, setLocalPayment] = useState<PaymentInfo | null>(null);
  // Logic tính phí giao hàng dựa trên địa chỉ
  const getDeliveryFee = (address?: AddressInfo) => {
    if (!address || !address.city || !address.district) return 35000;
    const city = address.city.trim().toLowerCase();
    const district = address.district.trim().toLowerCase();
    if (city.includes('hồ chí minh') || city.includes('hcm')) {
      const centralDistricts = ['quận 1', 'quận 3', 'quận 5', 'quận 10'];
      if (centralDistricts.some(d => district === d)) {
        return 15000;
      }
      return 25000;
    }
    return 35000;
  };
  const deliveryFee = getDeliveryFee(address);
  // Phí dịch vụ sẽ được tính sau khi có itemsTotal

  // Khi payments thay đổi, đồng bộ lại localPayment
  useEffect(() => {
    let payment = payments.find(p => p.isSelected) || null;
    // Không tự động chọn payment nào, để user tự chọn
    setLocalPayment(payment);
  }, [payments]);

  const handlePaymentSelect = (method: string) => {
    // Immediately call parent handler to update global state
    if (onPaymentSelect) {
      onPaymentSelect(method);
    }
  };

  // Lấy products từ ProductStore
  const products = useProductStore.getState().products;
  // Dùng subtotal truyền từ CheckoutPage để đồng bộ logic miễn phí ship
  const itemsTotal =
    typeof subtotal === 'number'
      ? subtotal
      : useMemo(
          () =>
            cart.reduce((sum, item) => {
              const id = String(item.id);
              const product = products.find((p: any) => String(p.id) === id);
              let priceNumber = item.price;
              // Flash sale ưu tiên cao nhất
              if (item.flashSale?.isFlashSale) {
                priceNumber = item.price;
              } else if (product) {
                if (
                  product.isSale &&
                  typeof product.salePrice === 'number' &&
                  product.salePrice < product.price
                ) {
                  priceNumber = product.salePrice;
                } else if (typeof product.price === 'number') {
                  priceNumber = product.price;
                }
              }
              const quantity = item.type === 'weight' ? item.weight || 0 : item.quantity || 0;
              return sum + priceNumber * quantity;
            }, 0),
          [cart, products]
        );

  // Tính phí dịch vụ (2% tổng tiền hàng, min 15k)
  let serviceFee = 15000;
  const dynamicServiceFee = Math.round(itemsTotal * 0.02);
  if (dynamicServiceFee > 15000) serviceFee = dynamicServiceFee;

  let dynamicDeliveryFee = deliveryFee;
  // Đã xóa logic phí vận chuyển động, chỉ dùng phí mặc định

  // Free shipping for orders >= 300k (đồng bộ với cart)
  const isEligibleForFreeShip =
    typeof subtotal === 'number' ? subtotal >= 300000 : itemsTotal >= 300000;
  const actualDeliveryFee = isEligibleForFreeShip ? 0 : dynamicDeliveryFee;

  const total =
    itemsTotal + actualDeliveryFee + serviceFee + (selectedTip || 0) - (voucherDiscount || 0);

  // Debug voucher calculation

  const formatVND = (value: number) =>
    value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

  const handlePlaceOrder = () => {
    if (onCheckout) {
      onCheckout();
    } else {
      // Fallback behavior if onCheckout is not provided
      alert('Chức năng đặt hàng chưa được kết nối');
    }
  };

  return (
    <div className="bg-app-card shadow-lg rounded-2xl p-6 w-full border border-green-100">
      <h2 className="text-xl font-semibold mb-6 text-app-primary flex items-center gap-2">
        📋 Tóm tắt đơn hàng
      </h2>

      {/* Customer Information Card */}
      <div className="mb-6 p-4 bg-app-card dark:bg-app-card rounded-xl border border-green-100 dark:border-gray-700">
        <h3 className="font-semibold text-app-primary mb-3 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          Thông tin đơn hàng
        </h3>
        <div className="space-y-2 text-sm text-app-secondary">
          <div className="flex items-center gap-2">
            <span className="font-medium flex-shrink-0">Khách hàng:</span>
            <span className="break-words">
              {userInfo?.fullName || 'Chưa đăng nhập'} - {userInfo?.phone || 'Chưa có SĐT'}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium flex-shrink-0">Địa chỉ:</span>
            <span className="flex-1 break-words">{address ? address.address : 'Chưa chọn'}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium flex-shrink-0 mt-1">Thanh toán:</span>
            <div className="flex-1">
              <div className="grid grid-cols-1 gap-2">
                {payments.map(payment => (
                  <button
                    key={payment.method}
                    onClick={() => {
                      handlePaymentSelect(payment.method);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                      localPayment?.method === payment.method
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        localPayment?.method === payment.method
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {localPayment?.method === payment.method && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-lg ${
                          payment.method === 'cod'
                            ? '💵'
                            : payment.method === 'bank_transfer'
                              ? '�'
                              : payment.method === 'momo'
                                ? '📱'
                                : payment.method === 'paypal'
                                  ? '💳'
                                  : '💳'
                        }`}
                      ></span>
                      <span className="text-sm font-medium">
                        {getPaymentMethodLabel(payment.method)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center py-2">
          <span className="text-app-secondary">Tạm tính</span>
          <span className="font-medium text-app-primary break-all">{formatVND(itemsTotal)}</span>
        </div>

        <div className="flex justify-between items-center py-2">
          <span className="text-app-secondary flex items-center gap-2">
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Phí giao hàng
          </span>
          <span
            className={`font-medium break-all ${isEligibleForFreeShip ? 'text-green-600' : 'text-app-primary'}`}
          >
            {isEligibleForFreeShip ? (
              <span className="flex items-center gap-1">
                <span className="line-through text-gray-400 text-sm">
                  {formatVND(dynamicDeliveryFee)}
                </span>
                <span className="text-green-600 font-semibold">Miễn phí</span>
              </span>
            ) : (
              formatVND(actualDeliveryFee)
            )}
          </span>
        </div>

        {!isEligibleForFreeShip && (
          <div className="flex justify-between items-center py-2 px-3 bg-yellow-50 rounded-lg border border-yellow-200 mb-2">
            <span className="text-yellow-700 text-sm flex items-center gap-1">
              🚚 Mua thêm {formatVND(300000 - itemsTotal)} để được miễn phí ship
            </span>
          </div>
        )}

        {isEligibleForFreeShip && (
          <div className="flex justify-between items-center py-2 px-3 bg-green-50 rounded-lg border border-green-200 mb-2">
            <span className="text-green-700 text-sm flex items-center gap-1">
              🎉 Chúc mừng! Bạn được miễn phí giao hàng
            </span>
          </div>
        )}

        <div className="flex justify-between items-center py-2">
          <span className="text-app-secondary">Phí dịch vụ</span>
          <span className="font-medium text-app-primary whitespace-nowrap text-right">
            {formatVND(serviceFee)}
          </span>
        </div>

        {voucher && voucherDiscount > 0 ? (
          <div className="flex justify-between items-center py-2 text-green-600">
            <span className="flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              Mã giảm giá ({voucher.code})
              <button
                className="ml-2 text-xs text-red-500 hover:text-red-600 transition"
                onClick={onRemoveVoucher}
              >
                ✕
              </button>
            </span>
            <span className="font-medium whitespace-nowrap text-right">
              -{formatVND(voucherDiscount)}
            </span>
          </div>
        ) : (
          <div className="flex justify-between items-center py-2">
            <span className="text-app-secondary">Mã giảm giá</span>
            <button
              className="text-green-600 hover:text-green-700 text-sm font-medium transition flex items-center gap-1"
              onClick={onShowVoucherModal}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Chọn mã
            </button>
          </div>
        )}

        {selectedTip && (
          <div className="flex justify-between items-center py-2 text-purple-600">
            <span className="flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
              Tiền tip tài xế
            </span>
            <span className="font-medium whitespace-nowrap text-right">
              {formatVND(selectedTip)}
            </span>
          </div>
        )}
      </div>

      {/* Tip Section */}
      <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
        <h3 className="text-sm font-semibold mb-2 text-purple-800 flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          Tiền tip cho tài xế
        </h3>
        <p className="text-xs text-purple-600 mb-3">
          100% tiền tip sẽ được chuyển cho tài xế giao hàng.
        </p>
        <div className="flex flex-wrap gap-2">
          {tipOptions.map(tip => (
            <button
              key={tip}
              className={`px-3 py-2 text-sm rounded-xl border transition-all ${
                selectedTip === tip
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                  : 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-400'
              }`}
              onClick={() => setSelectedTip(selectedTip === tip ? null : tip)}
            >
              {formatVND(tip)}
            </button>
          ))}
          <button className="px-3 py-2 text-sm rounded-xl border bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-400 transition-all">
            Khác
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="border-t border-gray-200 pt-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-gray-900">Tổng cộng</span>
          <span className="text-2xl font-bold text-green-600 whitespace-nowrap text-right">
            {formatVND(total)}
          </span>
        </div>
      </div>

      {/* Terms and Order Button */}
      <div className="space-y-4">
        <p className="text-xs text-gray-500 text-center leading-relaxed">
          Khi bấm "Đặt hàng", bạn đã đồng ý với{' '}
          <a href="#" className="text-green-600 hover:text-green-700 underline transition">
            Điều khoản & Chính sách
          </a>{' '}
          của chúng tôi.
        </p>

        <button
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 px-6 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          onClick={handlePlaceOrder}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <svg
                className="w-6 h-6 animate-spin"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Đang xử lý...
            </>
          ) : (
            <>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
              Đặt hàng ngay
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm whitespace-nowrap text-right">
                {formatVND(total)}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CheckoutSummary;
