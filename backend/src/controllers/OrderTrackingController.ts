export const updateTracking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { lat, lng, address, status } = req.body;
    const tracking = await OrderTracking.findByIdAndUpdate(
      id,
      {
        location: { lat, lng, address },
        status,
        updatedAt: new Date(),
      },
      { new: true }
    );
    if (!tracking) return res.status(404).json({ error: 'Không tìm thấy tracking' });
    res.json(tracking);
  } catch (err) {
    res.status(500).json({ error: 'Không thể cập nhật tracking' });
  }
};

export const deleteTracking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tracking = await OrderTracking.findByIdAndDelete(id);
    if (!tracking) return res.status(404).json({ error: 'Không tìm thấy tracking' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Không thể xóa tracking' });
  }
};
import OrderTracking from '../models/OrderTracking';
import { Request, Response } from 'express';

export const addTracking = async (req: Request, res: Response) => {
  try {
    const { orderId, lat, lng, address, status } = req.body;
    const tracking = await OrderTracking.create({
      orderId,
      location: { lat, lng, address },
      status,
      updatedAt: new Date(),
    });
    res.status(201).json(tracking);
  } catch (err) {
    res.status(500).json({ error: 'Không thể cập nhật vị trí đơn hàng' });
  }
};

export const getTrackingHistory = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const history = await OrderTracking.find({ orderId }).sort({ updatedAt: 1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Không thể lấy lịch sử vị trí đơn hàng' });
  }
};
