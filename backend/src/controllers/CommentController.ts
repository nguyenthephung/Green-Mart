import { Request, Response } from 'express';
import Comment from '../models/Comment';
import Product from '../models/Product';
import mongoose from 'mongoose';
import { AuthRequest } from '../middlewares/auth';

export class CommentController {
  // Get comments for a product
  static async getProductComments(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID'
        });
      }

      const comments = await Comment.find({ productId })
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      // Transform comments to match frontend expectations
      const transformedComments = comments.map(comment => ({
        _id: comment._id,
        productId: comment.productId,
        user: {
          _id: (comment.userId as any)?._id || comment.userId,
          fullName: (comment.userId as any)?.name || comment.userName,
          role: (comment.userId as any)?.role
        },
        content: comment.content,
        rating: comment.rating,
        createdAt: (comment as any).createdAt,
        updatedAt: (comment as any).updatedAt
      }));

      const total = await Comment.countDocuments({ productId });
      const averageRating = await Comment.aggregate([
        { $match: { productId: new mongoose.Types.ObjectId(productId), rating: { $exists: true } } },
        { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
      ]);

      res.json({
        success: true,
        data: {
          comments: transformedComments,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          },
          rating: averageRating.length > 0 ? {
            average: Math.round(averageRating[0].avgRating * 10) / 10,
            count: averageRating[0].count
          } : { average: 0, count: 0 }
        }
      });
    } catch (error) {
      console.error('Get product comments error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy bình luận sản phẩm'
      });
    }
  }

  // Create a new comment
  static async createComment(req: AuthRequest, res: Response) {
    try {
      const { productId, content, rating } = req.body;
      const userId = req.user?._id;
      const userName = req.user?.name || req.user?.email || 'Người dùng';

      if (!productId || !content) {
        return res.status(400).json({
          success: false,
          message: 'Product ID và nội dung bình luận là bắt buộc'
        });
      }

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID'
        });
      }

      // Check if product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy sản phẩm'
        });
      }

      // Allow users to have multiple comments per product (remove restriction)
      // const existingComment = await Comment.findOne({ productId, userId });
      // if (existingComment) {
      //   return res.status(400).json({
      //     success: false,
      //     message: 'Bạn đã bình luận về sản phẩm này rồi'
      //   });
      // }

      const comment = new Comment({
        productId,
        userId,
        userName,
        content: content.trim(),
        rating: rating ? Math.max(1, Math.min(5, parseInt(rating))) : undefined
      });

      await comment.save();

      // Populate user info before sending response
      await comment.populate('userId', 'name email role');

      // Transform comment to match frontend expectations
      const transformedComment = {
        _id: comment._id,
        productId: comment.productId,
        user: {
          _id: (comment.userId as any)?._id || comment.userId,
          fullName: (comment.userId as any)?.name || comment.userName,
          role: (comment.userId as any)?.role
        },
        content: comment.content,
        rating: comment.rating,
        createdAt: (comment as any).createdAt,
        updatedAt: (comment as any).updatedAt
      };

      res.status(201).json({
        success: true,
        message: 'Bình luận đã được tạo thành công',
        data: transformedComment
      });
    } catch (error) {
      console.error('Create comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo bình luận'
      });
    }
  }

  // Update a comment
  static async updateComment(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { content, rating } = req.body;
      const userId = req.user?._id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid comment ID'
        });
      }

      const comment = await Comment.findOne({ _id: id, userId });
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bình luận hoặc bạn không có quyền chỉnh sửa'
        });
      }

      if (content) comment.content = content.trim();
      if (rating) comment.rating = Math.max(1, Math.min(5, parseInt(rating)));

      await comment.save();
      await comment.populate('userId', 'name email role');

      // Transform comment to match frontend expectations
      const transformedComment = {
        _id: comment._id,
        productId: comment.productId,
        user: {
          _id: (comment.userId as any)?._id || comment.userId,
          fullName: (comment.userId as any)?.name || comment.userName,
          role: (comment.userId as any)?.role
        },
        content: comment.content,
        rating: comment.rating,
        createdAt: (comment as any).createdAt,
        updatedAt: (comment as any).updatedAt
      };

      res.json({
        success: true,
        message: 'Bình luận đã được cập nhật',
        data: transformedComment
      });
    } catch (error) {
      console.error('Update comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật bình luận'
      });
    }
  }

  // Delete a comment
  static async deleteComment(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?._id;
      const userRole = req.user?.role;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid comment ID'
        });
      }

      const comment = await Comment.findById(id);
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bình luận'
        });
      }

      // Allow deletion if user owns the comment or is admin
      if (comment.userId.toString() !== userId?.toString() && userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xóa bình luận này'
        });
      }

      await Comment.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Bình luận đã được xóa'
      });
    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xóa bình luận'
      });
    }
  }

  // Get user's comments
  static async getUserComments(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?._id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const comments = await Comment.find({ userId })
        .populate('productId', 'name image')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Comment.countDocuments({ userId });

      res.json({
        success: true,
        data: {
          comments,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get user comments error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy bình luận của người dùng'
      });
    }
  }
}
