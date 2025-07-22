import { Router } from 'express';
import authRoutes from './auth';
import addressRoutes from './addressRoutes';
import wishlistRoutes from './wishlistRoutes';

const router = Router();

// Auth routes
router.use('/auth', authRoutes);

// Address routes
router.use('/', addressRoutes);

// Wishlist routes
router.use('/users', wishlistRoutes);

export default router;
