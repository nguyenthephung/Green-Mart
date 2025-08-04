import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Voucher from '../models/Voucher';

// Thêm voucher vào user
const addVoucherToUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { voucherId } = req.body;
    if (!voucherId) {
      return res.status(400).json({ message: 'voucherId is required' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Initialize vouchers as empty object if not exists
    if (!user.vouchers) {
      user.vouchers = {};
    }
    
    // Get current quantity for this voucher (default to 0)
    const currentQuantity = user.vouchers[voucherId] || 0;
    
    // Increase quantity by 1
    user.vouchers[voucherId] = currentQuantity + 1;
    
    // IMPORTANT: Mark vouchers field as modified for Mongoose Mixed type
    user.markModified('vouchers');
    
    console.log('addVoucherToUser:', {
      userId,
      voucherId,
      oldQuantity: currentQuantity,
      newQuantity: currentQuantity + 1,
      allVouchers: user.vouchers
    });
    
    await user.save();
    return res.json({ success: true, vouchers: user.vouchers });
  } catch (err) {
    next(err);
  }
};


// Lấy danh sách voucher của user
const getUserVouchers = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    console.log('getUserVouchers - userId:', userId);
    
    const user = await User.findById(userId);
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    console.log('getUserVouchers - user found:', !!user);
    console.log('getUserVouchers - user.vouchers:', user.vouchers);

    // Convert vouchers object to array format for frontend compatibility
    const userVouchersArray = [];
    if (user.vouchers && typeof user.vouchers === 'object') {
      for (const [voucherId, quantity] of Object.entries(user.vouchers)) {
        if (quantity && quantity > 0) {
          userVouchersArray.push({
            voucherId,
            quantity: Number(quantity)
          });
        }
      }
    }

    console.log('getUserVouchers - returning vouchers:', userVouchersArray);

    res.json({ vouchers: userVouchersArray });
  } catch (err) {
    console.error('getUserVouchers error:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
};

const createUser = (req: Request, res: Response) => {
  const { name } = req.body;
  res.status(201).json({ message: 'User created', user: { id: Date.now(), name } });
};

export default {
  createUser,
  getUserVouchers,
  addVoucherToUser,
};
