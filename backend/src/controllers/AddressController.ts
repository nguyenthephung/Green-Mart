import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { AddressModel, CreateAddressRequest, UpdateAddressRequest, AddressResponse } from '../models/Address';

export class AddressController {
  // Lấy tất cả địa chỉ của user
  static async getUserAddresses(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json({
          success: false,
          message: 'ID người dùng không hợp lệ'
        });
        return;
      }

      const addresses = await AddressModel.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({ createdAt: -1 });
      
      const response: AddressResponse[] = addresses.map(addr => ({
        id: (addr._id as any).toString(),
        userId: (addr.userId as any).toString(),
        fullName: addr.fullName,
        phone: addr.phone,
        district: addr.district,
        ward: addr.ward,
        street: addr.street,
        latitude: addr.latitude,
        longitude: addr.longitude,
        isSelected: addr.isDefaultSelected,
        label: `${addr.street}, ${addr.ward}, ${addr.district}`,
        address: `${addr.street}, ${addr.ward}, ${addr.district}`,
        wardName: addr.ward,
        districtName: addr.district,
        createdAt: addr.createdAt.toISOString(),
        updatedAt: addr.updatedAt.toISOString(),
      }));

      res.status(200).json({
        success: true,
        data: response,
        message: 'Lấy danh sách địa chỉ thành công'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy danh sách địa chỉ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Tạo địa chỉ mới
  static async createAddress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const addressData: CreateAddressRequest = req.body;

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json({
          success: false,
          message: 'ID người dùng không hợp lệ'
        });
        return;
      }

      // Validation
      if (!addressData.fullName || !addressData.phone || !addressData.district || 
          !addressData.ward || !addressData.street) {
        res.status(400).json({
          success: false,
          message: 'Thiếu thông tin bắt buộc: fullName, phone, district, ward, street'
        });
        return;
      }

      // Nếu đây là địa chỉ mặc định, bỏ chọn các địa chỉ khác
      if (addressData.isSelected) {
        await AddressModel.updateMany(
          { userId: new mongoose.Types.ObjectId(userId) }, 
          { isDefaultSelected: false }
        );
      }

      // Tạo địa chỉ mới
      const newAddress = new AddressModel({
        userId: new mongoose.Types.ObjectId(userId),
        ...addressData,
        isDefaultSelected: addressData.isSelected || false,
      });

      try {
        const savedAddress = await newAddress.save();

        const response: AddressResponse = {
          id: (savedAddress._id as any).toString(),
          userId: (savedAddress.userId as any).toString(),
          fullName: savedAddress.fullName,
          phone: savedAddress.phone,
          district: savedAddress.district,
          ward: savedAddress.ward,
          street: savedAddress.street,
          latitude: savedAddress.latitude,
          longitude: savedAddress.longitude,
          isSelected: savedAddress.isDefaultSelected,
          label: `${savedAddress.street}, ${savedAddress.ward}, ${savedAddress.district}`,
          address: `${savedAddress.street}, ${savedAddress.ward}, ${savedAddress.district}`,
          wardName: savedAddress.ward,
          districtName: savedAddress.district,
          createdAt: savedAddress.createdAt.toISOString(),
          updatedAt: savedAddress.updatedAt.toISOString(),
        };

        res.status(201).json({
          success: true,
          data: response,
          message: 'Tạo địa chỉ mới thành công'
        });
      } catch (err) {
        throw err;
      }
    } catch (error) {
      console.log('Error in createAddress:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi tạo địa chỉ mới',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Cập nhật địa chỉ
  static async updateAddress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const addressId = req.params.addressId;
      const updateData: UpdateAddressRequest = req.body;

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(addressId)) {
        res.status(400).json({
          success: false,
          message: 'ID địa chỉ không hợp lệ'
        });
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json({
          success: false,
          message: 'ID người dùng không hợp lệ'
        });
        return;
      }

      const address = await AddressModel.findOne({ 
        _id: new mongoose.Types.ObjectId(addressId), 
        userId: new mongoose.Types.ObjectId(userId) 
      });

      if (!address) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy địa chỉ'
        });
        return;
      }

      // Nếu đây là địa chỉ mặc định, bỏ chọn các địa chỉ khác
      if (updateData.isSelected) {
        await AddressModel.updateMany(
          { userId: new mongoose.Types.ObjectId(userId), _id: { $ne: new mongoose.Types.ObjectId(addressId) } }, 
          { isDefaultSelected: false }
        );
      }

      const updatedAddress = await AddressModel.findByIdAndUpdate(
        new mongoose.Types.ObjectId(addressId),
        { ...updateData, isDefaultSelected: updateData.isSelected },
        { new: true }
      );

      if (!updatedAddress) {
        res.status(404).json({
          success: false,
          message: 'Không thể cập nhật địa chỉ'
        });
        return;
      }

      const response: AddressResponse = {
        id: (updatedAddress._id as any).toString(),
        userId: (updatedAddress.userId as any).toString(),
        fullName: updatedAddress.fullName,
        phone: updatedAddress.phone,
        district: updatedAddress.district,
        ward: updatedAddress.ward,
        street: updatedAddress.street,
        latitude: updatedAddress.latitude,
        longitude: updatedAddress.longitude,
        isSelected: updatedAddress.isDefaultSelected,
        label: `${updatedAddress.street}, ${updatedAddress.ward}, ${updatedAddress.district}`,
        address: `${updatedAddress.street}, ${updatedAddress.ward}, ${updatedAddress.district}`,
        wardName: updatedAddress.ward,
        districtName: updatedAddress.district,
        createdAt: updatedAddress.createdAt.toISOString(),
        updatedAt: updatedAddress.updatedAt.toISOString(),
      };

      res.status(200).json({
        success: true,
        data: response,
        message: 'Cập nhật địa chỉ thành công'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi cập nhật địa chỉ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Xóa địa chỉ
  static async deleteAddress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const addressId = req.params.addressId;

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(addressId)) {
        res.status(400).json({
          success: false,
          message: 'ID địa chỉ không hợp lệ'
        });
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json({
          success: false,
          message: 'ID người dùng không hợp lệ'
        });
        return;
      }

      const address = await AddressModel.findOne({ 
        _id: new mongoose.Types.ObjectId(addressId), 
        userId: new mongoose.Types.ObjectId(userId) 
      });

      if (!address) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy địa chỉ'
        });
        return;
      }

      const wasSelected = address.isDefaultSelected;
      await AddressModel.findByIdAndDelete(new mongoose.Types.ObjectId(addressId));

      // Nếu xóa địa chỉ mặc định, chọn địa chỉ đầu tiên làm mặc định
      if (wasSelected) {
        const firstAddress = await AddressModel.findOne({ userId: new mongoose.Types.ObjectId(userId) });
        if (firstAddress) {
          await AddressModel.findByIdAndUpdate(firstAddress._id, { isDefaultSelected: true });
        }
      }

      res.status(200).json({
        success: true,
        message: 'Xóa địa chỉ thành công'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi xóa địa chỉ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Đặt làm địa chỉ mặc định
  static async setDefaultAddress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const addressId = req.params.addressId;

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(addressId)) {
        res.status(400).json({
          success: false,
          message: 'ID địa chỉ không hợp lệ'
        });
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json({
          success: false,
          message: 'ID người dùng không hợp lệ'
        });
        return;
      }

      const address = await AddressModel.findOne({ 
        _id: new mongoose.Types.ObjectId(addressId), 
        userId: new mongoose.Types.ObjectId(userId) 
      });

      if (!address) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy địa chỉ'
        });
        return;
      }

      // Bỏ chọn tất cả địa chỉ khác của user
      await AddressModel.updateMany(
        { userId: new mongoose.Types.ObjectId(userId) }, 
        { isDefaultSelected: false }
      );

      // Chọn địa chỉ hiện tại
      await AddressModel.findByIdAndUpdate(
        new mongoose.Types.ObjectId(addressId), 
        { isDefaultSelected: true }
      );

      res.status(200).json({
        success: true,
        message: 'Đặt địa chỉ mặc định thành công'
      });
    } catch (error) {
      console.error('Set default address error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi đặt địa chỉ mặc định',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
