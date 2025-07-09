import type { CartItem } from "../../../reduxSlice/CartContext";
import type {
  UserInfo,
  AddressInfo,
  PaymentInfo,
} from "../../../reduxSlice/UserContext";
import { useMemo, useState, useEffect } from "react";
import haversine from "haversine-distance";
import { districts } from "../../../data/Guest/hcm_districts_sample";

// Define VoucherInfo type if not imported from elsewhere
export interface VoucherInfo {
  code: string;
  discount: number;
  [key: string]: any;
}

const tipOptions = [5000, 10000, 15000, 20000, 30000, 40000, 50000];

interface CheckoutSummaryProps {
  cart: CartItem[];
  address?: AddressInfo;
  payments: PaymentInfo[]; // nhận mảng payments
  userInfo: UserInfo;
  voucherDiscount?: number;
  voucher?: VoucherInfo | null;
  onRemoveVoucher?: () => void;
  onShowVoucherModal?: () => void;
}

const STORE_LOCATION = {
  latitude: 10.754027, // Quận 5, TP.HCM
  longitude: 106.663874,
};

function getLatLngFromAddress(address: { district: string; ward: string }) {
  if (!address) return null;
  const district = districts.find((d) => d.name === address.district);
  const ward = district?.wards.find((w) => w.name === address.ward);
  if (ward) {
    return { latitude: ward.latitude, longitude: ward.longitude };
  }
  return null;
}

function calculateShippingFee(
  userCoords: { latitude: number; longitude: number } | null
) {
  if (!userCoords) return 0;
  const distance = haversine(userCoords, STORE_LOCATION) / 1000; // km
  if (distance <= 3) return 15000;
  if (distance <= 7) return 25000;
  return 35000;
}

const CheckoutSummary = ({ cart, address, payments, userInfo, voucherDiscount = 0, voucher, onRemoveVoucher, onShowVoucherModal }: CheckoutSummaryProps) => {
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [localPayment, setLocalPayment] = useState<PaymentInfo | null>(null);
  const deliveryFee = 15000;
  const serviceFee = 25000;

  // Khi payments thay đổi, đồng bộ lại localPayment
  useEffect(() => {
    let payment = payments.find(p => p.isSelected) || null;
    if (!payment && payments.length > 0) {
      payment = payments.find(p => p.method === 'cod') || payments.find(p => p.method === 'vnpay') || payments[0];
    }
    setLocalPayment(payment);
  }, [payments]);

  const itemsTotal = useMemo(
    () =>
      cart.reduce((sum, item) => {
        const price = typeof item.price === 'string' ? parseInt(item.price.replace(/\D/g, "")) : item.price || 0;
        return sum + price * item.quantity;
      }, 0),
    [cart]
  );

  let dynamicDeliveryFee = deliveryFee;
  if (address && address.district && address.ward) {
    let districtName: string;
    if (typeof address.district === "string") {
      districtName = address.district;
    } else if (address.district && typeof address.district === "object" && "name" in address.district) {
      districtName = (address.district as { name: string }).name;
    } else {
      districtName = "";
    }
    let wardName: string;
    if (typeof address.ward === "string") {
      wardName = address.ward;
    } else if (address.ward && typeof address.ward === "object" && "name" in address.ward) {
      wardName = (address.ward as { name: string }).name;
    } else {
      wardName = "";
    }
    const coords = getLatLngFromAddress({ district: districtName, ward: wardName });
    if (coords) dynamicDeliveryFee = calculateShippingFee(coords);
  }

  const total =
    itemsTotal + dynamicDeliveryFee + serviceFee + (selectedTip || 0) - (voucherDiscount || 0);

  const formatVND = (value: number) =>
    value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const handlePlaceOrder = () => {
    if (localPayment?.method === 'vnpay') {
      // Redirect đến sandbox VNPay (giả lập)
      // Thông thường sẽ gọi API backend để lấy link, ở đây demo redirect trực tiếp
      const vnpaySandboxUrl =
        'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=1000000&vnp_OrderInfo=GreenMart+Demo&vnp_TmnCode=2QXUI4J4&vnp_ReturnUrl=https://greenmart.local/checkout-success';
      window.location.href = vnpaySandboxUrl;
      return;
    }
    // Tạo đơn hàng mới
    const newOrder = {
      id: `ORD-${Date.now()}`,
      status: "Đang xử lý",
      date: new Date().toLocaleString('vi-VN'),
      items: cart.map(item => ({
        name: item.name,
        price: typeof item.price === 'string' ? parseInt(item.price.replace(/\D/g, "")) : item.price || 0,
        oldPrice: typeof item.price === 'string' ? parseInt(item.price.replace(/\D/g, "")) : item.price || 0,
        quantity: item.quantity,
        image: item.image,
      })),
      deliveryFee: deliveryFee,
      payWith: localPayment ? localPayment.method : "",
      deliveryAddress: address ? address.address : "",
    };
    // Lưu vào localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.unshift(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    // Xóa cart
    localStorage.setItem('cart', '[]');
    setOrderPlaced(true);
    window.location.href = '/myorder';
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6 w-full">
      <h2 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h2>
      <div className="mb-2 text-sm text-gray-700">
        <div>
          <b>Khách hàng:</b> {userInfo.fullName} - {userInfo.phone}
        </div>
        <div>
          <b>Địa chỉ nhận hàng:</b> {address ? address.address : "Chưa chọn"}
        </div>
        <div>
          <b>Phương thức thanh toán:</b> {
            localPayment && (localPayment.method === 'cod' || localPayment.method === 'vnpay')
              ? (localPayment.method === 'cod'
                  ? 'Thanh toán khi nhận hàng (COD)'
                  : 'Thanh toán online (VNPay)')
              : 'Chưa chọn phương thức thanh toán'
          }
        </div>
      </div>
      <div className="text-sm space-y-2">
        <div className="flex justify-between">
          <span>Phí giao hàng</span>
          <span>{formatVND(dynamicDeliveryFee)}</span>
        </div>
        <div className="flex justify-between">
          <span>Phí dịch vụ</span>
          <span>{formatVND(serviceFee)}</span>
        </div>
        <div className="flex justify-between mb-4">
          <span>Tạm tính</span>
          <span>{formatVND(itemsTotal)}</span>
        </div>
        {voucher && voucherDiscount > 0 ? (
          <div className="flex justify-between mb-2 text-green-700 text-sm">
            <span>Mã giảm giá ({voucher.code}) <button className="ml-2 text-xs text-red-500 underline" onClick={onRemoveVoucher}>Bỏ</button></span>
            <span>-{formatVND(voucherDiscount)}</span>
          </div>
        ) : (
          <div className="flex justify-between mb-2 text-sm">
            <span>Chưa áp dụng mã giảm giá</span>
            <button className="text-green-700 underline text-xs ml-2" onClick={onShowVoucherModal}>Chọn mã</button>
          </div>
        )}
      </div>
      <hr className="my-4" />
      <div>
        <h3 className="text-sm font-medium mb-1">Tiền tip cho tài xế</h3>
        <p className="text-xs text-gray-500 mb-2">
          100% tiền tip sẽ được chuyển cho tài xế giao hàng.
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {tipOptions.map((tip) => (
            <button
              key={tip}
              className={`px-3 py-1 text-sm rounded-full border ${
                selectedTip === tip
                  ? "bg-green-700 text-white"
                  : "bg-green-50 text-green-700 hover:bg-green-100"
              }`}
              onClick={() => setSelectedTip(tip)}
            >
              {formatVND(tip)}
            </button>
          ))}
          <button className="px-3 py-1 text-sm rounded-full border bg-green-50 text-green-700 hover:bg-green-100">
            Khác
          </button>
        </div>
      </div>
      <hr className="my-4" />
      <div className="flex justify-between items-center text-lg font-semibold mb-6">
        <span>Tổng cộng</span>
        <span>{formatVND(total)}</span>
      </div>
      <p className="text-xs text-gray-500 mb-4 text-center">
        Khi bấm "Đặt hàng", bạn đã đồng ý với{' '}
        <a href="#" className="underline">
          Điều khoản & Chính sách
        </a>
        .
      </p>
      <button
        className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-full font-medium"
        onClick={handlePlaceOrder}
        disabled={orderPlaced}
      >
        Đặt hàng
      </button>
    </div>
  );
};

export default CheckoutSummary;
