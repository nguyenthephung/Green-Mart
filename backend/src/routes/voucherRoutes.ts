import { Router } from 'express';
import express from 'express';
import { getAllVouchers, createVoucher, updateVoucher, deleteVoucher } from '../controllers/VoucherController';

const router = Router();

router.get('/', getAllVouchers);
router.post('/', createVoucher);
router.put('/:id', updateVoucher as express.RequestHandler);
router.delete('/:id', deleteVoucher as express.RequestHandler);

export default router;
