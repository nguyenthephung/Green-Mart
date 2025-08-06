import express from 'express';
import BannerController from '../controllers/BannerController';
import { authenticate, adminOnly } from '../middlewares/auth';

const router = express.Router();

// Public routes
router.get('/', BannerController.getAllBanners);
router.get('/:id', BannerController.getBannerById);
router.post('/:id/click', BannerController.incrementClickCount);

// Admin routes
router.post('/', authenticate, adminOnly, BannerController.createBanner);
router.put('/:id', authenticate, adminOnly, BannerController.updateBanner);
router.delete('/:id', authenticate, adminOnly, BannerController.deleteBanner);
router.patch('/:id/toggle', authenticate, adminOnly, BannerController.toggleBannerStatus);
router.get('/admin/stats', authenticate, adminOnly, BannerController.getBannerStats);

export default router;
