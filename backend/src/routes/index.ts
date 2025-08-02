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

const router = Router();

// Auth routes
router.use('/auth', authRoutes);

// Address routes
router.use('/', addressRoutes);

// User routes (vouchers, wishlist, ...)
router.use('/users', userRoutes);
// Wishlist routes (if you want to keep separate, can be merged into userRoutes)
// router.use('/users', wishlistRoutes);

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

// Category routes
router.use(categoryRoutes);

export default router;
