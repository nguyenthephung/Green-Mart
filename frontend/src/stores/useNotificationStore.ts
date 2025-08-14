import { create } from 'zustand';
import type { 
  Notification, 
  NotificationSettings, 
  NotificationStats,
  NotificationFilter 
} from '../types/notification';
import notificationService from '../services/notificationService';

interface NotificationState {
  // Data
  notifications: Notification[];
  settings: NotificationSettings | null;
  stats: NotificationStats | null;
  unreadCount: number;
  
  // UI State
  loading: boolean;
  loadingSettings: boolean;
  loadingStats: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  
  // Filters
  currentFilter: NotificationFilter;
  
  // Actions
  fetchNotifications: (filter?: NotificationFilter, append?: boolean) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  
  // Admin actions
  createNotification: (payload: any) => Promise<void>;
  fetchAllNotifications: (filter?: NotificationFilter) => Promise<void>;
  adminDeleteNotification: (notificationId: string) => Promise<void>;
  
  // Utility
  clearError: () => void;
  clearNotifications: () => void;
  setFilter: (filter: NotificationFilter) => void;
  addNotification: (notification: Notification) => void;
  updateNotificationInList: (notificationId: string, updates: Partial<Notification>) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  // Initial state
  notifications: [],
  settings: null,
  stats: null,
  unreadCount: 0,
  loading: false,
  loadingSettings: false,
  loadingStats: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  hasMore: false,
  currentFilter: {},

  // Fetch notifications
  fetchNotifications: async (filter = {}, append = false) => {
    const state = get();
    
    if (!append) {
      set({ loading: true, error: null });
    }
    
    try {
      const mergedFilter = { ...state.currentFilter, ...filter };
      const response = await notificationService.getNotifications(mergedFilter);
      
      // Response structure: {success: true, data: {notifications: [], pagination: {}, unreadCount: number}}
      const newNotifications = append 
        ? [...state.notifications, ...response.data.notifications]
        : response.data.notifications;
      
      set({
        notifications: newNotifications,
        unreadCount: response.data.unreadCount,
        currentPage: response.data.pagination.page,
        totalPages: response.data.pagination.pages,
        hasMore: response.data.pagination.page < response.data.pagination.pages,
        currentFilter: mergedFilter,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Store: error in fetchNotifications:', error);
      set({ 
        loading: false, 
        error: error.message || 'Lỗi khi tải thông báo' 
      });
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      const state = get();
      const updatedNotifications = state.notifications.map(notification =>
        notification._id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      );
      
      // Decrease unread count if notification was unread
      const notification = state.notifications.find(n => n._id === notificationId);
      const newUnreadCount = notification && !notification.isRead 
        ? Math.max(0, state.unreadCount - 1)
        : state.unreadCount;
      
      set({
        notifications: updatedNotifications,
        unreadCount: newUnreadCount
      });
    } catch (error: any) {
      set({ error: error.message || 'Lỗi khi đánh dấu thông báo' });
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead();
      
      const state = get();
      const updatedNotifications = state.notifications.map(notification =>
        ({ ...notification, isRead: true })
      );
      
      set({
        notifications: updatedNotifications,
        unreadCount: 0
      });
    } catch (error: any) {
      set({ error: error.message || 'Lỗi khi đánh dấu tất cả thông báo' });
    }
  },

  // Delete notification
  deleteNotification: async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      const state = get();
      const notification = state.notifications.find(n => n._id === notificationId);
      const updatedNotifications = state.notifications.filter(n => n._id !== notificationId);
      
      // Decrease unread count if deleted notification was unread
      const newUnreadCount = notification && !notification.isRead 
        ? Math.max(0, state.unreadCount - 1)
        : state.unreadCount;
      
      set({
        notifications: updatedNotifications,
        unreadCount: newUnreadCount
      });
    } catch (error: any) {
      set({ error: error.message || 'Lỗi khi xóa thông báo' });
    }
  },

  // Fetch settings
  fetchSettings: async () => {
    set({ loadingSettings: true, error: null });
    
    try {
      const settings = await notificationService.getSettings();
      set({ settings, loadingSettings: false });
    } catch (error: any) {
      set({ 
        loadingSettings: false, 
        error: error.message || 'Lỗi khi tải cài đặt thông báo' 
      });
    }
  },

  // Update settings
  updateSettings: async (newSettings: Partial<NotificationSettings>) => {
    set({ loadingSettings: true, error: null });
    
    try {
      const settings = await notificationService.updateSettings(newSettings);
      set({ settings, loadingSettings: false });
    } catch (error: any) {
      set({ 
        loadingSettings: false, 
        error: error.message || 'Lỗi khi cập nhật cài đặt thông báo' 
      });
    }
  },

  // Fetch stats
  fetchStats: async () => {
    set({ loadingStats: true, error: null });
    
    try {
      const stats = await notificationService.getStatistics();
      set({ stats, loadingStats: false });
    } catch (error: any) {
      set({ 
        loadingStats: false, 
        error: error.message || 'Lỗi khi tải thống kê thông báo' 
      });
    }
  },

  // Fetch unread count
  fetchUnreadCount: async () => {
    try {
      const unreadCount = await notificationService.getUnreadCount();
      set({ unreadCount });
    } catch (error: any) {
      console.error('Error fetching unread count:', error);
    }
  },

  // Admin: Create notification
  createNotification: async (payload: any) => {
    set({ loading: true, error: null });
    
    try {
      await notificationService.createNotification(payload);
      set({ loading: false });
      
      // Refresh notifications list
      await get().fetchAllNotifications();
    } catch (error: any) {
      set({ 
        loading: false, 
        error: error.message || 'Lỗi khi tạo thông báo' 
      });
    }
  },

  // Admin: Fetch all notifications
  fetchAllNotifications: async (filter = {}) => {
    set({ loading: true, error: null });
    
    try {
      const response = await notificationService.getAllNotifications(filter);
      
      set({
        notifications: response.data.notifications,
        currentPage: response.data.pagination.page,
        totalPages: response.data.pagination.pages,
        hasMore: response.data.pagination.page < response.data.pagination.pages,
        currentFilter: filter,
        loading: false,
        error: null
      });
    } catch (error: any) {
      set({ 
        loading: false, 
        error: error.message || 'Lỗi khi tải danh sách thông báo' 
      });
    }
  },

  // Admin: Delete notification
  adminDeleteNotification: async (notificationId: string) => {
    try {
      await notificationService.adminDeleteNotification(notificationId);
      
      const state = get();
      const updatedNotifications = state.notifications.filter(n => n._id !== notificationId);
      
      set({ notifications: updatedNotifications });
    } catch (error: any) {
      set({ error: error.message || 'Lỗi khi xóa thông báo' });
    }
  },

  // Utility actions
  clearError: () => set({ error: null }),
  
  clearNotifications: () => set({ 
    notifications: [], 
    unreadCount: 0,
    currentPage: 1,
    totalPages: 0,
    hasMore: false
  }),
  
  setFilter: (filter: NotificationFilter) => {
    set({ currentFilter: filter });
  },
  
  addNotification: (notification: Notification) => {
    const state = get();
    set({
      notifications: [notification, ...state.notifications],
      unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1
    });
  },
  
  updateNotificationInList: (notificationId: string, updates: Partial<Notification>) => {
    const state = get();
    const updatedNotifications = state.notifications.map(notification =>
      notification._id === notificationId 
        ? { ...notification, ...updates }
        : notification
    );
    
    set({ notifications: updatedNotifications });
  }
}));
