// src/routes/categoryRoutes.ts
import { Router } from 'express';
import {
  getCategories,
  addCategory,
  editCategory,
  deleteCategory,
  toggleCategoryStatus
} from '../controllers/CategoryController';

const router = Router();

router.get('/categories', getCategories);
router.post('/categories', addCategory);
router.put('/categories/:id', editCategory);
router.delete('/categories/:id', deleteCategory);
router.patch('/categories/:id/toggle-status', toggleCategoryStatus);

export default router;
