import express from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { authenticate, authorize } from '../middlewares/auth';

const router = express.Router();

// User routes
router.get('/', authenticate, NotificationController.getNotifications);
router.get('/unread-count', authenticate, NotificationController.getUnreadCount);
router.put('/:id/read', authenticate, NotificationController.markAsRead);
router.put('/read-all', authenticate, NotificationController.markAllAsRead);
router.delete('/:id', authenticate, NotificationController.deleteNotification);
router.get('/settings', authenticate, NotificationController.getSettings);
router.put('/settings', authenticate, NotificationController.updateSettings);
router.get('/statistics', authenticate, NotificationController.getStatistics);

// Admin routes
router.post('/admin/create', authenticate, authorize(['admin']), NotificationController.createNotification);
router.get('/admin/all', authenticate, authorize(['admin']), NotificationController.getAllNotifications);
router.delete('/admin/:id', authenticate, authorize(['admin']), NotificationController.adminDeleteNotification);

export default router;
