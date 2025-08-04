import React, { useState, useEffect } from 'react';
import { X, CheckCheck, Trash2, Settings, ExternalLink } from 'lucide-react';
import { useNotificationStore } from '../../../stores/useNotificationStore';
import { useUserStore } from '../../../stores/useUserStore';
import { useNavigate } from 'react-router-dom';
import type { Notification } from '../../../types/notification';

interface NotificationDropdownContentProps {
  onClose: () => void;
}

const NotificationDropdownContent: React.FC<NotificationDropdownContentProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const navigate = useNavigate();
  
  const { user } = useUserStore();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearError
  } = useNotificationStore();

  // Fetch notifications when component mounts or tab changes
  useEffect(() => {
    if (user) {
      fetchNotifications({ 
        limit: 10, 
        isRead: activeTab === 'unread' ? false : undefined 
      });
    }
  }, [user, activeTab, fetchNotifications]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    
    // Navigate based on notification type
    if (notification.metadata?.orderId) {
      navigate(`/myorder`);
    } else if (notification.metadata?.productId) {
      navigate(`/product/${notification.metadata.productId}`);
    }
    
    onClose();
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleSettings = () => {
    navigate('/notification-settings');
    onClose();
  };

  const filteredNotifications = notifications.filter(notification => 
    activeTab === 'all' || !notification.isRead
  );

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInMs = now.getTime() - notificationDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    
    return notificationDate.toLocaleDateString('vi-VN');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-blue-600 bg-blue-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="w-96 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[80vh] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Thông báo</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSettings}
              className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
              title="Cài đặt thông báo"
            >
              <Settings size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mt-3 bg-white rounded-lg p-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'unread'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Chưa đọc ({unreadCount})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <p className="text-red-600 mb-2">Có lỗi xảy ra khi tải thông báo</p>
            <button
              onClick={() => {
                clearError();
                fetchNotifications({ limit: 10 });
              }}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Thử lại
            </button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">
              {activeTab === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Priority indicator */}
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    notification.priority === 'urgent' ? 'bg-red-500' :
                    notification.priority === 'high' ? 'bg-orange-500' :
                    notification.priority === 'medium' ? 'bg-blue-500' : 'bg-green-500'
                  }`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`text-sm font-medium text-gray-900 truncate ${
                        !notification.isRead ? 'font-semibold' : ''
                      }`}>
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-1 ml-2">
                        {notification.priority && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(notification.priority)}`}>
                            {notification.priority.toUpperCase()}
                          </span>
                        )}
                        <button
                          onClick={(e) => handleDeleteNotification(notification._id, e)}
                          className="p-1 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Xóa thông báo"
                        >
                          <Trash2 size={12} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {notification.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                      
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredNotifications.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <div className="flex items-center justify-between">
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              disabled={unreadCount === 0}
            >
              <CheckCheck size={14} />
              Đánh dấu tất cả đã đọc
            </button>
            
            <button
              onClick={() => {
                navigate('/notifications');
                onClose();
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Xem tất cả
              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdownContent;
