import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import OrderStatusFilter from '../components/OrderStatusFilter';
import OrderTable from '../components/OrderListTable';

export default function OrderList() {
  const [selectedStatus, setSelectedStatus] = useState('');

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Title & Date */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold">Order List</h1>
            <p className="text-gray-600 text-sm mt-1">Home &gt; Order List</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center text-sm gap-2">
              <CalendarDays className="w-5 h-5" />
              <span>Feb 16,2022 - Feb 20,2022</span>
            </div>
            <OrderStatusFilter
              selectedStatus={selectedStatus}
              onChange={setSelectedStatus}
            />
          </div>
        </div>

        {/* Table */}
        <OrderTable statusFilter={selectedStatus} />
      </div>
    </div>
  );
}
