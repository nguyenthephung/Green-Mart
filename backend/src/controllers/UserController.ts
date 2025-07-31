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
    if (!user.vouchers) user.vouchers = [];
    if (!user.vouchers.map(String).includes(String(voucherId))) {
      user.vouchers.push(voucherId);
      await user.save();
    }
    return res.json({ success: true, vouchers: user.vouchers });
  } catch (err) {
    next(err);
  }
};


// Lấy danh sách voucher của user
const getUserVouchers = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).populate('vouchers');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Lọc các voucher còn tồn tại
    const allVoucherIds = (await Voucher.find({}, '_id')).map(v => String(v._id));
    const validVouchers = (user.vouchers || []).filter((v: any) => allVoucherIds.includes(String(v._id || v)));

    // Nếu có voucher không hợp lệ thì cập nhật lại user.vouchers
    if (validVouchers.length !== (user.vouchers || []).length) {
      user.vouchers = validVouchers.map((v: any) => v._id || v);
      await user.save();
    }

    res.json({ vouchers: validVouchers });
  } catch (err) {
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
