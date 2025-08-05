import { Router } from 'express';
import { RatingController } from '../controllers/RatingController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Public routes
router.get('/product/:productId', RatingController.getProductRatings);

// Protected routes
router.post('/product/:productId', authenticate, RatingController.createRating);
router.put('/:ratingId', authenticate, RatingController.updateRating);
router.delete('/:ratingId', authenticate, RatingController.deleteRating);
router.post('/:ratingId/helpful', RatingController.voteHelpful);

export default router;
