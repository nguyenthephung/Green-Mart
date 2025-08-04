export interface Notification {
  _id: string;
  userId?: string;
  type: 'order' | 'promotion' | 'system' | 'review' | 'shipping' | 'admin' | 'voucher' | 'payment' | 'account';
  title: string;
  description: string;
  orderId?: string;
  trackingCode?: string;
  productName?: string;
  image?: string;
  isRead: boolean;
  reward?: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  actionText?: string;
  isGlobal: boolean;
  targetRole?: 'user' | 'admin' | 'all';
  expiresAt?: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  _id: string;
  userId: string;
  settings: {
    order: boolean;
    promotion: boolean;
    system: boolean;
    review: boolean;
    shipping: boolean;
    admin: boolean;
    voucher: boolean;
    payment: boolean;
    account: boolean;
  };
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationStats {
  totalNotifications: number;
  unreadNotifications: number;
  readNotifications?: number;
  globalNotifications?: number;
  personalNotifications?: number;
  unreadGlobal?: number;
  typeStats: {
    _id: string;
    count: number;
  }[];
}

export interface CreateNotificationPayload {
  type: string;
  title: string;
  description: string;
  userId?: string;
  isGlobal?: boolean;
  targetRole?: 'user' | 'admin' | 'all';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  actionText?: string;
  expiresAt?: string;
  image?: string;
  metadata?: any;
}

export interface NotificationResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    unreadCount: number;
  };
  message?: string;
}

export interface NotificationFilter {
  page?: number;
  limit?: number;
  type?: string;
  isRead?: boolean;
  isGlobal?: boolean;
  targetRole?: string;
}
