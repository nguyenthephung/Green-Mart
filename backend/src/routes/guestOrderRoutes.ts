import { Router } from 'express';
import express from 'express';
import { createGuestOrder, getGuestOrderStatus } from '../controllers/GuestOrderController';

const router = Router();

// POST /api/orders/guest - Create guest order
router.post('/guest', createGuestOrder as express.RequestHandler);

// GET /api/orders/guest/:orderNumber/status - Get guest order status
router.get('/guest/:orderNumber/status', getGuestOrderStatus as express.RequestHandler);

export default router;
