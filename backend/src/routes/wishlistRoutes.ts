import { Router } from 'express';
import { WishlistController } from '../controllers/WishlistController';

const router = Router();

// GET /api/users/:userId/wishlist - Get user's wishlist
router.get('/:userId/wishlist', async (req, res) => {
  await WishlistController.getUserWishlist(req, res);
});

// POST /api/users/:userId/wishlist - Add product to wishlist
router.post('/:userId/wishlist', async (req, res) => {
  await WishlistController.addToWishlist(req, res);
});

// DELETE /api/users/:userId/wishlist/:productId - Remove product from wishlist
router.delete('/:userId/wishlist/:productId', async (req, res) => {
  await WishlistController.removeFromWishlist(req, res);
});

// DELETE /api/users/:userId/wishlist - Clear entire wishlist
router.delete('/:userId/wishlist', async (req, res) => {
  await WishlistController.clearWishlist(req, res);
});

// GET /api/users/:userId/wishlist/count - Get wishlist count
router.get('/:userId/wishlist/count', async (req, res) => {
  await WishlistController.getWishlistCount(req, res);
});

// GET /api/users/:userId/wishlist/check/:productId - Check if product is in wishlist
router.get('/:userId/wishlist/check/:productId', async (req, res) => {
  await WishlistController.checkInWishlist(req, res);
});

// PUT /api/users/:userId/wishlist/:productId - Update wishlist item
router.put('/:userId/wishlist/:productId', async (req, res) => {
  await WishlistController.updateWishlistItem(req, res);
});

export default router;
