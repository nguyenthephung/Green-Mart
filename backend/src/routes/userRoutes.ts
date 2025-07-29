import { Router } from 'express';
import UserController from '../controllers/UserController';

const router = Router();

// GET /api/users/:userId/vouchers - Get user's vouchers
import { Request, Response, NextFunction } from 'express';


// GET user's vouchers
router.get(
  '/:userId/vouchers',
  UserController.getUserVouchers as (req: Request, res: Response, next: NextFunction) => any
);

// PATCH /api/users/:userId/vouchers - Add a voucher to user's vouchers
router.patch(
  '/:userId/vouchers',
  UserController.addVoucherToUser as (req: Request, res: Response, next: NextFunction) => any
);

// Bạn có thể thêm các route user khác ở đây nếu cần

export default router;
