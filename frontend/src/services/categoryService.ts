// Category Service: CRUD API for categories
import type { Category } from '../types/Category';
import { apiClient } from './api';

export async function getCategories(): Promise<Category[]> {
  try {
    const response = await apiClient<Category[]>('/categories');
    
    // Handle both old format (direct array) and new format ({ success, data })
    const categories = response.data || response as any as Category[];
    
    return Array.isArray(categories) ? categories : [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

export async function addCategory(newCategory: Omit<Category, 'id'>): Promise<Category> {
  const response = await apiClient<Category>('/categories', {
    method: 'POST',
    body: JSON.stringify(newCategory)
  });
  return response.data!;
}

export async function editCategory(updatedCategory: Category): Promise<Category> {
  const response = await apiClient<Category>(`/categories/${updatedCategory.id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedCategory)
  });
  return response.data!;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient(`/categories/${id}`, {
    method: 'DELETE'
  });
}

export async function toggleCategoryStatus(id: string): Promise<Category> {
  const response = await apiClient<Category>(`/categories/${id}/toggle-status`, {
    method: 'PATCH'
  });
  return response.data!;
}
