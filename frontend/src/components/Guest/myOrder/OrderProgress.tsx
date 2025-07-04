interface OrderProgressProps {
  status: string;
  date: string;
}

export default function OrderProgress({ status, date }: OrderProgressProps) {
  if (status === "In Progress") {
    return (
      <div className="bg-white rounded-xl p-6 mb-6">
        <div className="text-xl font-semibold mb-2">{status}</div>
        <div className="text-sm text-gray-500">Order Arrived at {date}</div>

        <div className="flex justify-center my-6">
          <div className="bg-green-100 p-4 rounded-full">
            <div className="text-green-500 text-3xl">✔️</div>
          </div>
        </div>

        <div className="flex justify-between text-sm text-gray-400 mt-4">
          <div className="text-pink-500">● Apr 5, 2022</div>
          <div>○ Apr 5, 2022</div>
          <div>○ Apr 5, 2022</div>
        </div>

        <div className="w-full h-1 bg-gray-200 rounded mt-2 relative">
          <div className="absolute top-0 left-0 h-1 bg-pink-500 w-1/3 rounded"></div>
        </div>
      </div>
    );
  }

  if (status === "Completed") {
    return (
      <div className="bg-green-100 text-green-600 p-4 rounded-xl text-center font-medium">
        ✅ Order was completed successfully.
      </div>
    );
  }

  if (status === "Cancelled") {
    return (
      <div className="bg-red-100 text-red-600 p-4 rounded-xl text-center font-medium">
        ❌ Order was cancelled.
      </div>
    );
  }

  return null;
}
