import { Request, Response } from 'express';
import Banner, { IBanner } from '../models/Banner';
import { AuthRequest } from '../middlewares/auth';
import ImageUploadService from '../services/imageUploadService';

export class BannerController {
  // Get all banners (public)
  static async getAllBanners(req: Request, res: Response): Promise<void> {
    try {
      const { position, isActive } = req.query;
      
      const filter: any = {};
      if (position) filter.position = position;
      if (isActive !== undefined) filter.isActive = isActive === 'true';
      
      // Only show active banners within date range for public
      if (!req.headers.authorization) {
        filter.isActive = true;
        filter.startDate = { $lte: new Date() };
        filter.$or = [
          { endDate: { $exists: false } },
          { endDate: { $gte: new Date() } }
        ];
      }

      const banners = await Banner.find(filter).sort({ priority: 1, createdAt: -1 });
      
      res.json({
        success: true,
        data: banners,
        count: banners.length
      });
    } catch (error) {
      console.error('Error fetching banners:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách banner',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get banner by ID (public)
  static async getBannerById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const banner = await Banner.findById(id);
      
      if (!banner) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy banner'
        });
        return;
      }

      res.json({
        success: true,
        data: banner
      });
    } catch (error) {
      console.error('Error fetching banner:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thông tin banner',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Create banner (admin only)
  static async createBanner(req: AuthRequest, res: Response): Promise<void> {
    try {
      const bannerData = req.body;
      
      // Validate required fields
      if (!bannerData.title || !bannerData.imageUrl || !bannerData.position) {
        res.status(400).json({
          success: false,
          message: 'Thiếu thông tin bắt buộc: title, imageUrl, position'
        });
        return;
      }

      // Set default startDate if not provided
      if (!bannerData.startDate) {
        bannerData.startDate = new Date();
      }

      const banner = new Banner(bannerData);
      await banner.save();

      res.status(201).json({
        success: true,
        message: 'Tạo banner thành công',
        data: banner
      });
    } catch (error) {
      console.error('Error creating banner:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo banner',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update banner (admin only)
  static async updateBanner(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Lấy banner hiện tại để kiểm tra ảnh cũ
      const existingBanner = await Banner.findById(id);
      if (!existingBanner) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy banner'
        });
        return;
      }

      // Nếu có ảnh mới và khác ảnh cũ, xóa ảnh cũ từ Cloudinary
      if (updateData.imageUrl && existingBanner.imageUrl && updateData.imageUrl !== existingBanner.imageUrl) {
        try {
          await ImageUploadService.deleteImage(existingBanner.imageUrl);
        } catch (deleteErr) {
          console.error('Lỗi xóa ảnh banner cũ:', deleteErr);
        }
      }

      const banner = await Banner.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: 'Cập nhật banner thành công',
        data: banner
      });
    } catch (error) {
      console.error('Error updating banner:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật banner',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Delete banner (admin only)
  static async deleteBanner(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const banner = await Banner.findById(id);
      if (!banner) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy banner'
        });
        return;
      }

      // Xóa ảnh từ Cloudinary trước khi xóa banner
      if (banner.imageUrl) {
        try {
          await ImageUploadService.deleteImage(banner.imageUrl);
        } catch (deleteErr) {
          console.error('Lỗi xóa ảnh banner:', deleteErr);
        }
      }

      await Banner.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Xóa banner thành công'
      });
    } catch (error) {
      console.error('Error deleting banner:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xóa banner',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Toggle banner active status (admin only)
  static async toggleBannerStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const banner = await Banner.findById(id);
      if (!banner) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy banner'
        });
        return;
      }

      banner.isActive = !banner.isActive;
      await banner.save();

      res.json({
        success: true,
        message: `${banner.isActive ? 'Kích hoạt' : 'Vô hiệu hóa'} banner thành công`,
        data: banner
      });
    } catch (error) {
      console.error('Error toggling banner status:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi thay đổi trạng thái banner',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Increment click count
  static async incrementClickCount(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const banner = await Banner.findByIdAndUpdate(
        id,
        { $inc: { clickCount: 1 } },
        { new: true }
      );

      if (!banner) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy banner'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Cập nhật lượt click thành công',
        data: { clickCount: banner.clickCount }
      });
    } catch (error) {
      console.error('Error incrementing click count:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật lượt click',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get banner statistics (admin only)
  static async getBannerStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await Banner.aggregate([
        {
          $group: {
            _id: '$position',
            count: { $sum: 1 },
            totalClicks: { $sum: '$clickCount' },
            activeCount: {
              $sum: {
                $cond: [{ $eq: ['$isActive', true] }, 1, 0]
              }
            }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      const totalStats = await Banner.aggregate([
        {
          $group: {
            _id: null,
            totalBanners: { $sum: 1 },
            totalClicks: { $sum: '$clickCount' },
            activeBanners: {
              $sum: {
                $cond: [{ $eq: ['$isActive', true] }, 1, 0]
              }
            }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          byPosition: stats,
          overall: totalStats[0] || {
            totalBanners: 0,
            totalClicks: 0,
            activeBanners: 0
          }
        }
      });
    } catch (error) {
      console.error('Error fetching banner stats:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thống kê banner',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default BannerController;
