interface OrderProgressProps {
  status: string;
  date: string;
}

export default function OrderProgress({ status, date }: OrderProgressProps) {
  if (status === "Đang xử lý") {
    return (
      <div className="bg-white rounded-2xl p-8 mb-8 shadow-[0_4px_24px_rgba(17,17,17,0.10),0_1.5px_8px_rgba(0,0,0,0.08)] border border-gray-100">
        <div className="text-2xl font-extrabold mb-2 text-gray-900 drop-shadow-[0_2px_2px_rgba(17,17,17,0.10)]">Đang xử lý</div>
        <div className="text-base text-gray-500 font-semibold">Đơn hàng được tạo lúc {date}</div>
        <div className="flex justify-center my-6">
          <div className="bg-green-100 p-5 rounded-full shadow-lg">
            <div className="text-green-500 text-4xl">✔️</div>
          </div>
        </div>
        <div className="flex justify-between text-base text-gray-400 mt-4 font-bold">
          <div className="text-gray-800">● Đã đặt hàng</div>
          <div>○ Đang giao</div>
          <div>○ Đã nhận</div>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded mt-2 relative">
          <div className="absolute top-0 left-0 h-2 bg-gray-800 w-1/3 rounded shadow-md"></div>
        </div>
      </div>
    );
  }
  if (status === "Hoàn thành") {
    return (
      <div className="bg-green-100 text-green-600 p-6 rounded-2xl text-center font-extrabold shadow-lg text-xl">
        ✅ Đơn hàng đã hoàn thành thành công.
      </div>
    );
  }
  if (status === "Đã hủy") {
    return (
      <div className="bg-red-100 text-red-600 p-6 rounded-2xl text-center font-extrabold shadow-lg text-xl">
        ❌ Đơn hàng đã bị hủy.
      </div>
    );
  }
  return null;
}
