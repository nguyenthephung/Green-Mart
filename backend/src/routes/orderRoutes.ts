import express from 'express';
import OrderController from '../controllers/OrderController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Public route for order tracking (no auth required)
router.get('/track/:orderId', OrderController.trackOrder.bind(OrderController));


// Create order (requires authentication)
router.post('/', authenticate, OrderController.createOrder.bind(OrderController));

// Get user's order history
router.get('/history', authenticate, OrderController.getOrderHistory.bind(OrderController));

// Get order statistics (for dashboard)
router.get('/stats', authenticate, OrderController.getOrderStats.bind(OrderController));

// Get orders pending admin confirmation
router.get('/pending', authenticate, OrderController.getPendingOrders.bind(OrderController));

// Get all orders (public, no authentication)
router.get('/all', OrderController.getAllOrders.bind(OrderController));

// Get specific order details
router.get('/:orderId', authenticate, OrderController.getOrder.bind(OrderController));

// Update order status
router.patch('/:orderId/status', authenticate, OrderController.updateOrderStatus.bind(OrderController));

// Cancel order
router.post('/:orderId/cancel', authenticate, OrderController.cancelOrder.bind(OrderController));

export default router;
