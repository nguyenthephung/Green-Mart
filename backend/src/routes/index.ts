import { Router } from 'express';
import authRoutes from './auth';
import addressRoutes from './addressRoutes';
import wishlistRoutes from './wishlistRoutes';
import cartRoutes from './cartRoutes';
import productRoutes from './productRoutes';

const router = Router();

// Auth routes
router.use('/auth', authRoutes);

// Address routes
router.use('/', addressRoutes);

// Wishlist routes
router.use('/users', wishlistRoutes);

// Cart routes
router.use('/cart', cartRoutes);

// Product routes
router.use('/products', productRoutes);

export default router;
