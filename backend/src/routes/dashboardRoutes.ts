import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// All dashboard routes require admin authentication
router.use(authenticate, authorize(['admin']));

// Get dashboard stats
router.get('/stats', DashboardController.getDashboardStats);

// Get recent orders
router.get('/orders', DashboardController.getRecentOrders);

// Get top products
router.get('/products', DashboardController.getTopProducts);

// Get revenue chart data
router.get('/revenue', DashboardController.getRevenueChart);

export default router;
