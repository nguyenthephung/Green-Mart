import { Calendar, ChevronRight, ShoppingCart, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import haversine from "haversine-distance";

const STORE_LOCATION = {
  latitude: 10.754027, // Quận 5, TP.HCM
  longitude: 106.663874,
  address: "Quận 5, TP. Hồ Chí Minh",
};

export function useCurrentLocation() {
  const [location, setLocation] = useState<string>("Đang xác định...");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setCoords({ latitude, longitude });
        },
        () => setLocation("Không xác định")
      );
    } else {
      setLocation("Không xác định");
    }
  }, []);
  return { location, coords };
}

export function calculateShippingFee(userCoords: { latitude: number; longitude: number } | null) {
  if (!userCoords) return null;
  const distance = haversine(userCoords, STORE_LOCATION) / 1000; // km
  if (distance <= 3) return 15000;
  if (distance <= 7) return 25000;
  return 35000;
}

export function usePageLoading() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800); // hiệu ứng 0.8s
    return () => clearTimeout(timer);
  }, []);
  return loading;
}

export default function MarketInfo() {
  const { location, coords } = useCurrentLocation();
  const [time, setTime] = useState<string>("");
  const shippingFee = calculateShippingFee(coords);

  useEffect(() => {
    // Lấy thời gian hiện tại
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, "0");
      const m = now.getMinutes().toString().padStart(2, "0");
      const d = now.getDate().toString().padStart(2, "0");
      const mo = (now.getMonth() + 1).toString().padStart(2, "0");
      const y = now.getFullYear();
      setTime(`${h}:${m} - ${d}/${mo}/${y}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000 * 30); // cập nhật mỗi 30s
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-app-card shadow-md p-4 rounded-xl mb-6 flex justify-between items-center border border-app-border">
      <div className="flex items-center gap-3">
        <div className="bg-app-emerald text-brand-green p-3 rounded-full">
          <ShoppingCart className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-semibold text-lg text-app-primary">Green Mart</h2>
          <div className="flex items-center text-sm text-brand-green font-medium">
            <MapPin className="w-4 h-4 mr-1" />
            {STORE_LOCATION.address}
          </div>
          <div className="text-xs text-app-muted">Vị trí của bạn: {location}</div>
          {shippingFee !== null && (
            <div className="text-xs text-blue-600 font-medium">Phí ship tạm tính: {shippingFee.toLocaleString()}đ</div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 border border-brand-green text-white px-4 py-2 rounded-full text-sm font-medium bg-brand-green">
        <Calendar className="w-4 h-4" />
        <span>{time}</span>
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  );
}
