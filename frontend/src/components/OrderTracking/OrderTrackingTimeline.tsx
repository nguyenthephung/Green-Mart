import React from 'react';

interface TrackingItem {
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  status: string;
  updatedAt: string;
}

interface Props {
  history: TrackingItem[];
}

const OrderTrackingTimeline: React.FC<Props> = ({ history }) => {
  return (
    <div className="w-full max-w-xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Lịch sử vị trí đơn hàng</h2>
      <ul className="space-y-6">
        {history.map((item, idx) => (
          <li key={idx} className="relative pl-8">
            <div className="absolute left-0 top-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
              <div className="font-semibold text-emerald-700 dark:text-emerald-300">
                {item.status}
              </div>
              <div className="text-gray-600 dark:text-gray-300 text-sm">
                {item.location.address || `${item.location.lat}, ${item.location.lng}`}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(item.updatedAt).toLocaleString()}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderTrackingTimeline;
