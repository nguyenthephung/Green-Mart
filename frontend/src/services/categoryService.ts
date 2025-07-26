// Category Service: CRUD API for categories
import type { Category } from '../types/Category';

export async function getCategories(): Promise<Category[]> {
  const res = await fetch('/api/categories');
  if (!res.ok) throw new Error('Lỗi khi lấy danh mục');
  return res.json();
}

export async function addCategory(newCategory: Omit<Category, 'id'>): Promise<Category> {
  const res = await fetch('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newCategory)
  });
  if (!res.ok) throw new Error('Lỗi khi thêm danh mục');
  return res.json();
}

export async function editCategory(updatedCategory: Category): Promise<Category> {
  const res = await fetch(`/api/categories/${updatedCategory.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedCategory)
  });
  if (!res.ok) throw new Error('Lỗi khi sửa danh mục');
  return res.json();
}

export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`/api/categories/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Lỗi khi xóa danh mục');
}

export async function toggleCategoryStatus(id: string): Promise<Category> {
  const res = await fetch(`/api/categories/${id}/toggle-status`, {
    method: 'PATCH'
  });
  if (!res.ok) throw new Error('Lỗi khi đổi trạng thái');
  return res.json();
}
