import { Request, Response } from 'express';
import Product from '../models/Product';

const ProductController = {
  // Lấy tất cả sản phẩm
  async getAllProducts(req: Request, res: Response) {
    try {
      const products = await Product.find();
      res.json({ success: true, data: products });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Lỗi lấy sản phẩm', data: [] });
    }
  },

  // Thêm sản phẩm
  async createProduct(req: Request, res: Response) {
    try {
      const product = new Product(req.body);
      await product.save();
      // Tăng productCount của category nếu có
      if (product.category) {
        try {
          const Category = require('../models/Category').default;
          await Category.updateOne(
            { name: product.category },
            { $inc: { productCount: 1 } }
          );
        } catch (catErr) {
          // Không throw lỗi nếu update category thất bại, chỉ log
          console.error('Lỗi cập nhật productCount cho category:', catErr);
        }
      }
      res.json({ success: true, data: product });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Lỗi thêm sản phẩm', data: null });
    }
  },

  // Sửa sản phẩm
  async updateProduct(req: Request, res: Response) {
    try {
      const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm', data: null });
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Lỗi cập nhật sản phẩm', data: null });
    }
  },

  // Xóa sản phẩm
  async deleteProduct(req: Request, res: Response) {
    try {
      const deleted = await Product.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm', data: null });
      // Giảm productCount của category nếu cần
      const Category = require('../models/Category').default;
      if (deleted.category) {
        await Category.updateOne(
          { name: deleted.category },
          { $inc: { productCount: -1 } }
        );
      }
      res.json({ success: true, data: deleted });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Lỗi xóa sản phẩm', data: null });
    }
  },
};

export default ProductController;
