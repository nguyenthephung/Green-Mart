import { Request, Response } from 'express';
import { Wishlist, IWishlist } from '../models/Wishlist';
import { Types } from 'mongoose';

export class WishlistController {
  // Lấy danh sách wishlist của user
  static async getUserWishlist(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      // Handle both mock user IDs and real ObjectIds
      let validUserId: Types.ObjectId;
      if (!Types.ObjectId.isValid(userId)) {
        const paddedUserId = userId.padStart(24, '0');
        validUserId = new Types.ObjectId(paddedUserId);
      } else {
        validUserId = new Types.ObjectId(userId);
      }

      const wishlistItems = await Wishlist.find({ userId: validUserId }).sort({ createdAt: -1 });
      
      res.json({
        success: true,
        data: wishlistItems
      });
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Thêm sản phẩm vào wishlist
  static async addToWishlist(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const {
        productId,
        productName,
        productImage,
        productPrice,
        originalPrice,
        discount,
        inStock,
        category
      } = req.body;

      // Handle both mock user IDs and real ObjectIds
      let validUserId: Types.ObjectId;
      if (!Types.ObjectId.isValid(userId)) {
        // For development with mock data, create a deterministic ObjectId from the user ID
        const paddedUserId = userId.padStart(24, '0');
        validUserId = new Types.ObjectId(paddedUserId);
      } else {
        validUserId = new Types.ObjectId(userId);
      }

      if (!productId || !productName || !productImage || productPrice === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      // Kiểm tra xem sản phẩm đã có trong wishlist chưa
      const existingItem = await Wishlist.findOne({
        userId: validUserId,
        productId
      });

      if (existingItem) {
        return res.status(409).json({
          success: false,
          error: 'Product already in wishlist'
        });
      }

      // Tạo wishlist item mới
      const wishlistItem = new Wishlist({
        userId: validUserId,
        productId,
        productName,
        productImage,
        productPrice,
        originalPrice,
        discount,
        inStock: inStock !== false,
        category
      });

      await wishlistItem.save();

      res.status(201).json({
        success: true,
        data: wishlistItem,
        message: 'Product added to wishlist successfully'
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      
      if ((error as any).code === 11000) {
        return res.status(409).json({
          success: false,
          error: 'Product already in wishlist'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Xóa sản phẩm khỏi wishlist
  static async removeFromWishlist(req: Request, res: Response) {
    try {
      const { userId, productId } = req.params;

      // Handle both mock user IDs and real ObjectIds
      let validUserId: Types.ObjectId;
      if (!Types.ObjectId.isValid(userId)) {
        const paddedUserId = userId.padStart(24, '0');
        validUserId = new Types.ObjectId(paddedUserId);
      } else {
        validUserId = new Types.ObjectId(userId);
      }

      const result = await Wishlist.deleteOne({
        userId: validUserId,
        productId
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          error: 'Product not found in wishlist'
        });
      }

      res.json({
        success: true,
        message: 'Product removed from wishlist successfully'
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Xóa toàn bộ wishlist
  static async clearWishlist(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      // Handle both mock user IDs and real ObjectIds
      let validUserId: Types.ObjectId;
      if (!Types.ObjectId.isValid(userId)) {
        const paddedUserId = userId.padStart(24, '0');
        validUserId = new Types.ObjectId(paddedUserId);
      } else {
        validUserId = new Types.ObjectId(userId);
      }

      await Wishlist.deleteMany({ userId: validUserId });

      res.json({
        success: true,
        message: 'Wishlist cleared successfully'
      });
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Kiểm tra sản phẩm có trong wishlist không
  static async checkInWishlist(req: Request, res: Response) {
    try {
      const { userId, productId } = req.params;

      // Handle both mock user IDs and real ObjectIds
      let validUserId: Types.ObjectId;
      if (!Types.ObjectId.isValid(userId)) {
        const paddedUserId = userId.padStart(24, '0');
        validUserId = new Types.ObjectId(paddedUserId);
      } else {
        validUserId = new Types.ObjectId(userId);
      }

      const existingItem = await Wishlist.findOne({
        userId: validUserId,
        productId
      });

      res.json({
        success: true,
        data: { inWishlist: !!existingItem }
      });
    } catch (error) {
      console.error('Error checking wishlist:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Lấy số lượng items trong wishlist
  static async getWishlistCount(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      // Handle both mock user IDs and real ObjectIds
      let validUserId: Types.ObjectId;
      if (!Types.ObjectId.isValid(userId)) {
        const paddedUserId = userId.padStart(24, '0');
        validUserId = new Types.ObjectId(paddedUserId);
      } else {
        validUserId = new Types.ObjectId(userId);
      }

      const count = await Wishlist.countDocuments({ userId: validUserId });

      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      console.error('Error getting wishlist count:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Cập nhật thông tin sản phẩm trong wishlist
  static async updateWishlistItem(req: Request, res: Response) {
    try {
      const { userId, productId } = req.params;
      const updateData = req.body;

      // Handle both mock user IDs and real ObjectIds
      let validUserId: Types.ObjectId;
      if (!Types.ObjectId.isValid(userId)) {
        const paddedUserId = userId.padStart(24, '0');
        validUserId = new Types.ObjectId(paddedUserId);
      } else {
        validUserId = new Types.ObjectId(userId);
      }

      const wishlistItem = await Wishlist.findOne({
        userId: validUserId,
        productId
      });

      if (!wishlistItem) {
        return res.status(404).json({
          success: false,
          error: 'Product not found in wishlist'
        });
      }

      await Wishlist.findByIdAndUpdate(wishlistItem._id, updateData);

      res.json({
        success: true,
        data: wishlistItem,
        message: 'Wishlist item updated successfully'
      });
    } catch (error) {
      console.error('Error updating wishlist item:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}
