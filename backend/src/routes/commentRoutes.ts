import { Router } from 'express';
import express from 'express';
import { CommentController } from '../controllers/CommentController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Public routes
router.get('/product/:productId', CommentController.getProductComments as express.RequestHandler);

// Protected routes
router.use(authenticate); // Apply auth middleware to all routes below

router.post('/', CommentController.createComment as express.RequestHandler);
router.put('/:id', CommentController.updateComment as express.RequestHandler);
router.delete('/:id', CommentController.deleteComment as express.RequestHandler);
router.get('/my-comments', CommentController.getUserComments as express.RequestHandler);

export default router;
