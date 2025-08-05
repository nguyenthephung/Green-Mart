import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck, Trash2, Settings, ExternalLink } from 'lucide-react';
import { useNotificationStore } from '../../../stores/useNotificationStore';
import { useUserStore } from '../../../stores/useUserStore';
import notificationService from '../../../services/notificationService';
import type { Notification } from '../../../types/notification';

interface NotificationDropdownProps {
  onClose?: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
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
    // fetchUnreadCount,
    clearError
  } = useNotificationStore();

  // Fetch notifications when component mounts
  useEffect(() => {
    if (user) {
      fetchNotifications({ limit: 10, isRead: activeTab === 'unread' ? false : undefined });
    }
  }, [user, activeTab]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    
    // Navigate to action URL if provided
    if (notification.actionUrl) {
      if (notification.actionUrl.startsWith('http')) {
        window.open(notification.actionUrl, '_blank');
      } else {
        window.location.href = notification.actionUrl;
      }
    }
    
    setIsOpen(false);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    // Refresh the list based on current tab
    if (activeTab === 'unread') {
      fetchNotifications({ limit: 10, isRead: false });
    }
  };

  const handleDeleteNotification = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    await deleteNotification(notificationId);
  };

  const filteredNotifications = activeTab === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-green-600 transition-colors duration-200"
        aria-label="Thông báo"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Thông báo</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex mt-2 bg-white rounded-lg p-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 px-3 py-1 text-sm rounded-md transition-colors ${
                  activeTab === 'all'
                    ? 'bg-green-100 text-green-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Tất cả ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`flex-1 px-3 py-1 text-sm rounded-md transition-colors ${
                  activeTab === 'unread'
                    ? 'bg-green-100 text-green-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Chưa đọc ({unreadCount})
              </button>
            </div>
          </div>

          {/* Actions */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <CheckCheck size={14} />
                    Đánh dấu tất cả đã đọc
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // Navigate to notifications page (if you have one)
                    window.location.href = '/notifications/settings';
                  }}
                  className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Settings size={14} />
                  Cài đặt
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="px-4 py-2 bg-red-50 border-b border-red-100">
              <div className="flex items-center justify-between">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={clearError}
                  className="text-red-600 hover:text-red-800"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                <span className="ml-2 text-sm text-gray-600">Đang tải...</span>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Bell size={48} className="text-gray-300 mb-2" />
                <p className="text-sm font-medium">
                  {activeTab === 'unread' ? 'Không có thông báo chưa đọc' : 'Không có thông báo nào'}
                </p>
                <p className="text-xs mt-1">
                  {activeTab === 'unread' 
                    ? 'Tất cả thông báo đã được đọc' 
                    : 'Thông báo sẽ xuất hiện ở đây'
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors group relative ${
                      !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-400' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Type Icon */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                        notificationService.getPriorityColor(notification.priority)
                      }`}>
                        {notificationService.getTypeIcon(notification.type)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className={`text-sm font-medium text-gray-900 ${
                            !notification.isRead ? 'font-semibold' : ''
                          }`}>
                            {notification.title}
                          </h4>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {notification.actionUrl && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNotificationClick(notification);
                                }}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Mở liên kết"
                              >
                                <ExternalLink size={14} />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDeleteNotification(notification._id, e)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Xóa thông báo"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.description}
                        </p>
                        
                        {/* Meta Info */}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {notificationService.formatTimeAgo(notification.createdAt)}
                          </span>
                          
                          {/* Priority & Action */}
                          <div className="flex items-center gap-2">
                            {notification.priority === 'urgent' && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                                Khẩn cấp
                              </span>
                            )}
                            {notification.priority === 'high' && (
                              <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-medium rounded-full">
                                Quan trọng
                              </span>
                            )}
                            {notification.actionText && (
                              <span className="text-xs text-blue-600 font-medium">
                                {notification.actionText}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Unread indicator */}
                        {!notification.isRead && (
                          <div className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
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
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to full notifications page (if you have one)
                  window.location.href = '/notifications';
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Xem tất cả thông báo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
