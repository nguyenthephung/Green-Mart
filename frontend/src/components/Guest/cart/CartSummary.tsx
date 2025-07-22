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
    <div className="bg-white shadow-lg rounded-2xl p-6 w-full border border-green-100">
      <h3 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
        📋 Tóm tắt đơn hàng
      </h3>
      
      {address && (address.fullName || address.phone) && (
        <div className="mb-4 p-3 bg-green-50 rounded-xl border border-green-100">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="font-medium">Người nhận:</span>
            <span>{address.fullName || '---'}</span>
            <span>•</span>
            <span>{address.phone || '---'}</span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600">Tạm tính</span>
          <span className="font-medium">{itemsTotal.toLocaleString()} ₫</span>
        </div>
        
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Phí giao hàng
          </span>
          <span className="font-medium">{dynamicFee.toLocaleString()} ₫</span>
        </div>

        {voucher && voucherDiscount > 0 ? (
          <div className="flex justify-between items-center py-2 text-green-600">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Voucher ({voucher.code})
              <button 
                className="ml-2 text-xs text-red-500 hover:text-red-600 transition" 
                onClick={onRemoveVoucher}
              >
                ✕
              </button>
            </span>
            <span className="font-medium">-{voucherDiscount.toLocaleString()} ₫</span>
          </div>
        ) : (
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Voucher</span>
            <button 
              className="text-green-600 hover:text-green-700 text-sm font-medium transition flex items-center gap-1" 
              onClick={onShowVoucherModal}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Chọn voucher
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 mt-4 pt-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Tổng cộng</span>
          <span className="text-xl font-bold text-green-600">{finalTotal.toLocaleString()} ₫</span>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <span>Bảo đảm hoàn tiền 100% nếu không hài lòng</span>
        </div>
      </div>
    </div>
  );
}
