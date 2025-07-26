import express from 'express';
import CartController from '../controllers/CartController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Get cart for logged-in user
router.get('/', authenticate, CartController.getCart);
// Add item to cart
router.post('/add', authenticate, CartController.addToCart);
// Update item quantity
router.put('/update', authenticate, CartController.updateCartItem);
// Remove item from cart
router.delete('/remove', authenticate, CartController.removeFromCart);
// Clear cart
router.delete('/clear', authenticate, CartController.clearCart);

export default router;
