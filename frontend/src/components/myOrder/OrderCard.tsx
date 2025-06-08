import { Link } from "react-router-dom";

type Item = {
  image: string;
};

type OrderCardProps = {
  id: string;
  status: string;
  date: string;
  total: number;
  items: number;
  images: string[]; // thêm mảng ảnh
  payWith: string;
};

const statusColors: Record<string, string> = {
  Completed: "text-green-600 border-green-600",
  Cancelled: "text-red-600 border-red-600",
  "In Progress": "text-pink-600 border-pink-600",
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
    <div className="border rounded-xl bg-white p-4 shadow-md mb-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="font-semibold text-lg">Order {status}</h2>
          <p className="text-gray-500 text-sm">{date}</p>
        </div>
        <div className="flex flex-col text-right gap-1">
          <div className="text-lg font-bold">${total.toFixed(2)}</div>
          <div className="text-sm text-gray-500">{payWith}</div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-700">
            <strong>Items</strong> {items}x
          </div>
          <span
            className={`text-xs border px-2 py-1 rounded-full ${statusColors[status]}`}
          >
            {status}
          </span>
        </div>
        <Link
          to={`/ordertracking/${id}`}
          className="text-sm text-blue-600 hover:underline"
        >
          View Order Details ↗
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt="item"
            className="w-14 h-14 object-contain border rounded-lg"
          />
        ))}
      </div>
    </div>
  );
}