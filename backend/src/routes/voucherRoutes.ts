import { Router } from 'express';
import express from 'express';
import { getAllVouchers, createVoucher, updateVoucher, deleteVoucher } from '../controllers/VoucherController';

const router = Router();

router.get('/', getAllVouchers as express.RequestHandler);
router.post('/', createVoucher as express.RequestHandler);
router.put('/:id', updateVoucher as express.RequestHandler);
router.delete('/:id', deleteVoucher as express.RequestHandler);

export default router;
