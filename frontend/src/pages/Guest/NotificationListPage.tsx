import React from 'react';
import { notifications } from '../../data/Guest/notificationList';

const NotificationListPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Thông báo</h2>
        <button className="text-sm text-blue-600 hover:underline">Đánh dấu Đã đọc tất cả</button>
      </div>
      <div className="space-y-6">
        {notifications.map(n => (
          <div key={n.id} className="flex gap-4 border-b pb-6">
            <img src={n.image} alt="product" className="w-20 h-20 object-cover rounded" />
            <div className="flex-1">
              <div className="font-semibold text-lg mb-1 text-gray-800">{n.status}</div>
              <div className="text-gray-700 mb-1" dangerouslySetInnerHTML={{__html: n.desc.replace(n.orderId, `<b>${n.orderId}</b>`).replace(n.tracking||'', n.tracking?`<b>${n.tracking}</b>`:'')}} />
              <div className="text-xs text-gray-500 mt-1">{n.time}</div>
            </div>
            <div className="flex flex-col gap-2">
              {n.type === 'shipping' && <button className="px-4 py-2 border rounded text-sm hover:bg-gray-100">Xem Chi Tiết</button>}
              {n.type === 'done' && <button className="px-4 py-2 border rounded text-sm text-orange-600 border-orange-400 hover:bg-orange-50">Đánh Giá Sản Phẩm</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationListPage;
