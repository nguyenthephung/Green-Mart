import React from 'react';

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
    <div 
      className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-50 border border-gray-200 dark:border-gray-700 max-h-[70vh] overflow-hidden"
    >
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span 
            className="font-semibold"
            style={{ 
              color: 'rgb(var(--color-text-primary))' 
            }}
          >
            Thông báo
          </span>
          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            {notifications.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 hover:bg-green-50 dark:hover:text-green-300 dark:hover:bg-green-900/20 font-medium px-2 py-1 rounded transition-colors duration-200">
            Đánh dấu đã đọc
          </button>
          {onClose && (
            <button 
              className="ml-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 hover:text-gray-800 dark:hover:bg-red-900/20 text-gray-500 dark:text-gray-400 dark:hover:text-red-400 transition-all duration-200" 
              onClick={onClose} 
              aria-label="Đóng thông báo"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Không có thông báo mới</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map((n, index) => (
              <div 
                key={n.id} 
                className="flex gap-4 px-6 py-4 hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-gray-800/50 dark:hover:text-white transition-all duration-200 group cursor-pointer"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: 'slideInRight 0.3s ease-out'
                }}
              >
                <div className="relative flex-shrink-0">
                  <img 
                    src={n.image} 
                    alt="product" 
                    className="w-14 h-14 object-cover rounded-xl shadow-sm group-hover:shadow-md transition-shadow" 
                  />
                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ${
                    n.type === 'shipping' ? 'bg-blue-500' : 'bg-green-500'
                  }`}>
                    {n.type === 'shipping' ? (
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707L15 6.586A1 1 0 0014.707 6H14z" />
                      </svg>
                    ) : (
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 
                      className="font-semibold text-sm group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors"
                      style={{ color: 'rgb(var(--color-text-primary))' }}
                    >
                      {n.status}
                    </h4>
                    <span 
                      className="text-xs flex-shrink-0 ml-2"
                      style={{ color: 'rgb(var(--color-text-muted))' }}
                    >
                      {n.time}
                    </span>
                  </div>
                  
                  <p 
                    className="text-xs leading-relaxed mb-3 line-clamp-2"
                    style={{ color: 'rgb(var(--color-text-secondary))' }}
                  >
                    <span dangerouslySetInnerHTML={{
                      __html: n.desc
                        .replace(n.orderId, `<span class="font-semibold text-green-600">${n.orderId}</span>`)
                        .replace(n.tracking || '', n.tracking ? `<span class="font-semibold text-blue-600">${n.tracking}</span>` : '')
                    }} />
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {n.type === 'shipping' && (
                        <button className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-gray-800 dark:hover:text-white transition-colors border border-blue-200">
                          Xem Chi Tiết
                        </button>
                      )}
                      {n.type === 'done' && (
                        <button className="px-3 py-1.5 bg-orange-50 text-orange-600 text-xs font-medium rounded-lg hover:bg-orange-100 dark:hover:bg-gray-800 dark:hover:text-white transition-colors border border-orange-200">
                          Đánh Giá
                        </button>
                      )}
                    </div>
                    
                    {n.reward && (
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-200">
                        <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-xs font-semibold text-yellow-600">+{n.reward} xu</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <button className="w-full text-center text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors">
          Xem tất cả thông báo
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
