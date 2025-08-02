import express from 'express';
import OrderController from '../controllers/OrderController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Public route for order tracking (no auth required)
router.get('/track/:orderId', OrderController.trackOrder.bind(OrderController));

// Create order without authentication (temporarily)
router.post('/', OrderController.createOrder.bind(OrderController));

// Apply authentication middleware to other order routes
router.use(authenticate);

// Get user's order history
router.get('/history', OrderController.getOrderHistory.bind(OrderController));

// Get order statistics (for dashboard)
router.get('/stats', OrderController.getOrderStats.bind(OrderController));

// Get all orders (admin only - would need role check)
router.get('/all', OrderController.getAllOrders.bind(OrderController));

// Get specific order details
router.get('/:orderId', OrderController.getOrder.bind(OrderController));

// Update order status
router.patch('/:orderId/status', OrderController.updateOrderStatus.bind(OrderController));

// Cancel order
router.post('/:orderId/cancel', OrderController.cancelOrder.bind(OrderController));

export default router;
