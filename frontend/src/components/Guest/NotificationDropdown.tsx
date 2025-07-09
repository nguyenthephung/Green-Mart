import React, { useState } from 'react';

const notifications = [
  {
    id: 1,
    type: 'shipping',
    status: 'Đang vận chuyển',
    orderId: '250709N09F0E4W',
    tracking: 'SPXVN056159087257',
    product: 'BEAR FIT - GẤU TẬP GYM',
    image: 'https://cf.shopee.vn/file/sg-11134201-7rbk2-lq2w2w2w2w2w',
    time: '11:44 09-07-2025',
    desc: 'Đơn hàng 250709N09F0E4W với mã vận đơn SPXVN056159087257 đã được Người bán BEAR FIT - GẤU TẬP GYM giao cho đơn vị vận chuyển qua phương thức vận chuyển SPX Express.'
  },
  {
    id: 2,
    type: 'shipping',
    status: 'Đang vận chuyển',
    orderId: '250709N09F0E4X',
    tracking: 'SPXVN059033511067',
    product: 'Arisman - Sportwear',
    image: 'https://cf.shopee.vn/file/sg-11134201-7rbk2-lq2w2w2w2w2w2w',
    time: '11:17 09-07-2025',
    desc: 'Đơn hàng 250709N09F0E4X với mã vận đơn SPXVN059033511067 đã được Người bán Arisman - Sportwear giao cho đơn vị vận chuyển qua phương thức vận chuyển SPX Express.'
  },
  {
    id: 3,
    type: 'done',
    status: 'Đơn hàng đã hoàn tất',
    orderId: '2507023UXV1QA0',
    time: '00:26 09-07-2025',
    image: 'https://cf.shopee.vn/file/sg-11134201-7rbk2-lq2w2w2w2w2w2w',
    desc: 'Đơn hàng 2507023UXV1QA0 đã hoàn thành. Bạn hãy đánh giá sản phẩm trước ngày 08-08-2025 để nhận 200 xu và giúp người dùng khác hiểu hơn về sản phẩm nhé!',
    reward: 200
  },
  {
    id: 4,
    type: 'done',
    status: 'Đơn hàng đã hoàn tất',
    orderId: '250630VVCDH8CA',
    time: '20:58 05-07-2025',
    image: 'https://cf.shopee.vn/file/sg-11134201-7rbk2-lq2w2w2w2w2w2w',
    desc: 'Đơn hàng 250630VVCDH8CA đã hoàn thành. Bạn hãy đánh giá sản phẩm trước ngày 04-08-2025 để nhận 200 xu và giúp người dùng khác hiểu hơn về sản phẩm nhé!',
    reward: 200
  },
];

const NotificationDropdown: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 border border-gray-200 max-h-[70vh] overflow-y-auto">
      <div className="flex justify-between items-center px-4 py-2 border-b">
        <span className="font-semibold text-gray-700">Thông báo</span>
        <div className="flex items-center gap-2">
          <button className="text-xs text-blue-600 hover:underline">Đánh dấu Đã đọc tất cả</button>
          {onClose && (
            <button className="ml-2 text-lg text-gray-400 hover:text-red-500" onClick={onClose} aria-label="Đóng thông báo">×</button>
          )}
        </div>
      </div>
      <div className="divide-y">
        {notifications.map(n => (
          <div key={n.id} className="flex gap-3 px-4 py-3 hover:bg-gray-50">
            <img src={n.image} alt="product" className="w-14 h-14 object-cover rounded" />
            <div className="flex-1">
              <div className="font-semibold text-sm text-gray-800 mb-1">{n.status}</div>
              <div className="text-xs text-gray-700 mb-1" dangerouslySetInnerHTML={{__html: n.desc.replace(n.orderId, `<b>${n.orderId}</b>`).replace(n.tracking||'', n.tracking?`<b>${n.tracking}</b>`:'')}} />
              <div className="text-xs text-gray-500 mt-1">{n.time}</div>
            </div>
            <div className="flex flex-col gap-2">
              {n.type === 'shipping' && <button className="px-2 py-1 border rounded text-xs hover:bg-gray-100">Xem Chi Tiết</button>}
              {n.type === 'done' && <button className="px-2 py-1 border rounded text-xs text-orange-600 border-orange-400 hover:bg-orange-50">Đánh Giá</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationDropdown;
