import { Router } from 'express';
import { CommentController } from '../controllers/CommentController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Public routes
router.get('/product/:productId', CommentController.getProductComments);

// Protected routes
router.use(authenticate); // Apply auth middleware to all routes below

router.post('/', CommentController.createComment);
router.put('/:id', CommentController.updateComment);
router.delete('/:id', CommentController.deleteComment);
router.get('/my-comments', CommentController.getUserComments);

export default router;
