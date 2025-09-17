import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../stores/useUserStore';
import { apiClient } from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  isGlobal: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  expiresAt?: string;
  actionUrl?: string;
  actionText?: string;
}

const NotificationPage: React.FC = () => {
  const user = useUserStore(state => state.user);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchNotifications = async (currentPage = 1, filterType = filter) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(filterType !== 'all' && { isRead: filterType === 'read' ? 'true' : 'false' })
      });

      const response = await apiClient<any>(`/notifications?${queryParams}`, {
        method: 'GET'
      });

      if (response.success && response.data) {
        const notifications = response.data.notifications || response.data.data?.notifications || [];
        const pagination = response.data.pagination || response.data.data?.pagination || { pages: 1 };
        const unreadCount = response.data.unreadCount || response.data.data?.unreadCount || 0;
        
        setNotifications(notifications);
        setTotalPages(pagination.pages);
        setUnreadCount(unreadCount);
      } else {
        console.error('API response error:', response);
        setNotifications([]);
        setTotalPages(1);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      setActionLoading(true);
      const response = await apiClient(`/notifications/${notificationId}/mark-read`, {
        method: 'PUT'
      });

      if (response.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading(true);
      const response = await apiClient('/notifications/mark-all-read', {
        method: 'PUT'
      });

      if (response.success) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (notificationId: string) => {
    if (!confirm('Bạn có chắc muốn xóa thông báo này?')) return;

    try {
      setActionLoading(true);
      const response = await apiClient(`/notifications/${notificationId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        // If it was unread, decrease unread count
        const deletedNotification = notifications.find(n => n._id === notificationId);
        if (deletedNotification && !deletedNotification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFilterChange = (newFilter: 'all' | 'unread' | 'read') => {
    setFilter(newFilter);
    setPage(1);
    fetchNotifications(1, newFilter);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchNotifications(newPage);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Vui lòng đăng nhập để xem thông báo</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="bg-gray-50 min-h-full rounded-xl py-8">
        <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              {/* Back Button */}
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                title="Trở về"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Trở về</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
            </div>
            <div className="flex items-center gap-4">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={actionLoading}
                  className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Đánh dấu tất cả đã đọc
                </button>
              )}
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {unreadCount} chưa đọc
              </div>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2">
            {(['all', 'unread', 'read'] as const).map(filterType => (
              <button
                key={filterType}
                onClick={() => handleFilterChange(filterType)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filter === filterType
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterType === 'all' ? 'Tất cả' : filterType === 'unread' ? 'Chưa đọc' : 'Đã đọc'}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Đang tải thông báo...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="text-gray-400 text-4xl mb-4">📭</div>
              <p className="text-gray-600">
                {filter === 'all' ? 'Bạn chưa có thông báo nào' : 
                 filter === 'unread' ? 'Không có thông báo chưa đọc' : 
                 'Không có thông báo đã đọc'}
              </p>
            </div>
          ) : (
            notifications.map(notification => (
              <div
                key={notification._id}
                className={`bg-white rounded-lg shadow-sm border-l-4 ${getPriorityColor(notification.priority)} ${
                  !notification.isRead ? 'ring-2 ring-blue-100' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-2xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                          {notification.isGlobal && (
                            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                              Toàn hệ thống
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded ${
                            notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                            notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {notification.priority === 'high' ? 'Cao' :
                             notification.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>
                              {new Date(notification.createdAt).toLocaleString('vi-VN')}
                            </span>
                            {notification.expiresAt && (
                              <span>
                                Hết hạn: {new Date(notification.expiresAt).toLocaleString('vi-VN')}
                              </span>
                            )}
                          </div>
                          {notification.actionUrl && notification.actionText && (
                            <a
                              href={notification.actionUrl}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              {notification.actionText}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          disabled={actionLoading}
                          className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50"
                          title="Đánh dấu đã đọc"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification._id)}
                        disabled={actionLoading}
                        className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                        title="Xóa thông báo"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1 || loading}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Trước
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={loading}
                    className={`px-3 py-2 text-sm rounded-lg ${
                      page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } disabled:opacity-50`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages || loading}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">
              Trang {page} / {totalPages}
            </p>
          </div>
        )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotificationPage;
