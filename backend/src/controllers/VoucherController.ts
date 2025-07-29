import { Request, Response } from 'express';
import Voucher from '../models/Voucher';

export const getAllVouchers = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    // Lấy tất cả voucher chưa hết hạn hoặc chưa có expired
    const vouchers = await Voucher.find();
    const validVouchers = vouchers.filter(v => {
      if (!v.expired) return true;
      // v.expired là string yyyy-mm-dd
      const exp = new Date(v.expired);
      return exp >= now;
    });
    res.json(validVouchers);
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
