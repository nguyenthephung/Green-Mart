import { Link } from "react-router-dom";

export type OrderItem = {
  name: string;
  price: number;
  oldPrice: number;
  quantity: number;
  image: string;
  variant?: string;
};

export type OrderCardProps = {
  id: string;
  status: string;
  date: string;
  total: number;
  items: OrderItem[];
  deliveryFee: number;
  payWith: string;
  deliveryAddress: string;
  shippingStatus?: string;
};

const statusColors: Record<string, string> = {
  "Hoàn thành": "text-green-600 border-green-600",
  "Đã hủy": "text-red-600 border-red-600",
  "Đang xử lý": "text-gray-900 border-gray-900",
  "Chờ giao hàng": "text-orange-600 border-orange-600",
  "Vận chuyển": "text-blue-600 border-blue-600",
};

export default function OrderCard({
  id,
  status,
  date,
  total,
  items,
  deliveryFee,
  payWith,
  deliveryAddress,
  shippingStatus = "Đơn hàng đã rời kho phân loại tới HCM Mega SOC",
}: OrderCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow p-6 mb-8">
      {/* Trạng thái */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Có thể thêm icon shop hoặc logo nếu muốn */}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-bold px-3 py-1 rounded-full border ${
              statusColors[status] || "text-gray-700 border-gray-300"
            } bg-white`}
          >
            {status}
          </span>
        </div>
      </div>
      {/* Sản phẩm */}
      <div className="divide-y">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-4 py-4 items-center">
            <img
              src={item.image}
              alt={item.name}
              className="w-20 h-20 object-cover rounded border border-gray-200"
            />
            <div className="flex-1">
              <div className="font-semibold text-gray-900 text-base mb-1">
                {item.name}
              </div>
              <div className="text-xs text-gray-500 mb-1">
                Phân loại: {item.variant || "Mặc định"}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-600 font-bold text-lg">
                  {item.price.toLocaleString()}₫
                </span>
                {item.oldPrice > item.price && (
                  <span className="text-gray-400 line-through text-sm">
                    {item.oldPrice.toLocaleString()}₫
                  </span>
                )}
                <span className="ml-2 text-gray-700 text-sm">
                  x{item.quantity}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Trạng thái giao hàng + tổng tiền */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-2">
          <span className="text-green-700 font-semibold flex items-center gap-1">
            <svg
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M7 17l5-5 5 5"
                stroke="#22c55e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {shippingStatus}
          </span>
          <span className="ml-3 text-orange-600 font-bold">
            CHỜ GIAO HÀNG
          </span>
        </div>
        <div className="text-right">
          <div className="text-gray-500 text-sm">Thành tiền:</div>
          <div className="text-2xl font-bold text-orange-600">
            {total.toLocaleString()}₫
          </div>
        </div>
      </div>
      {/* Nút hành động */}
      <div className="flex justify-end gap-3 mt-4">
        <Link
          to={`/ordertracking/${id}`}
          className="px-5 py-2 border border-gray-300 rounded font-bold text-gray-700 hover:bg-gray-100 transition"
        >
          Xem Chi Tiết
        </Link>
      </div>
      {/* Thông tin phụ */}
      <div className="text-xs text-gray-400 mt-2">
        Mã đơn hàng: <b>{id}</b> | Ngày đặt: {date}
      </div>
    </div>
  );
}