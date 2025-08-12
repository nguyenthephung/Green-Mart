import express from 'express';
import { FlashSaleController } from '../controllers/FlashSaleController';
import { authenticate, authorize } from '../middlewares/auth';

const router = express.Router();

// Public routes
router.get('/active', FlashSaleController.getActiveFlashSales as express.RequestHandler);
router.get('/upcoming', FlashSaleController.getUpcomingFlashSales as express.RequestHandler);
router.get('/check-product/:productId', FlashSaleController.checkProductInFlashSale as express.RequestHandler);

// Admin routes
router.use(authenticate); // Require authentication for all routes below
router.use(authorize(['admin'])); // Require admin role

router.get('/', FlashSaleController.getAllFlashSales as express.RequestHandler);
router.post('/', FlashSaleController.createFlashSale as express.RequestHandler);
router.put('/:id', FlashSaleController.updateFlashSale as express.RequestHandler);
router.delete('/:id', FlashSaleController.deleteFlashSale as express.RequestHandler);
router.patch('/:id/toggle-status', FlashSaleController.toggleFlashSaleStatus as express.RequestHandler);

export default router;
