import { Request, Response } from 'express';
import Rating from '../models/Rating';
import Product from '../models/Product';
import mongoose from 'mongoose';
import { AuthRequest } from '../middlewares/auth';

export class RatingController {
  // Lấy ratings của một sản phẩm
  static async getProductRatings(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID'
        });
      }

      const ratings = await Rating.find({ productId })
        .populate('userId', 'name email')
        .sort(sort as string)
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      const total = await Rating.countDocuments({ productId });

      // Transform ratings to match frontend expectations
      const transformedRatings = ratings.map(rating => ({
        _id: rating._id,
        user: {
          _id: (rating.userId as any)?._id || rating.userId,
          name: (rating.userId as any)?.name || 'Anonymous User'
        },
        productId: rating.productId,
        rating: rating.rating,
        review: rating.review,
        images: rating.images,
        isVerifiedPurchase: rating.isVerifiedPurchase,
        helpfulVotes: rating.helpfulVotes,
        createdAt: (rating as any).createdAt,
        updatedAt: (rating as any).updatedAt
      }));

      res.json({
        success: true,
        data: {
          ratings: transformedRatings,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Error fetching ratings:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy đánh giá sản phẩm'
      });
    }
  }

  // Thêm rating mới
  static async createRating(req: AuthRequest, res: Response) {
    try {
      const { productId } = req.params;
      const { rating, review, images } = req.body;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Bạn cần đăng nhập để đánh giá'
        });
      }

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID'
        });
      }

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Đánh giá phải từ 1-5 sao'
        });
      }

      // Kiểm tra user đã rate chưa
      const existingRating = await Rating.findOne({ userId, productId });
      if (existingRating) {
        return res.status(400).json({
          success: false,
          message: 'Bạn đã đánh giá sản phẩm này rồi'
        });
      }

      // Tạo rating mới
      const newRating = new Rating({
        userId,
        productId,
        rating,
        review: review?.trim(),
        images: images || []
      });

      await newRating.save();

      // Cập nhật product rating
      await RatingController.updateProductRating(productId);

      // Populate user info cho response
      const populatedRating = await Rating.findById(newRating._id)
        .populate('userId', 'name email');

      // Transform rating to match frontend expectations
      const transformedRating = {
        _id: populatedRating?._id,
        user: {
          _id: (populatedRating?.userId as any)?._id || populatedRating?.userId,
          name: (populatedRating?.userId as any)?.name || 'Anonymous User'
        },
        productId: populatedRating?.productId,
        rating: populatedRating?.rating,
        review: populatedRating?.review,
        images: populatedRating?.images,
        isVerifiedPurchase: populatedRating?.isVerifiedPurchase,
        helpfulVotes: populatedRating?.helpfulVotes,
        createdAt: (populatedRating as any)?.createdAt,
        updatedAt: (populatedRating as any)?.updatedAt
      };

      res.status(201).json({
        success: true,
        message: 'Đánh giá đã được tạo thành công',
        data: transformedRating
      });
    } catch (error) {
      console.error('Error creating rating:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo đánh giá'
      });
    }
  }

  // Cập nhật rating
  static async updateRating(req: AuthRequest, res: Response) {
    try {
      const { ratingId } = req.params;
      const { rating, review, images } = req.body;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Bạn cần đăng nhập'
        });
      }

      const existingRating = await Rating.findOne({ 
        _id: ratingId, 
        userId 
      });

      if (!existingRating) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đánh giá hoặc bạn không có quyền chỉnh sửa'
        });
      }

      // Cập nhật rating
      existingRating.rating = rating;
      existingRating.review = review?.trim();
      existingRating.images = images || [];
      
      await existingRating.save();

      // Cập nhật product rating
      await RatingController.updateProductRating(existingRating.productId);

      const populatedRating = await Rating.findById(existingRating._id)
        .populate('userId', 'name email');

      // Transform rating to match frontend expectations
      const transformedRating = {
        _id: populatedRating?._id,
        user: {
          _id: (populatedRating?.userId as any)?._id || populatedRating?.userId,
          name: (populatedRating?.userId as any)?.name || 'Anonymous User'
        },
        productId: populatedRating?.productId,
        rating: populatedRating?.rating,
        review: populatedRating?.review,
        images: populatedRating?.images,
        isVerifiedPurchase: populatedRating?.isVerifiedPurchase,
        helpfulVotes: populatedRating?.helpfulVotes,
        createdAt: (populatedRating as any)?.createdAt,
        updatedAt: (populatedRating as any)?.updatedAt
      };

      res.json({
        success: true,
        message: 'Đánh giá đã được cập nhật',
        data: transformedRating
      });
    } catch (error) {
      console.error('Error updating rating:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật đánh giá'
      });
    }
  }

  // Xóa rating
  static async deleteRating(req: AuthRequest, res: Response) {
    try {
      const { ratingId } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Bạn cần đăng nhập'
        });
      }

      const rating = await Rating.findOne({ 
        _id: ratingId, 
        userId 
      });

      if (!rating) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đánh giá hoặc bạn không có quyền xóa'
        });
      }

      const productId = rating.productId;
      await Rating.findByIdAndDelete(ratingId);

      // Cập nhật product rating
      await RatingController.updateProductRating(productId);

      res.json({
        success: true,
        message: 'Đánh giá đã được xóa thành công'
      });
    } catch (error) {
      console.error('Error deleting rating:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xóa đánh giá'
      });
    }
  }

  // Helper function để cập nhật product rating
  static async updateProductRating(productId: string | mongoose.Types.ObjectId) {
    try {
      const ratings = await Rating.find({ productId });
      
      if (ratings.length === 0) {
        await Product.findByIdAndUpdate(productId, {
          averageRating: 0,
          totalRatings: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        });
        return;
      }

      // Tính average rating
      const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
      const averageRating = totalRating / ratings.length;

      // Tính distribution
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      ratings.forEach(rating => {
        distribution[rating.rating as keyof typeof distribution]++;
      });

      await Product.findByIdAndUpdate(productId, {
        averageRating: Math.round(averageRating * 10) / 10, // Làm tròn 1 chữ số thập phân
        totalRatings: ratings.length,
        ratingDistribution: distribution
      });
    } catch (error) {
      console.error('Error updating product rating:', error);
    }
  }

  // Vote helpful cho rating
  static async voteHelpful(req: Request, res: Response) {
    try {
      const { ratingId } = req.params;
      
      const rating = await Rating.findByIdAndUpdate(
        ratingId,
        { $inc: { helpfulVotes: 1 } },
        { new: true }
      );

      if (!rating) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đánh giá'
        });
      }

      res.json({
        success: true,
        data: rating
      });
    } catch (error) {
      console.error('Error voting helpful:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi vote đánh giá hữu ích'
      });
    }
  }
}
