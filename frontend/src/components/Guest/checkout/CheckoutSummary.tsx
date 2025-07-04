import { useState } from "react";
import { Plus } from "lucide-react";

const tipOptions = [5000, 10000, 15000, 20000, 30000, 40000, 50000];

const CheckoutSummary = () => {
  const [selectedTip, setSelectedTip] = useState<number | null>(null);

  const deliveryFee = 15000;
  const serviceFee = 25000;
  const itemsTotal = 350000;
  const couponDiscount = 0;

  const total =
    itemsTotal + deliveryFee + serviceFee + (selectedTip || 0) - couponDiscount;

  const formatVND = (value: number) =>
    value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  return (
    <div className="bg-white shadow-md rounded-xl p-6 w-full">
      <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

      <div className="text-sm space-y-2">
        <div className="flex justify-between">
          <span>Delivery fee</span>
          <span>{formatVND(deliveryFee)}</span>
        </div>
        <div className="flex justify-between">
          <span>Service fee</span>
          <span>{formatVND(serviceFee)}</span>
        </div>
        <div className="flex justify-between mb-4">
          <span>Items total</span>
          <span>{formatVND(itemsTotal)}</span>
        </div>
      </div>

      <hr className="my-4" />

      <div>
        <h3 className="text-sm font-medium mb-1">Delivery Tip</h3>
        <p className="text-xs text-gray-500 mb-2">
          Your delivery person keeps 100% of tips.
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
            Other
          </button>
        </div>
      </div>

      <hr className="my-4" />

      <div className="flex justify-between items-center mb-4 text-sm">
        <span>Coupon</span>
        <button className="flex items-center gap-1 text-green-700 hover:underline text-sm">
          <Plus size={14} />
          Add Coupon
        </button>
      </div>

      <hr className="my-4" />

      <div className="flex justify-between items-center text-lg font-semibold mb-6">
        <span>Total</span>
        <span>{formatVND(total)}</span>
      </div>

      <p className="text-xs text-gray-500 mb-4 text-center">
        By placing this order, you are agreeing to{" "}
        <a href="#" className="underline">
          Terms and Conditions
        </a>.
      </p>

      <button className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-full font-medium">
        Place Order
      </button>
    </div>
  );
};

export default CheckoutSummary;
