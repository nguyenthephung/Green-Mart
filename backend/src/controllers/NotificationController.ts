import { Request, Response } from 'express';
import Notification from '../models/Notification';
import NotificationSettings from '../models/NotificationSettings';
import User from '../models/User';
import mongoose from 'mongoose';
import { AuthRequest } from '../middlewares/auth';

export class NotificationController {
  // Get notifications for current user
  static async getNotifications(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?._id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const type = req.query.type as string;
      const isRead = req.query.isRead as string;

      const filter: any = {
        $and: [
          {
            $or: [
              { userId: new mongoose.Types.ObjectId(userId) },
              { isGlobal: true, targetRole: { $in: ['user', 'all'] } }
            ]
          },
          {
            $or: [
              { expiresAt: null },
              { expiresAt: { $gt: new Date() } }
            ]
          }
        ]
      };

      if (type) filter.type = type;
      if (isRead !== undefined) filter.isRead = isRead === 'true';

      const notifications = await Notification.find(filter)
        .populate('createdBy', 'name email')
        .sort({ priority: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Notification.countDocuments(filter);
      const unreadCount = await Notification.countDocuments({
        ...filter,
        isRead: false
      });

      res.json({
        success: true,
        data: {
          notifications,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          },
          unreadCount
        }
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách thông báo'
      });
    }
  }

  // Get unread notifications count only
  static async getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ 
          success: false,
          message: 'User not authenticated',
          count: 0 
        });
        return;
      }

      
      const count = await Notification.countDocuments({
        $and: [
          {
            $or: [
              { userId: new mongoose.Types.ObjectId(userId) },
              { isGlobal: true, targetRole: { $in: ['user', 'all'] } }
            ]
          },
          {
            $or: [
              { expiresAt: null },
              { expiresAt: { $gt: new Date() } }
            ]
          },
          { isRead: false }
        ]
      });

      
      res.json({ 
        success: true,
        count: count
      });
    } catch (error) {
      console.error('Error getting unread count:', error);
      res.status(500).json({ 
        success: false,
        message: 'Không thể lấy số thông báo chưa đọc',
        count: 0
      });
    }
  }

  // Mark notification as read
  static async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?._id;

      const notification = await Notification.findOne({
        _id: id,
        $or: [
          { userId: new mongoose.Types.ObjectId(userId) },
          { isGlobal: true }
        ]
      });

      if (!notification) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông báo'
        });
        return;
      }

      notification.isRead = true;
      await notification.save();

      res.json({
        success: true,
        message: 'Đã đánh dấu thông báo là đã đọc'
      });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi đánh dấu thông báo'
      });
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?._id;

      await Notification.updateMany(
        {
          $or: [
            { userId: new mongoose.Types.ObjectId(userId) },
            { isGlobal: true, targetRole: { $in: ['user', 'all'] } }
          ],
          isRead: false
        },
        { isRead: true }
      );

      res.json({
        success: true,
        message: 'Đã đánh dấu tất cả thông báo là đã đọc'
      });
    } catch (error) {
      console.error('Mark all as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi đánh dấu tất cả thông báo'
      });
    }
  }

  // Delete notification
  static async deleteNotification(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?._id;

      const notification = await Notification.findOne({
        _id: id,
        userId: new mongoose.Types.ObjectId(userId) // Only personal notifications can be deleted
      });

      if (!notification) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông báo hoặc không có quyền xóa'
        });
        return;
      }

      await notification.deleteOne();

      res.json({
        success: true,
        message: 'Đã xóa thông báo'
      });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xóa thông báo'
      });
    }
  }

  // Get notification settings
  static async getSettings(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?._id;

      let settings = await NotificationSettings.findOne({ userId });
      
      if (!settings) {
        // Create default settings
        settings = new NotificationSettings({
          userId,
          settings: {
            order: true,
            promotion: true,
            system: true,
            review: true,
            shipping: true,
            admin: true,
            voucher: true,
            payment: true,
            account: true
          },
          pushNotifications: true,
          emailNotifications: false,
          smsNotifications: false
        });
        await settings.save();
      }

      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Get settings error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy cài đặt thông báo'
      });
    }
  }

  // Update notification settings
  static async updateSettings(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?._id;
      const { settings, pushNotifications, emailNotifications, smsNotifications } = req.body;

      let notificationSettings = await NotificationSettings.findOne({ userId });
      
      if (!notificationSettings) {
        notificationSettings = new NotificationSettings({ userId });
      }

      if (settings) notificationSettings.settings = { ...notificationSettings.settings, ...settings };
      if (pushNotifications !== undefined) notificationSettings.pushNotifications = pushNotifications;
      if (emailNotifications !== undefined) notificationSettings.emailNotifications = emailNotifications;
      if (smsNotifications !== undefined) notificationSettings.smsNotifications = smsNotifications;

      await notificationSettings.save();

      res.json({
        success: true,
        message: 'Đã cập nhật cài đặt thông báo',
        data: notificationSettings
      });
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật cài đặt thông báo'
      });
    }
  }

  // Admin: Create notification
  static async createNotification(req: AuthRequest, res: Response) {
    try {
      const { 
        type, 
        title, 
        description, 
        userId, 
        isGlobal, 
        targetRole, 
        priority, 
        actionUrl, 
        actionText,
        expiresAt,
        image,
        metadata 
      } = req.body;

      const createdBy = req.user?._id;

      const notification = new Notification({
        type,
        title,
        description,
        userId: userId ? new mongoose.Types.ObjectId(userId) : null,
        isGlobal: isGlobal || false,
        targetRole: targetRole || 'user',
        priority: priority || 'medium',
        actionUrl,
        actionText,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        image,
        metadata: metadata || {},
        createdBy: new mongoose.Types.ObjectId(createdBy)
      });

      await notification.save();

      res.status(201).json({
        success: true,
        message: 'Đã tạo thông báo thành công',
        data: notification
      });
    } catch (error) {
      console.error('Create notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo thông báo'
      });
    }
  }

  // Admin: Get all notifications
  static async getAllNotifications(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const type = req.query.type as string;
      const isGlobal = req.query.isGlobal as string;
      const targetRole = req.query.targetRole as string;

      const filter: any = {};
      if (type) filter.type = type;
      if (isGlobal !== undefined) filter.isGlobal = isGlobal === 'true';
      if (targetRole) filter.targetRole = targetRole;

      const notifications = await Notification.find(filter)
        .populate('userId', 'name email')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Notification.countDocuments(filter);

      res.json({
        success: true,
        data: {
          notifications,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get all notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách thông báo'
      });
    }
  }

  // Admin: Delete notification
  static async adminDeleteNotification(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const notification = await Notification.findByIdAndDelete(id);

      if (!notification) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông báo'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Đã xóa thông báo'
      });
    } catch (error) {
      console.error('Admin delete notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xóa thông báo'
      });
    }
  }

  // Get notification statistics
  static async getStatistics(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?._id;
      const isAdmin = req.user?.role === 'admin';

      if (isAdmin) {
        // Admin statistics
        const totalNotifications = await Notification.countDocuments();
        const globalNotifications = await Notification.countDocuments({ isGlobal: true });
        const personalNotifications = await Notification.countDocuments({ isGlobal: false });
        const unreadGlobal = await Notification.countDocuments({ isGlobal: true, isRead: false });
        
        const typeStats = await Notification.aggregate([
          { $group: { _id: '$type', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]);

        res.json({
          success: true,
          data: {
            totalNotifications,
            globalNotifications,
            personalNotifications,
            unreadGlobal,
            typeStats
          }
        });
      } else {
        // User statistics
        const filter = {
          $or: [
            { userId: new mongoose.Types.ObjectId(userId) },
            { isGlobal: true, targetRole: { $in: ['user', 'all'] } }
          ]
        };

        const totalNotifications = await Notification.countDocuments(filter);
        const unreadNotifications = await Notification.countDocuments({ ...filter, isRead: false });
        const readNotifications = totalNotifications - unreadNotifications;

        const typeStats = await Notification.aggregate([
          { $match: filter },
          { $group: { _id: '$type', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]);

        res.json({
          success: true,
          data: {
            totalNotifications,
            unreadNotifications,
            readNotifications,
            typeStats
          }
        });
      }
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thống kê thông báo'
      });
    }
  }
}
