import { Router } from 'express';
import authRoutes from './auth';
import addressRoutes from './addressRoutes';
import wishlistRoutes from './wishlistRoutes';
import cartRoutes from './cartRoutes';
import productRoutes from './productRoutes';
import categoryRoutes from './categoryRoutes';
import voucherRoutes from './voucherRoutes';
import userRoutes from './userRoutes';
import paymentRoutes from './paymentRoutes';
import orderRoutes from './orderRoutes';
import notificationRoutes from './notificationRoutes';
import commentRoutes from './commentRoutes';
import dashboardRoutes from './dashboardRoutes';

const router = Router();

// Auth routes
router.use('/auth', authRoutes);

// Address routes
router.use('/', addressRoutes);

// Wishlist routes (public - no auth required)
router.use('/users', wishlistRoutes);

// User routes (vouchers, admin functions...)
router.use('/users', userRoutes);

// Cart routes
router.use('/cart', cartRoutes);

// Product routes
router.use('/products', productRoutes);

// Voucher routes
router.use('/vouchers', voucherRoutes);

// Payment routes
router.use('/payments', paymentRoutes);

// Order routes
router.use('/orders', orderRoutes);

// Notification routes
router.use('/notifications', notificationRoutes);

// Comment routes
router.use('/comments', commentRoutes);

// Dashboard routes (admin only)
router.use('/dashboard', dashboardRoutes);

// Category routes
router.use(categoryRoutes);

export default router;
