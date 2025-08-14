// Admin Notification Service
import { IOrder } from '../models/Order';

export class AdminNotificationService {
  
  // Gửi thông báo khi có đơn hàng mới cần xác nhận
  static async notifyNewOrderPendingConfirmation(order: IOrder) {
    try {
      const message = this.formatOrderNotification(order);
      
      // Log to console for now (có thể thay bằng email, SMS, webhook, etc.)
  // ...existing code (đã xóa log)...
      
      // TODO: Implement real notification methods
      // await this.sendEmail(adminEmail, 'New Order Pending', message);
      // await this.sendSlackNotification(message);
      // await this.sendWebhook(order);
      
    } catch (error) {
  // ...existing code (đã xóa log)...
    }
  }
  
  // Format thông báo đơn hàng
  private static formatOrderNotification(order: IOrder): string {
    const paymentMethodText = this.getPaymentMethodText(order.paymentMethod);
    
    return `
📦 NEW ORDER NOTIFICATION
═══════════════════════════
Order ID: ${order._id}
Order Number: ${order.orderNumber}
Customer: ${order.customerName}
Phone: ${order.customerPhone}
Payment Method: ${paymentMethodText}
Total Amount: ${this.formatCurrency(order.totalAmount)}
Status: ${order.status}

${this.getActionRequired(order.paymentMethod)}

Created: ${new Date(order.orderDate).toLocaleString('vi-VN')}
    `.trim();
  }
  
  // Lấy text hiển thị cho phương thức thanh toán
  private static getPaymentMethodText(paymentMethod: string): string {
    const methods: Record<string, string> = {
      'cod': '💰 Cash on Delivery (COD)',
      'bank_transfer': '🏦 Bank Transfer',
      'momo': '📱 MoMo',
      'credit_card': '💳 Credit Card'
    };
    return methods[paymentMethod] || paymentMethod;
  }
  
  // Lấy hành động cần thực hiện
  private static getActionRequired(paymentMethod: string): string {
    switch (paymentMethod) {
      case 'cod':
        return '⚠️  ACTION REQUIRED: Please confirm this COD order to proceed with preparation and delivery.';
      case 'bank_transfer':
        return '⚠️  ACTION REQUIRED: Please verify bank transfer payment and confirm the order.';
      case 'momo':
      case 'credit_card':
        return '✅ Payment will be processed automatically. Order will be auto-confirmed upon successful payment.';
      default:
        return '⚠️  ACTION REQUIRED: Please review and confirm this order.';
    }
  }
  
  // Format tiền tệ
  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }
  
  // Gửi thông báo khi thanh toán được xác nhận
  static async notifyPaymentConfirmed(order: IOrder, paymentMethod: string) {
    try {
      console.log('✅ PAYMENT CONFIRMED NOTIFICATION:');
      console.log(`Order ${order.orderNumber} - ${paymentMethod} payment confirmed`);
      console.log(`Customer: ${order.customerName}`);
      console.log(`Amount: ${this.formatCurrency(order.totalAmount)}`);
      console.log('─'.repeat(50));
      
    } catch (error) {
      console.error('Failed to send payment confirmation notification:', error);
    }
  }
}
