import express from 'express';
import CartController from '../controllers/CartController';
import { authenticate, optionalAuthenticate } from '../middlewares/auth';

const router = express.Router();

// Get cart - allow both authenticated and unauthenticated users
router.get('/', optionalAuthenticate, CartController.getCart);
// Add item to cart - allow both authenticated and unauthenticated users  
router.post('/add', optionalAuthenticate, CartController.addToCart);
// Update item quantity - allow both authenticated and unauthenticated users
router.put('/update', optionalAuthenticate, CartController.updateCartItem);
// Remove item from cart - allow both authenticated and unauthenticated users
router.delete('/remove', optionalAuthenticate, CartController.removeFromCart);
// Clear cart - allow both authenticated and unauthenticated users
router.delete('/clear', optionalAuthenticate, CartController.clearCart);

export default router;
