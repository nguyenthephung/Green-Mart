import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const statuses = [
  { label: 'Delivered', color: 'bg-green-600' },
  { label: 'Canceled', color: 'bg-red-600' },
  { label: 'Pending', color: 'bg-yellow-400' },
  { label: 'Processing', color: 'bg-blue-600' },
];

export default function OrderStatusFilter({
  selectedStatus,
  onChange,
}: {
  selectedStatus: string;
  onChange: (status: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const handleSelect = (status: string) => {
    onChange(status);
    setOpen(false);
  };

  return (
    <div className="relative w-52">
      <button
        className="w-full px-4 py-2 text-left bg-white rounded-md shadow text-sm flex items-center justify-between"
        onClick={() => setOpen(!open)}
      >
        <span>{selectedStatus || 'View All'}</span>
        <ChevronDown className="w-4 h-4 ml-2" />
      </button>

      {open && (
        <div className="absolute w-full mt-1 bg-white border border-gray-200 rounded-md shadow z-10 text-sm">
          {/* Select All Option */}
          <div
            onClick={() => handleSelect('')}
            className={`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 ${
              selectedStatus === '' ? 'text-[#16a34a] font-semibold' : ''
            }`}
          >
            <span className="w-2 h-2 mr-2 rounded-full bg-gray-400" />
            <span className="font-semibold">View All</span>
            {selectedStatus === '' && <Check className="ml-auto w-4 h-4" />}
          </div>

          {/* Other Statuses */}
          {statuses.map((s) => (
            <div
              key={s.label}
              onClick={() => handleSelect(s.label)}
              className={`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                selectedStatus === s.label ? 'text-[#16a34a] font-semibold' : ''
              }`}
            >
              <span className={`w-2 h-2 mr-2 rounded-full ${s.color}`} />
              <span className="font-semibold">{s.label}</span>
              {selectedStatus === s.label && <Check className="ml-auto w-4 h-4" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
