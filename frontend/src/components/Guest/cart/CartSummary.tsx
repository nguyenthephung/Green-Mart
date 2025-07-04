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
  address?: {
    district: string;
    ward: string;
  };
}

export default function CartSummary({ itemsTotal, deliveryFee, address }: CartSummaryProps) {
  let dynamicFee = deliveryFee;
  if (address) {
    const coords = getLatLngFromAddress(address);
    if (coords) dynamicFee = calculateShippingFee(coords);
  }
  const finalTotal = itemsTotal + dynamicFee;

  return (
    <div className="bg-white shadow-md rounded-xl p-6 w-full">
      <h3 className="text-xl font-semibold mb-4">Tóm tắt đơn hàng</h3>

      <div className="flex justify-between mb-2 text-sm">
        <span>Tạm tính</span>
        <span>{itemsTotal.toLocaleString()} ₫</span>
      </div>
      <div className="flex justify-between mb-2 text-sm">
        <span>Phí giao hàng</span>
        <span>{dynamicFee.toLocaleString()} ₫</span>
      </div>

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
