import { apiClient } from './api';
import type {
  Notification,
  NotificationSettings,
  NotificationStats,
  CreateNotificationPayload,
  NotificationResponse,
  NotificationFilter,
} from '../types/notification';

// Simple API wrapper
const api = {
  get: async (url: string) => {
    return await apiClient(url, { method: 'GET' });
  },
  post: async (url: string, data?: any) => {
    return await apiClient(url, { method: 'POST', body: data ? JSON.stringify(data) : undefined });
  },
  put: async (url: string, data?: any) => {
    return await apiClient(url, { method: 'PUT', body: data ? JSON.stringify(data) : undefined });
  },
  delete: async (url: string) => {
    return await apiClient(url, { method: 'DELETE' });
  },
};

class NotificationService {
  // Get notifications for current user
  async getNotifications(filter: NotificationFilter = {}): Promise<NotificationResponse> {
    try {
      const params = new URLSearchParams();
      if (filter.page) params.append('page', filter.page.toString());
      if (filter.limit) params.append('limit', filter.limit.toString());
      if (filter.type) params.append('type', filter.type);
      if (filter.isRead !== undefined) params.append('isRead', filter.isRead.toString());

      const response = await api.get(`/notifications?${params.toString()}`);

      // Return the full response structure to match NotificationResponse type
      if (response.success && response.data) {
        return response as NotificationResponse;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách thông báo');
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await api.put(`/notifications/${notificationId}/read`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi đánh dấu thông báo');
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    try {
      await api.put('/notifications/read-all');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi đánh dấu tất cả thông báo');
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await api.delete(`/notifications/${notificationId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi xóa thông báo');
    }
  }

  // Get notification settings
  async getSettings(): Promise<NotificationSettings> {
    try {
      const response = await api.get('/notifications/settings');

      return (response as any).data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi lấy cài đặt thông báo');
    }
  }

  // Update notification settings
  async updateSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    try {
      const response = await api.put('/notifications/settings', settings);
      return (response.data as any).data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật cài đặt thông báo');
    }
  }

  // Get notification statistics
  async getStatistics(): Promise<NotificationStats> {
    try {
      const response = await api.get('/notifications/statistics');
      return (response.data as any).data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi lấy thống kê thông báo');
    }
  }

  // Get unread count only
  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get('/notifications/unread-count');
      // Handle different response formats - use type assertion for flexibility
      const data = response as any;

      // Try different possible response structures
      if (data.success && data.data && typeof data.data.count === 'number') {
        return data.data.count;
      } else if (data.success && typeof data.count === 'number') {
        return data.count;
      } else if (data.data && typeof data.data.unreadCount === 'number') {
        return data.data.unreadCount;
      } else if (typeof data.unreadCount === 'number') {
        return data.unreadCount;
      } else {
        return 0;
      }
    } catch (error) {
      return 0; // Return 0 instead of throwing error
    }
  }

  // Admin: Create notification
  async createNotification(payload: CreateNotificationPayload): Promise<Notification> {
    try {
      const response = await api.post('/notifications/admin/create', payload);
      return (response.data as any).data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi tạo thông báo');
    }
  }

  // Admin: Get all notifications
  async getAllNotifications(filter: NotificationFilter = {}): Promise<NotificationResponse> {
    try {
      const params = new URLSearchParams();
      if (filter.page) params.append('page', filter.page.toString());
      if (filter.limit) params.append('limit', filter.limit.toString());
      if (filter.type) params.append('type', filter.type);
      if (filter.isGlobal !== undefined) params.append('isGlobal', filter.isGlobal.toString());
      if (filter.targetRole) params.append('targetRole', filter.targetRole);

      const response = await api.get(`/notifications/admin/all?${params.toString()}`);
      return response.data as NotificationResponse;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách thông báo');
    }
  }

  // Admin: Delete notification
  async adminDeleteNotification(notificationId: string): Promise<void> {
    try {
      await api.delete(`/notifications/admin/${notificationId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi xóa thông báo');
    }
  }

  // Helper: Get priority color
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }

  // Helper: Get type icon
  getTypeIcon(type: string): string {
    switch (type) {
      case 'order':
        return '🛍️';
      case 'promotion':
        return '🎉';
      case 'system':
        return '⚙️';
      case 'review':
        return '⭐';
      case 'shipping':
        return '🚚';
      case 'admin':
        return '👨‍💼';
      case 'voucher':
        return '🎫';
      case 'payment':
        return '💳';
      case 'account':
        return '👤';
      default:
        return '📢';
    }
  }

  // Helper: Format relative time
  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Vừa xong';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} phút trước`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} giờ trước`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  }
}

export default new NotificationService();
