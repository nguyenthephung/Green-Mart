import Notification from '../models/Notification';
import NotificationSettings from '../models/NotificationSettings';

interface CreateNotificationData {
  recipientId?: string;
  type: 'order' | 'promotion' | 'system' | 'review' | 'shipping' | 'admin' | 'voucher' | 'payment' | 'account';
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  actionText?: string;
  isGlobal?: boolean;
  targetRole?: 'user' | 'admin' | 'all';
  expiresAt?: Date;
  metadata?: any;
}

class NotificationHelper {
  // Create notification for specific user
  static async createUserNotification(data: CreateNotificationData) {
    try {
      // Bổ sung kiểm tra trạng thái notification settings của user
  // Sử dụng import chuẩn thay cho require để lấy đúng model
  // Đảm bảo import ở đầu file
  // Nếu đã import ở đầu file thì bỏ dòng này
  // Nếu chưa, thêm dòng sau ở đầu file:
  // import NotificationSettings from '../models/NotificationSettings';
  // Ở đây dùng lại biến đã import
  const settings = await NotificationSettings.findOne({ userId: data.recipientId });
      if (settings && settings.settings && settings.settings[data.type] === false) {
        return null;
      }

      const notification = new Notification({
        userId: data.recipientId,
        type: data.type,
        title: data.title,
        description: data.description,
        priority: data.priority || 'medium',
        actionUrl: data.actionUrl,
        actionText: data.actionText,
        isGlobal: false,
        metadata: data.metadata,
        expiresAt: data.expiresAt
      });

      await notification.save();
  // ...existing code...
      return notification;
    } catch (error) {
  // ...existing code (đã xóa log)...
      throw error;
    }
  }

  // Create global notification (for admins or all users)
  static async createGlobalNotification(data: CreateNotificationData) {
    try {
      const notification = new Notification({
        type: data.type,
        title: data.title,
        description: data.description,
        priority: data.priority || 'medium',
        actionUrl: data.actionUrl,
        actionText: data.actionText,
        isGlobal: true,
        targetRole: data.targetRole || 'admin',
        metadata: data.metadata,
        expiresAt: data.expiresAt
      });

      await notification.save();
  // ...existing code...
      return notification;
    } catch (error) {
      console.error('Error creating global notification:', error);
      throw error;
    }
  }

  // Order related notifications
  static async notifyOrderCreated(userId: string, orderData: any) {
    // User notification
    await this.createUserNotification({
      recipientId: userId,
      type: 'order',
      title: 'Đơn hàng đã được tạo thành công',
      description: `Đơn hàng #${orderData._id.toString().slice(-6)} đã được xác nhận. Tổng tiền: ${orderData.totalAmount.toLocaleString()}₫`,
      priority: 'high',
      actionUrl: '/myorder',
      actionText: 'Xem đơn hàng',
      metadata: {
        orderId: orderData._id,
        amount: orderData.totalAmount
      }
    });

    // Admin notification
    await this.createGlobalNotification({
      type: 'order',
      title: 'Đơn hàng mới cần xử lý',
      description: `Khách hàng vừa đặt đơn hàng #${orderData._id.toString().slice(-6)} - ${orderData.totalAmount.toLocaleString()}₫`,
      priority: 'urgent',
      targetRole: 'admin',
      actionUrl: `/admin/orders/${orderData._id}`,
      actionText: 'Xử lý đơn hàng',
      metadata: {
        orderId: orderData._id,
        userId: userId,
        amount: orderData.totalAmount
      }
    });
  }

  // Notification for successful online payment (PayPal, MoMo)
  static async notifyPaymentCompleted(userId: string, orderData: any, paymentMethod: string) {
    const methodNames: { [key: string]: string } = {
      'paypal': 'PayPal',
      'momo': 'MoMo',
      'vnpay': 'VNPay'
    };

    const methodName = methodNames[paymentMethod.toLowerCase()] || paymentMethod.toUpperCase();

    // User notification
    await this.createUserNotification({
      recipientId: userId,
      type: 'payment',
      title: 'Thanh toán thành công',
      description: `Thanh toán ${methodName} cho đơn hàng #${orderData._id.toString().slice(-6)} đã hoàn tất. Đơn hàng sẽ được xử lý ngay.`,
      priority: 'high',
      actionUrl: '/myorder',
      actionText: 'Xem đơn hàng',
      metadata: {
        orderId: orderData._id,
        amount: orderData.totalAmount,
        paymentMethod: paymentMethod
      }
    });

    // Admin notification
    await this.createGlobalNotification({
      type: 'payment',
      title: 'Thanh toán online hoàn tất',
      description: `Đơn hàng #${orderData._id.toString().slice(-6)} đã được thanh toán qua ${methodName} - ${orderData.totalAmount.toLocaleString()}₫`,
      priority: 'urgent',
      targetRole: 'admin',
      actionUrl: `/admin/orders/${orderData._id}`,
      actionText: 'Xử lý đơn hàng',
      metadata: {
        orderId: orderData._id,
        userId: userId,
        amount: orderData.totalAmount,
        paymentMethod: paymentMethod
      }
    });
  }

  static async notifyOrderStatusChanged(userId: string, orderData: any, newStatus: string) {
    const statusMessages = {
      confirmed: 'đã được xác nhận',
      preparing: 'đang được chuẩn bị',
      shipping: 'đang được giao',
      delivered: 'đã được giao thành công',
      cancelled: 'đã được hủy'
    };

    await this.createUserNotification({
      recipientId: userId,
      type: 'order',
      title: `Đơn hàng ${statusMessages[newStatus as keyof typeof statusMessages] || 'đã được cập nhật'}`,
      description: `Đơn hàng #${orderData._id.toString().slice(-6)} ${statusMessages[newStatus as keyof typeof statusMessages] || 'đã được cập nhật trạng thái'}`,
      priority: newStatus === 'delivered' ? 'high' : 'medium',
      actionUrl: '/myorder',
      actionText: 'Xem đơn hàng',
      metadata: {
        orderId: orderData._id,
        status: newStatus
      }
    });
  }

  // User related notifications
  static async notifyUserRegistered(userId: string, userData: any) {
    // Welcome notification for user
    await this.createUserNotification({
      recipientId: userId,
      type: 'account',
      title: 'Chào mừng bạn đến với GreenMart!',
      description: 'Tài khoản của bạn đã được tạo thành công. Hãy khám phá các sản phẩm tươi ngon nhất!',
      priority: 'medium',
      actionUrl: '/home',
      actionText: 'Khám phá ngay'
    });

    // Admin notification
    await this.createGlobalNotification({
      type: 'admin',
      title: 'Người dùng mới đăng ký',
      description: `${userData.name} (${userData.email}) vừa đăng ký tài khoản`,
      priority: 'low',
      targetRole: 'admin',
      metadata: {
        userId: userId,
        userEmail: userData.email
      }
    });
  }

  // Product related notifications
  static async notifyLowStock(productData: any) {
    await this.createGlobalNotification({
      type: 'system',
      title: 'Sản phẩm sắp hết hàng',
      description: `${productData.name} chỉ còn ${productData.stock} sản phẩm trong kho`,
      priority: 'high',
      targetRole: 'admin',
      actionUrl: `/admin/products/${productData._id}`,
      actionText: 'Cập nhật kho',
      metadata: {
        productId: productData._id,
        currentStock: productData.stock
      }
    });
  }

  // Voucher related notifications
  static async notifyVoucherReceived(userId: string, voucherData: any) {
    await this.createUserNotification({
      recipientId: userId,
      type: 'voucher',
      title: 'Bạn đã nhận được voucher mới!',
      description: `Voucher giảm ${voucherData.discount}% - ${voucherData.name}`,
      priority: 'medium',
      actionUrl: '/vouchers',
      actionText: 'Sử dụng ngay',
      metadata: {
        voucherId: voucherData._id,
        discount: voucherData.discount
      }
    });
  }

  // System notifications
  static async notifySystemMaintenance() {
    await this.createGlobalNotification({
      type: 'system',
      title: 'Thông báo bảo trì hệ thống',
      description: 'Hệ thống sẽ được bảo trì từ 2:00 - 4:00 sáng ngày mai. Vui lòng hoàn tất các giao dịch trước thời gian này.',
      priority: 'high',
      targetRole: 'all',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
  }

  // Promotion notifications
  static async notifyPromotion(promotionData: any) {
    await this.createGlobalNotification({
      type: 'promotion',
      title: promotionData.title,
      description: promotionData.description,
      priority: 'medium',
      targetRole: 'user',
      actionUrl: promotionData.actionUrl || '/home',
      actionText: 'Xem ngay',
      expiresAt: promotionData.expiresAt,
      metadata: promotionData.metadata
    });
  }

  // Notify password changed
  static async notifyPasswordChanged(userId: string) {
    await this.createUserNotification({
      recipientId: userId,
      type: 'account',
      title: 'Mật khẩu đã được thay đổi',
      description: 'Mật khẩu tài khoản của bạn đã được cập nhật thành công.',
      priority: 'high',
      actionUrl: '/profile',
      actionText: 'Xem hồ sơ'
    });
  }
}

export default NotificationHelper;
