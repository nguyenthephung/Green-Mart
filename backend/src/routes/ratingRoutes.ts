import { Router } from 'express';
import express from 'express';
import { RatingController } from '../controllers/RatingController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Public routes
router.get('/product/:productId', RatingController.getProductRatings as express.RequestHandler);

// Protected routes
router.post('/product/:productId', authenticate, RatingController.createRating as express.RequestHandler);
router.put('/:ratingId', authenticate, RatingController.updateRating as express.RequestHandler);
router.delete('/:ratingId', authenticate, RatingController.deleteRating as express.RequestHandler);
router.post('/:ratingId/helpful', RatingController.voteHelpful as express.RequestHandler);

export default router;
