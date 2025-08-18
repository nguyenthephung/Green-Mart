import { Router } from 'express';
import express from 'express';
import { addTracking, getTrackingHistory, updateTracking, deleteTracking } from '../controllers/OrderTrackingController';

const router = Router();

router.post('/', addTracking);
router.get('/:orderId', getTrackingHistory);
router.put('/:id', updateTracking as express.RequestHandler);
router.delete('/:id', deleteTracking as express.RequestHandler);

export default router;
