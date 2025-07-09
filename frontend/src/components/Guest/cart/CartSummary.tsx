import { CreditCard } from "lucide-react";
import haversine from "haversine-distance";
import { districts } from "../../../data/Guest/hcm_districts_sample";

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

function calculateShippingFee(userCoords: { latitude: number; longitude: number } | null) {
  if (!userCoords) return 0;
  const distance = haversine(userCoords, STORE_LOCATION) / 1000; // km
  if (distance <= 3) return 15000;
  if (distance <= 7) return 25000;
  return 35000;
}

interface CartSummaryProps {
  itemsTotal: number;
  deliveryFee: number;
  voucherDiscount?: number;
  voucher?: { code: string; description: string } | null;
  onRemoveVoucher?: () => void;
  onShowVoucherModal?: () => void;
  address?: {
    district: string;
    ward: string;
    fullName?: string;
    phone?: string;
  };
}

export default function CartSummary({ itemsTotal, deliveryFee, voucherDiscount = 0, voucher, onRemoveVoucher, onShowVoucherModal, address }: CartSummaryProps) {
  let dynamicFee = deliveryFee;
  if (address) {
    const coords = getLatLngFromAddress(address);
    if (coords) dynamicFee = calculateShippingFee(coords);
  }
  const finalTotal = itemsTotal + dynamicFee - voucherDiscount;

  return (
    <div className="bg-white shadow-md rounded-xl p-6 w-full">
      <h3 className="text-xl font-semibold mb-4">Tóm tắt đơn hàng</h3>
      {address && (address.fullName || address.phone) && (
        <div className="mb-2 text-sm text-green-700">
          <span>Người nhận: {address.fullName || '---'} | SĐT: {address.phone || '---'}</span>
        </div>
      )}
      <div className="flex justify-between mb-2 text-sm">
        <span>Tạm tính</span>
        <span>{itemsTotal.toLocaleString()} ₫</span>
      </div>
      <div className="flex justify-between mb-2 text-sm">
        <span>Phí giao hàng</span>
        <span>{dynamicFee.toLocaleString()} ₫</span>
      </div>
      {voucher && voucherDiscount > 0 ? (
        <div className="flex justify-between mb-2 text-green-700 text-sm">
          <span>Voucher ({voucher.code}) <button className="ml-2 text-xs text-red-500 underline" onClick={onRemoveVoucher}>Bỏ</button></span>
          <span>-{voucherDiscount.toLocaleString()} ₫</span>
        </div>
      ) : (
        <div className="flex justify-between mb-2 text-sm">
          <span>Chưa áp dụng voucher</span>
          <button className="text-green-700 underline text-xs ml-2" onClick={onShowVoucherModal}>Chọn voucher</button>
        </div>
      )}
      <div className="flex justify-between font-bold text-base mt-2 border-t pt-2">
        <span>Tổng cộng</span>
        <span>{finalTotal.toLocaleString()} ₫</span>
      </div>

      <button
        className="flex justify-between items-center w-full mt-4 py-3 px-4 rounded-full text-white"
        style={{ backgroundColor: "#16a34a" }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#15803d")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#16a34a")}
      >
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          <span className="font-medium">Thanh toán</span>
        </div>
        <span className="font-semibold">{finalTotal.toLocaleString()} ₫</span>
      </button>
    </div>
  );
}
