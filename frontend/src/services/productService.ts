import { apiClient } from './api';
import type { AdminProduct } from '../types/AdminProduct';

export const fetchProducts = async (): Promise<AdminProduct[]> => {
  const res = await apiClient<AdminProduct[]>('/products');
  return res.data || [];
};

export const addProduct = async (product: Partial<AdminProduct>): Promise<AdminProduct> => {
  const res = await apiClient<AdminProduct>('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  });
  if (!res.data) throw new Error(res.message || 'Không thêm được sản phẩm');
  return res.data;
};

export const updateProduct = async (
  id: number | string,
  product: Partial<AdminProduct>
): Promise<AdminProduct> => {
  const res = await apiClient<AdminProduct>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  });
  if (!res.data) throw new Error(res.message || 'Không cập nhật được sản phẩm');
  return res.data;
};

export const deleteProduct = async (id: number | string): Promise<void> => {
  await apiClient<null>(`/products/${id}`, {
    method: 'DELETE',
  });
};

export const checkProductCategory = async (id: number | string) => {
  const res = await apiClient<{
    productCategory: string;
    productSubCategory?: string;
    categoryExists: boolean;
    categoryActive: boolean;
    subcategoryExists: boolean;
  }>(`/products/${id}/category-check`);
  return res.data;
};
