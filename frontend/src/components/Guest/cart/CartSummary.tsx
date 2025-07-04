import { CreditCard } from "lucide-react";

interface CartSummaryProps {
  itemsTotal: number;
  deliveryFee: number;
}

export default function CartSummary({ itemsTotal, deliveryFee }: CartSummaryProps) {
  const finalTotal = itemsTotal + deliveryFee;

  return (
    <div className="bg-white shadow-md rounded-xl p-6 w-full">
      <h3 className="text-xl font-semibold mb-4">Tóm tắt đơn hàng</h3>

      <div className="flex justify-between mb-2 text-sm">
        <span>Tạm tính</span>
        <span>{itemsTotal.toLocaleString()} ₫</span>
      </div>
      <div className="flex justify-between mb-2 text-sm">
        <span>Phí giao hàng</span>
        <span>{deliveryFee.toLocaleString()} ₫</span>
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
