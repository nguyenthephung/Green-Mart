import { Link } from "react-router-dom";

type OrderCardProps = {
  id: string;
  status: string;
  date: string;
  total: number;
  items: number;
  images: string[];
  payWith: string;
};

const statusColors: Record<string, string> = {
  "Hoàn thành": "text-green-600 border-green-600",
  "Đã hủy": "text-red-600 border-red-600",
  "Đang xử lý": "text-gray-900 border-gray-900",
};

export default function OrderCard({
  id,
  status,
  date,
  total,
  items,
  images,
  payWith,
}: OrderCardProps) {
  return (
    <div className="border rounded-2xl bg-white p-6 mb-8 transition-all duration-300 shadow-[0_4px_24px_rgba(17,17,17,0.10),0_1.5px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_32px_rgba(17,17,17,0.18),0_3px_16px_rgba(0,0,0,0.12)] border-gray-200 relative overflow-hidden group">
      <div
        className="absolute inset-0 pointer-events-none group-hover:scale-105 transition-transform duration-300"
        style={{
          boxShadow:
            "0 8px 32px 0 rgba(67,56,202,0.10), 0 1.5px 8px 0 rgba(0,0,0,0.08)",
        }}
      ></div>
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="font-extrabold text-lg md:text-xl text-gray-900 drop-shadow-[0_2px_2px_rgba(17,17,17,0.10)]">
            Đơn hàng - {status}
          </h2>
          <p className="text-gray-500 text-sm font-medium">{date}</p>
        </div>
        <div className="flex flex-col text-right gap-1">
          <div className="text-xl font-extrabold text-gray-800 drop-shadow-[0_2px_2px_rgba(17,17,17,0.15)]">
            {total.toLocaleString()}₫
          </div>
          <div className="text-sm text-gray-500 font-semibold">{payWith}</div>
        </div>
      </div>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-700 font-semibold">
            <strong>Số lượng</strong> {items} sản phẩm
          </div>
          <span
            className={`text-xs border px-3 py-1 rounded-full font-bold shadow-md bg-gradient-to-r from-gray-100 to-gray-50 ${statusColors[status]}`}
            style={{ textShadow: "0 1px 2px #fff" }}
          >
            {status}
          </span>
        </div>
        <Link
          to={`/ordertracking/${id}`}
          className="text-sm font-bold text-blue-600 hover:underline hover:text-gray-900 transition-colors duration-200 drop-shadow-[0_1px_1px_rgba(0,0,0,0.10)]"
        >
          Xem chi tiết &rarr;
        </Link>
      </div>
      <div className="flex gap-2 mt-2">
        {images.slice(0, 4).map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt=""
            className="w-12 h-12 rounded-xl object-cover border-2 border-gray-100 shadow-md"
            style={{ boxShadow: "0 2px 8px 0 rgba(17,17,17,0.10)" }}
          />
        ))}
        {images.length > 4 && (
          <span className="text-xs text-gray-500 ml-2 font-semibold">
            +{images.length - 4} sản phẩm khác
          </span>
        )}
      </div>
    </div>
  );
}