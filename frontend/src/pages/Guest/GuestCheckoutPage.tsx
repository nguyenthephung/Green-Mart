import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../stores/useCartStore';
import { useGuestStore } from '../../stores/useGuestStore';
import { guestOrderService } from '../../services/guestOrderService';
import GuestInfoModal from '../../components/ui/GuestInfoModal';
import { Truck, Store, CreditCard, Banknote, Smartphone } from 'lucide-react';
import type { GuestUser, GuestOrder } from '../../types/GuestOrder';

const GuestCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const { guestInfo, deliveryType, setDeliveryType } = useGuestStore();
  
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [currentGuestInfo, setCurrentGuestInfo] = useState<GuestUser | null>(guestInfo);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'momo' | 'bank_transfer'>('cod');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate totals
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const itemTotal = item.type === 'weight' 
        ? item.price * (item.weight || 1)
        : item.price * item.quantity;
      return sum + itemTotal;
    }, 0);
  }, [items]);

  const shippingFee = deliveryType === 'delivery' ? 30000 : 0;
  const finalTotal = subtotal + shippingFee;

  const handleGuestInfoSave = (info: GuestUser) => {
    setCurrentGuestInfo(info);
  };

  const handlePlaceOrder = async () => {
    if (!currentGuestInfo) {
      setShowGuestModal(true);
      return;
    }

    if (items.length === 0) {
      alert('Giỏ hàng trống');
      return;
    }

    setIsProcessing(true);

    try {
      const orderData: GuestOrder = {
        items: items.map(item => ({
          productId: String(item.id),
          name: item.name,
          price: item.price,
          quantity: item.type === 'weight' ? 1 : item.quantity,
          weight: item.type === 'weight' ? item.weight : undefined,
          image: item.image,
          unit: item.unit,
        })),
        guestInfo: currentGuestInfo,
        deliveryType,
        paymentMethod,
        totalAmount: finalTotal,
        shippingFee,
        notes: notes.trim() || undefined,
      };

      const response = await guestOrderService.createGuestOrder(orderData);

      if (response.success) {
        // Clear cart
        clearCart();
        
        // Handle different payment methods
        if (paymentMethod === 'momo' && response.data.paymentUrl) {
          // For MoMo, redirect to payment QR page
          window.location.href = response.data.paymentUrl;
        } else {
          // For other payment methods, navigate to success page
          navigate('/guest-order-success', {
            state: {
              orderId: response.data.orderId,
              orderNumber: response.data.orderNumber,
              totalAmount: response.data.totalAmount,
              paymentMethod: response.data.paymentMethod,
              paymentUrl: response.data.paymentUrl,
            }
          });
        }
      }
    } catch (error) {
      console.error('Error creating guest order:', error);
      alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-4">
            Giỏ hàng trống
          </h2>
          <button
            onClick={() => navigate('/')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Thanh Toán (Khách vãng lai)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Customer Info Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Thông Tin Khách Hàng
              </h2>
              
              {currentGuestInfo ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {currentGuestInfo.name}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {currentGuestInfo.phone}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {currentGuestInfo.address}
                      </p>
                      {currentGuestInfo.email && (
                        <p className="text-gray-600 dark:text-gray-400">
                          {currentGuestInfo.email}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setShowGuestModal(true)}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      Chỉnh sửa
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowGuestModal(true)}
                  className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-green-500 hover:text-green-600 transition-colors"
                >
                  + Nhập thông tin khách hàng
                </button>
              )}
            </div>

            {/* Delivery Type Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Hình Thức Nhận Hàng
              </h2>
              
              <div className="space-y-3">
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="pickup"
                    checked={deliveryType === 'pickup'}
                    onChange={(e) => setDeliveryType(e.target.value as 'pickup' | 'delivery')}
                    className="mr-3"
                  />
                  <Store className="w-5 h-5 mr-3 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Nhận tại cửa hàng
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Miễn phí - Nhận hàng tại 123 Đường ABC, Quận XYZ
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="delivery"
                    checked={deliveryType === 'delivery'}
                    onChange={(e) => setDeliveryType(e.target.value as 'pickup' | 'delivery')}
                    className="mr-3"
                  />
                  <Truck className="w-5 h-5 mr-3 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Giao hàng tận nơi
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Phí ship: {shippingFee.toLocaleString('vi-VN')}₫
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Phương Thức Thanh Toán
              </h2>
              
              <div className="space-y-3">
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'cod')}
                    className="mr-3"
                  />
                  <Banknote className="w-5 h-5 mr-3 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Thanh toán khi nhận hàng (COD)
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Thanh toán bằng tiền mặt khi nhận hàng
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="momo"
                    checked={paymentMethod === 'momo'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'momo')}
                    className="mr-3"
                  />
                  <Smartphone className="w-5 h-5 mr-3 text-pink-600" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Ví MoMo
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Thanh toán qua ví điện tử MoMo
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'bank_transfer')}
                    className="mr-3"
                  />
                  <CreditCard className="w-5 h-5 mr-3 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Chuyển khoản ngân hàng
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Chuyển khoản qua ngân hàng
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Ghi Chú Đơn Hàng
              </h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                placeholder="Ghi chú thêm cho đơn hàng (tùy chọn)..."
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Tóm Tắt Đơn Hàng
              </h2>
              
              {/* Items */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={`${item.id}-${item.unit}`} className="flex items-center space-x-3">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.type === 'weight' 
                          ? `${item.weight}${item.unit} × ${item.price.toLocaleString('vi-VN')}₫/${item.unit}`
                          : `${item.quantity} × ${item.price.toLocaleString('vi-VN')}₫`
                        }
                      </p>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.type === 'weight' 
                        ? (item.price * (item.weight || 1)).toLocaleString('vi-VN')
                        : (item.price * item.quantity).toLocaleString('vi-VN')
                      }₫
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tạm tính</span>
                  <span className="text-gray-900 dark:text-white">
                    {subtotal.toLocaleString('vi-VN')}₫
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Phí giao hàng</span>
                  <span className="text-gray-900 dark:text-white">
                    {shippingFee.toLocaleString('vi-VN')}₫
                  </span>
                </div>
                
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-900 dark:text-white">Tổng cộng</span>
                  <span className="text-green-600 dark:text-green-400">
                    {finalTotal.toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing || !currentGuestInfo}
                className="w-full mt-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {isProcessing ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                Bằng cách đặt hàng, bạn đồng ý với các điều khoản và chính sách của chúng tôi
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Guest Info Modal */}
      <GuestInfoModal
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        onSave={handleGuestInfoSave}
      />
    </div>
  );
};

export default GuestCheckoutPage;
