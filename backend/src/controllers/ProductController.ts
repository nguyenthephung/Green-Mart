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
      const existingProduct = await Product.findById(req.params.id);
      if (!existingProduct) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm', data: null });
      }

      // Nếu không có category trong request body và sản phẩm hiện tại có category
      // thì giữ lại category cũ để tránh lỗi required
      if (!req.body.category && existingProduct.category) {
        req.body.category = existingProduct.category;
      }

      // Nếu có category mới, kiểm tra xem category có tồn tại không
      if (req.body.category && req.body.category !== existingProduct.category) {
        try {
          const Category = require('../models/Category').default;
          const categoryExists = await Category.findOne({ name: req.body.category, status: 'active' });
          if (!categoryExists) {
            // Nếu category không tồn tại hoặc inactive, vẫn cho phép update nhưng log warning
            console.warn(`Category "${req.body.category}" không tồn tại hoặc inactive cho sản phẩm ${req.params.id}`);
          }
        } catch (catErr) {
          console.error('Lỗi kiểm tra category:', catErr);
        }
      }

      const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
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

  // Kiểm tra category của sản phẩm có tồn tại không
  async checkProductCategory(req: Request, res: Response) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm', data: null });
      }

      const Category = require('../models/Category').default;
      const categoryInfo = {
        productCategory: product.category,
        productSubCategory: product.subCategory,
        categoryExists: false,
        categoryActive: false,
        subcategoryExists: false
      };

      if (product.category) {
        const category = await Category.findOne({ name: product.category });
        if (category) {
          categoryInfo.categoryExists = true;
          categoryInfo.categoryActive = category.status === 'active';
          
          if (product.subCategory && category.subs && category.subs.includes(product.subCategory)) {
            categoryInfo.subcategoryExists = true;
          }
        }
      }

      res.json({ success: true, data: categoryInfo });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Lỗi kiểm tra category sản phẩm', data: null });
    }
  },
};

export default ProductController;
