import Notification from '../models/Notification';
import NotificationSettings from '../models/NotificationSettings';
import mongoose from 'mongoose';

export class NotificationService {
  // Create notification for specific user
  static async createUserNotification(
    userId: string | mongoose.Types.ObjectId,
    type: string,
    title: string,
    description: string,
    options: {
      orderId?: string | mongoose.Types.ObjectId;
      trackingCode?: string;
      productName?: string;
      image?: string;
      reward?: number;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      actionUrl?: string;
      actionText?: string;
      expiresAt?: Date;
      metadata?: any;
    } = {}
  ) {
    try {
      // Check user notification settings
      const settings = await NotificationSettings.findOne({ userId });
      if (settings && !settings.settings[type as keyof typeof settings.settings]) {
        return null;
      }

      const notification = new Notification({
        userId: new mongoose.Types.ObjectId(userId.toString()),
        type,
        title,
        description,
        orderId: options.orderId ? new mongoose.Types.ObjectId(options.orderId.toString()) : undefined,
        trackingCode: options.trackingCode,
        productName: options.productName,
        image: options.image,
        reward: options.reward,
        priority: options.priority || 'medium',
        actionUrl: options.actionUrl,
        actionText: options.actionText,
        expiresAt: options.expiresAt,
        metadata: options.metadata || {}
      });

      await notification.save();
      return notification;
    } catch (error) {
  // ...existing code (đã xóa log)...
      throw error;
    }
  }

  // Create global notification (broadcast)
  static async createGlobalNotification(
    type: string,
    title: string,
    description: string,
    targetRole: 'user' | 'admin' | 'all',
    createdBy: string | mongoose.Types.ObjectId,
    options: {
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      actionUrl?: string;
      actionText?: string;
      expiresAt?: Date;
      image?: string;
      metadata?: any;
    } = {}
  ) {
    try {
      const notification = new Notification({
        type,
        title,
        description,
        isGlobal: true,
        targetRole,
        priority: options.priority || 'medium',
        actionUrl: options.actionUrl,
        actionText: options.actionText,
        expiresAt: options.expiresAt,
        image: options.image,
        metadata: options.metadata || {},
        createdBy: new mongoose.Types.ObjectId(createdBy.toString())
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Create global notification error:', error);
      throw error;
    }
  }

  // Order-related notifications
  static async notifyOrderCreated(userId: string, orderId: string, orderTotal: number) {
    return this.createUserNotification(
      userId,
      'order',
      'Đơn hàng đã được tạo',
      `Đơn hàng của bạn với tổng giá trị ${orderTotal.toLocaleString('vi-VN')}₫ đã được tạo thành công.`,
      {
        orderId,
        actionUrl: `/orders/${orderId}`,
        actionText: 'Xem đơn hàng',
        priority: 'medium'
      }
    );
  }

  static async notifyOrderConfirmed(userId: string, orderId: string, trackingCode?: string) {
    return this.createUserNotification(
      userId,
      'order',
      'Đơn hàng đã được xác nhận',
      `Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị.${trackingCode ? ` Mã vận đơn: ${trackingCode}` : ''}`,
      {
        orderId,
        trackingCode,
        actionUrl: `/orders/${orderId}`,
        actionText: 'Theo dõi đơn hàng',
        priority: 'high'
      }
    );
  }

  static async notifyOrderShipped(userId: string, orderId: string, trackingCode: string) {
    return this.createUserNotification(
      userId,
      'shipping',
      'Đơn hàng đang được giao',
      `Đơn hàng của bạn đã được giao cho đơn vị vận chuyển. Mã vận đơn: ${trackingCode}`,
      {
        orderId,
        trackingCode,
        actionUrl: `/orders/${orderId}`,
        actionText: 'Theo dõi vận đơn',
        priority: 'high'
      }
    );
  }

  static async notifyOrderDelivered(userId: string, orderId: string, reward?: number) {
    return this.createUserNotification(
      userId,
      'order',
      'Đơn hàng đã được giao thành công',
      `Đơn hàng của bạn đã được giao thành công. ${reward ? `Bạn nhận được ${reward} điểm tích lũy!` : 'Cảm ơn bạn đã mua sắm tại Green Mart!'}`,
      {
        orderId,
        reward,
        actionUrl: `/orders/${orderId}`,
        actionText: 'Đánh giá sản phẩm',
        priority: 'medium'
      }
    );
  }

  static async notifyOrderCancelled(userId: string, orderId: string, reason?: string) {
    return this.createUserNotification(
      userId,
      'order',
      'Đơn hàng đã bị hủy',
      `Đơn hàng của bạn đã bị hủy. ${reason ? `Lý do: ${reason}` : 'Vui lòng liên hệ CSKH để biết thêm chi tiết.'}`,
      {
        orderId,
        actionUrl: `/orders/${orderId}`,
        actionText: 'Xem chi tiết',
        priority: 'high'
      }
    );
  }

  // Promotion-related notifications
  static async notifyPromotionAvailable(
    userId: string,
    title: string,
    description: string,
    voucherCode?: string,
    expiresAt?: Date
  ) {
    return this.createUserNotification(
      userId,
      'promotion',
      title,
      description,
      {
        actionUrl: voucherCode ? `/vouchers/${voucherCode}` : '/promotions',
        actionText: 'Sử dụng ngay',
        expiresAt,
        priority: 'medium',
        metadata: { voucherCode }
      }
    );
  }

  static async notifyVoucherExpiringSoon(userId: string, voucherCode: string, expiresAt: Date) {
    return this.createUserNotification(
      userId,
      'voucher',
      'Voucher sắp hết hạn',
      `Voucher ${voucherCode} của bạn sẽ hết hạn vào ${expiresAt.toLocaleDateString('vi-VN')}. Hãy sử dụng ngay!`,
      {
        actionUrl: '/checkout',
        actionText: 'Mua sắm ngay',
        priority: 'medium',
        metadata: { voucherCode, expiresAt }
      }
    );
  }

  // Payment-related notifications
  static async notifyPaymentSuccess(userId: string, orderId: string, amount: number, method: string) {
    return this.createUserNotification(
      userId,
      'payment',
      'Thanh toán thành công',
      `Thanh toán ${amount.toLocaleString('vi-VN')}₫ qua ${method} đã được xử lý thành công.`,
      {
        orderId,
        actionUrl: `/orders/${orderId}`,
        actionText: 'Xem đơn hàng',
        priority: 'high'
      }
    );
  }

  static async notifyPaymentFailed(userId: string, orderId: string, amount: number, reason?: string) {
    return this.createUserNotification(
      userId,
      'payment',
      'Thanh toán thất bại',
      `Thanh toán ${amount.toLocaleString('vi-VN')}₫ thất bại. ${reason || 'Vui lòng thử lại hoặc chọn phương thức thanh toán khác.'}`,
      {
        orderId,
        actionUrl: `/orders/${orderId}/payment`,
        actionText: 'Thanh toán lại',
        priority: 'urgent'
      }
    );
  }

  // Account-related notifications
  static async notifyAccountVerified(userId: string) {
    return this.createUserNotification(
      userId,
      'account',
      'Tài khoản đã được xác thực',
      'Chúc mừng! Tài khoản của bạn đã được xác thực thành công. Bạn có thể sử dụng đầy đủ các tính năng của Green Mart.',
      {
        actionUrl: '/profile',
        actionText: 'Xem hồ sơ',
        priority: 'medium'
      }
    );
  }

  static async notifyPasswordChanged(userId: string) {
    return this.createUserNotification(
      userId,
      'account',
      'Mật khẩu đã được thay đổi',
      'Mật khẩu tài khoản của bạn đã được thay đổi thành công. Nếu bạn không thực hiện thao tác này, vui lòng liên hệ CSKH ngay.',
      {
        actionUrl: '/profile/security',
        actionText: 'Kiểm tra bảo mật',
        priority: 'high'
      }
    );
  }

  // Admin notifications
  static async notifyAdminNewOrder(orderId: string, customerName: string, total: number, createdBy: string) {
    return this.createGlobalNotification(
      'admin',
      'Đơn hàng mới',
      `Khách hàng ${customerName} đã đặt đơn hàng mới với tổng giá trị ${total.toLocaleString('vi-VN')}₫.`,
      'admin',
      createdBy,
      {
        actionUrl: `/admin/orders/${orderId}`,
        actionText: 'Xem đơn hàng',
        priority: 'medium',
        metadata: { orderId, customerName, total }
      }
    );
  }

  static async notifyAdminLowStock(productId: string, productName: string, stock: number, createdBy: string) {
    return this.createGlobalNotification(
      'admin',
      'Sản phẩm sắp hết hàng',
      `Sản phẩm "${productName}" chỉ còn ${stock} sản phẩm trong kho.`,
      'admin',
      createdBy,
      {
        actionUrl: `/admin/products/${productId}`,
        actionText: 'Cập nhật kho',
        priority: 'high',
        metadata: { productId, productName, stock }
      }
    );
  }

  // Cleanup expired notifications
  static async cleanupExpiredNotifications() {
    try {
      const result = await Notification.deleteMany({
        expiresAt: { $lt: new Date() }
      });
      console.log(`Cleaned up ${result.deletedCount} expired notifications`);
      return result;
    } catch (error) {
      console.error('Cleanup expired notifications error:', error);
      throw error;
    }
  }

  // Get unread count for user
  static async getUnreadCount(userId: string | mongoose.Types.ObjectId) {
    try {
      return await Notification.countDocuments({
        $and: [
          {
            $or: [
              { userId: new mongoose.Types.ObjectId(userId.toString()) },
              { isGlobal: true, targetRole: { $in: ['user', 'all'] } }
            ]
          },
          {
            $or: [
              { expiresAt: null },
              { expiresAt: { $gt: new Date() } }
            ]
          }
        ],
        isRead: false
      });
    } catch (error) {
      console.error('Get unread count error:', error);
      throw error;
    }
  }
}
