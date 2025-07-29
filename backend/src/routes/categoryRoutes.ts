// src/routes/categoryRoutes.ts
import { Router } from 'express';
import express from 'express';
import {
  getCategories,
  createOrUpdateCategory,
  deleteCategory,
  toggleCategoryStatus
} from '../controllers/CategoryController';

const router = Router();

router.get('/categories', getCategories);
router.post('/categories', createOrUpdateCategory as express.RequestHandler);
router.put('/categories/:id', createOrUpdateCategory as express.RequestHandler);
router.delete('/categories/:id', deleteCategory as express.RequestHandler);
router.patch('/categories/:id/toggle-status', toggleCategoryStatus as express.RequestHandler);

export default router;
