// Category Service: CRUD API for categories
import type { Category } from '../types/Category';
import { apiClient } from './api';

export async function getCategories(): Promise<Category[]> {
  try {
    console.log('Fetching categories from API...');
    const response = await apiClient<Category[]>('/categories');
    console.log('Categories response:', response);
    return response.data || [];
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
