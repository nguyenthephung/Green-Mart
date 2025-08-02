import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Voucher from '../models/Voucher';

export const getAllVouchers = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    
    // Kiểm tra kết nối MongoDB trước khi thực hiện query
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database not connected' });
    }
    
    // Tự động xóa voucher hết hạn khỏi database
    const expiredResult = await Voucher.deleteMany({
      expired: { $exists: true, $ne: null },
      $expr: {
        $lt: [
          { $dateFromString: { dateString: "$expired" } },
          now
        ]
      }
    });
    
    // Lấy tất cả voucher còn lại (đã tự động loại bỏ hết hạn)
    const vouchers = await Voucher.find();
    
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách voucher', error });
  }
};

export const createVoucher = async (req: Request, res: Response) => {
  try {
    const voucher = new Voucher(req.body);
    await voucher.save();
    res.status(201).json(voucher);
  } catch (error) {
    res.status(400).json({ message: 'Không thể tạo voucher', error });
  }
};

export const updateVoucher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const voucher = await Voucher.findByIdAndUpdate(id, req.body, { new: true });
    if (!voucher) return res.status(404).json({ message: 'Không tìm thấy voucher' });
    res.json(voucher);
  } catch (error) {
    res.status(400).json({ message: 'Không thể cập nhật voucher', error });
  }
};

export const deleteVoucher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const voucher = await Voucher.findByIdAndDelete(id);
    if (!voucher) return res.status(404).json({ message: 'Không tìm thấy voucher' });
    res.json({ message: 'Đã xóa voucher' });
  } catch (error) {
    res.status(400).json({ message: 'Không thể xóa voucher', error });
  }
};
