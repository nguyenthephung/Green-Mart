import { useState, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import { orders as allOrders } from '../data/orderList';

const statusColor: Record<string, string> = {
  Delivered: 'bg-green-600',
  Canceled: 'bg-red-600',
  Pending: 'bg-yellow-400',
  Processing: 'bg-blue-600',
};

const ORDERS_PER_PAGE = 8;

export default function OrderTable({ statusFilter }: { statusFilter: string }) {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const filteredOrders =
    statusFilter === ''
      ? allOrders
      : allOrders.filter((order) => order.status === statusFilter);

  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  const allSelected =
    paginatedOrders.length > 0 &&
    paginatedOrders.every((order) => selectedOrders.includes(order.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedOrders((prev) =>
        prev.filter((id) => !paginatedOrders.find((order) => order.id === id))
      );
    } else {
      const newSelections = paginatedOrders
        .map((order) => order.id)
        .filter((id) => !selectedOrders.includes(id));
      setSelectedOrders((prev) => [...prev, ...newSelections]);
    }
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((orderId) => orderId !== id) : [...prev, id]
    );
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-white mt-4 rounded-2xl shadow-sm">
      <div className="flex justify-between items-center px-6 py-4 border-b font-semibold">
        <h2>Recent Purchases</h2>
        <MoreVertical className="w-5 h-5" />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm table-fixed">
          <thead>
            <tr className="text-left border-b">
              <th className="p-4 w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="p-4 w-48">Product</th>
              <th className="p-4 w-36">Order ID</th>
              <th className="p-4 w-32">Date</th>
              <th className="p-4 w-56">Customer</th>
              <th className="p-4 w-36">Status</th>
              <th className="p-4 w-28">Amount</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="p-4 w-12">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id)}
                    onChange={() => toggleSelectOrder(order.id)}
                  />
                </td>
                <td className="p-4 w-48">{order.product}</td>
                <td className="p-4 w-36 font-medium">#{order.id}</td>
                <td className="p-4 w-32">{order.date}</td>
                <td className="p-4 w-56">
                  <div className="flex items-center gap-2">
                    <img
                      src={order.customerImage}
                      alt={order.customerName}
                      className="w-6 h-6 rounded-full"
                    />
                    <span>{order.customerName}</span>
                  </div>
                </td>
                <td className="p-4 w-36">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${statusColor[order.status]}`} />
                    <span className="font-semibold">{order.status}</span>
                  </div>
                </td>
                <td className="p-4 w-28 font-medium">{order.amount.toLocaleString()} ₫</td>
              </tr>
            ))}

            {/* Fill empty rows to keep table height consistent */}
            {Array.from({ length: ORDERS_PER_PAGE - paginatedOrders.length }).map((_, i) => (
              <tr key={`empty-${i}`} className="h-14">
                <td className="p-4" colSpan={7}></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 px-6 py-4">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => handlePageClick(i + 1)}
            className={`w-8 h-8 rounded border text-sm font-semibold ${
              currentPage === i + 1
                ? 'bg-[#16a34a] text-white border-[#16a34a]'
                : 'border'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
