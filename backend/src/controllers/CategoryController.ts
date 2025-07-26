import { Request, Response } from 'express';
import Category from '../models/Category';

// GET /api/categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy danh mục' });
  }
};

// POST /api/categories
export const addCategory = async (req: Request, res: Response) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi thêm danh mục' });
  }
};

// PUT /api/categories/:id
export const editCategory = async (req: Request, res: Response) => {
  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Không tìm thấy danh mục' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi sửa danh mục' });
  }
};

// DELETE /api/categories/:id
export const deleteCategory = async (req: Request, res: Response) => {
  try {
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
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi đổi trạng thái' });
  }
};
