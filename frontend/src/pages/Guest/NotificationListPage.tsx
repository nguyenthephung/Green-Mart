import React, { useState } from 'react';
import { notifications } from '../../data/Guest/notificationList';
import DashboardLayout from '../../layouts/DashboardLayout';

const NotificationListPage: React.FC = () => {
  const [readNotifications, setReadNotifications] = useState<Set<number>>(new Set());

  const markAsRead = (id: number) => {
    setReadNotifications(prev => new Set([...prev, id]));
  };

  const markAllAsRead = () => {
    setReadNotifications(new Set(notifications.map(n => n.id)));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'shipping':
        return (
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m6.75 4.5v-3a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5v3m-6 0h4.5m0 0h2.625a1.125 1.125 0 001.125-1.125V11.25a1.125 1.125 0 00-1.125-1.125H15.75m-6.75 0H9.375a1.125 1.125 0 01-1.125-1.125V5.625m8.25 0h2.25a1.125 1.125 0 011.125 1.125v1.5m0 0H15.75m0 0v3M12 7.5V6a1.5 1.5 0 00-1.5-1.5h-3A1.5 1.5 0 006 6v1.5h6z" />
            </svg>
          </div>
        );
      case 'done':
        return (
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-5 5v-5zM9 17H4l5 5v-5z" />
            </svg>
          </div>
        );
    }
  };

  const unreadCount = notifications.filter(n => !readNotifications.has(n.id)).length;

  return (
    <DashboardLayout>
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-3xl shadow-xl border border-green-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Thông báo</h1>
              <p className="text-gray-600">
                {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả thông báo đã được đọc'}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button 
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              onClick={markAllAsRead}
            >
              Đánh dấu đã đọc tất cả
            </button>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0v1a1 1 0 01-1 1H8a1 1 0 01-1-1V4m0 0H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2h-3" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{notifications.length}</div>
                <div className="text-gray-600">Tổng thông báo</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{unreadCount}</div>
                <div className="text-gray-600">Chưa đọc</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{readNotifications.size}</div>
                <div className="text-gray-600">Đã đọc</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          {notifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có thông báo</h3>
              <p className="text-gray-600">Các thông báo mới sẽ xuất hiện tại đây</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map(n => {
                const isRead = readNotifications.has(n.id);
                return (
                  <div 
                    key={n.id} 
                    className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                      isRead 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg'
                    }`}
                    onClick={() => markAsRead(n.id)}
                  >
                    <div className="flex gap-4">
                      {getNotificationIcon(n.type)}
                      <img 
                        src={n.image} 
                        alt="product" 
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200" 
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className={`font-semibold text-lg ${isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                            {n.status}
                          </div>
                          {!isRead && (
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <div 
                          className={`mb-3 ${isRead ? 'text-gray-500' : 'text-gray-700'}`}
                          dangerouslySetInnerHTML={{
                            __html: n.desc
                              .replace(n.orderId, `<span class="font-semibold text-green-600">${n.orderId}</span>`)
                              .replace(n.tracking || '', n.tracking ? `<span class="font-semibold text-blue-600">${n.tracking}</span>` : '')
                          }} 
                        />
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">{n.time}</div>
                          <div className="flex gap-2">
                            {n.type === 'shipping' && (
                              <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm font-medium">
                                Xem Chi Tiết
                              </button>
                            )}
                            {n.type === 'done' && (
                              <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors duration-200 text-sm font-medium">
                                Đánh Giá Sản Phẩm
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotificationListPage;
