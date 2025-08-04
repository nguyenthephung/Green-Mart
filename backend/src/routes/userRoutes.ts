import { Router } from 'express';
import UserController from '../controllers/UserController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// Public routes
// GET user's vouchers
router.get(
  '/:userId/vouchers',
  UserController.getUserVouchers as any
);

// PATCH add a voucher to user's vouchers
router.patch(
  '/:userId/vouchers',
  UserController.addVoucherToUser as any
);

// Admin routes - require authentication and admin role
router.use(authenticate);
router.use(authorize(['admin']));

// POST /api/users/admin - Create new user
router.post('/admin', UserController.createUser as any);

// GET /api/users/admin/stats - Get user statistics
router.get('/admin/stats', UserController.getUserStats as any);

// GET /api/users/admin/all - Get all users with filtering
router.get('/admin/all', UserController.getAllUsers as any);

// GET /api/users/admin/:userId - Get user by ID
router.get('/admin/:userId', UserController.getUserById as any);

// PUT /api/users/admin/:userId - Update user
router.put('/admin/:userId', UserController.updateUser as any);

// DELETE /api/users/admin/:userId - Delete user
router.delete('/admin/:userId', UserController.deleteUser as any);

// PATCH /api/users/admin/:userId/status - Update user status
router.patch('/admin/:userId/status', UserController.updateUserStatus as any);

// PATCH /api/users/admin/:userId/reset-password - Reset user password
router.patch('/admin/:userId/reset-password', UserController.resetUserPassword as any);

// Bạn có thể thêm các route user khác ở đây nếu cần

export default router;
