import { Router } from 'express';
import { AddressController } from '../controllers/AddressController';
// Import model để ensure schema được register
import '../models/Address';

const router = Router();

// GET /api/users/:userId/addresses - Lấy tất cả địa chỉ của user
router.get('/users/:userId/addresses', AddressController.getUserAddresses);

// POST /api/users/:userId/addresses - Tạo địa chỉ mới
router.post('/users/:userId/addresses', AddressController.createAddress);

// PUT /api/users/:userId/addresses/:addressId - Cập nhật địa chỉ
router.put('/users/:userId/addresses/:addressId', AddressController.updateAddress);

// DELETE /api/users/:userId/addresses/:addressId - Xóa địa chỉ
router.delete('/users/:userId/addresses/:addressId', AddressController.deleteAddress);

// PATCH /api/users/:userId/addresses/:addressId/default - Đặt làm địa chỉ mặc định
router.patch('/users/:userId/addresses/:addressId/default', AddressController.setDefaultAddress);

export default router;
