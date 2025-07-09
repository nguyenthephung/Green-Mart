import React from 'react';

const notifications = [
  {
    id: 1,
    type: 'shipping',
    status: 'Đang vận chuyển',
    orderId: '250709N09F0E4W',
    tracking: 'SPXVN056159087257',
    product: 'BEAR FIT - GẤU TẬP GYM',
    image: 'https://cf.shopee.vn/file/sg-11134201-7rbk2-lq2w2w2w2w2w2w',
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
