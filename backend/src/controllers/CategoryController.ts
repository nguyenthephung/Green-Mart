import { Request, Response } from 'express';
import Category from '../models/Category';
import Product from '../models/Product';

// GET /api/categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find();
    
    // Tính toán productCount thực tế cho mỗi category
    const categoriesWithCount = await Promise.all(categories.map(async (category) => {
      const productCount = await Product.countDocuments({ category: category.name });
      return {
        ...category.toObject(),
        productCount
      };
    }));
    
    res.json(categoriesWithCount);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy danh mục' });
  }
};

// Thêm mới hoặc cập nhật danh mục
export const createOrUpdateCategory = async (req: Request, res: Response) => {
  try {
    const { id, name, subs, icon, description, status } = req.body;
    if (id) {
      // Nếu có id, update danh mục cha (thêm danh mục con vào subs)
      const category = await Category.findById(id);
      if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục cha' });
      category.name = name || category.name;
      category.icon = icon || category.icon;
      category.description = description || category.description;
      category.status = status || category.status;
      if (Array.isArray(subs) && subs.every(s => typeof s === 'string')) (category as any).subs = subs;
      await category.save();
      
      // Tính toán productCount thực tế
      const productCount = await Product.countDocuments({ category: category.name });
      const categoryWithCount = {
        ...category.toObject(),
        productCount
      };
      
      return res.status(200).json(categoryWithCount);
    } else {
      // Tạo mới danh mục cha
      const category = new Category({
        name,
        subs: subs || [],
        icon,
        description,
        status
      });
      await category.save();
      
      // Tính toán productCount thực tế
      const productCount = await Product.countDocuments({ category: category.name });
      const categoryWithCount = {
        ...category.toObject(),
        productCount
      };
      
      return res.status(201).json(categoryWithCount);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message: errorMessage });
  }
};

// DELETE /api/categories/:id
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    // Xóa tất cả sản phẩm thuộc category này
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Không tìm thấy danh mục' });
    const categoryName = category.name;
    // Xóa sản phẩm thuộc category
    const Product = require('../models/Product').default;
    await Product.deleteMany({ category: categoryName });
    // Xóa category khỏi subs của các category khác
    await Category.updateMany(
      { subs: categoryName },
      { $pull: { subs: categoryName } }
    );
    await Category.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi xóa danh mục' });
  }
};

// PATCH /api/categories/:id/toggle-status
export const toggleCategoryStatus = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Không tìm thấy danh mục' });
    category.status = category.status === 'active' ? 'inactive' : 'active';
    await category.save();
    
    // Tính toán productCount thực tế
    const productCount = await Product.countDocuments({ category: category.name });
    const categoryWithCount = {
      ...category.toObject(),
      productCount
    };
    
    res.json(categoryWithCount);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi đổi trạng thái' });
  }
};
