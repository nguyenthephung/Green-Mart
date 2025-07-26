import { create } from 'zustand';
import { fetchProducts, addProduct, updateProduct, deleteProduct } from '../services/productService';
import type { AdminProduct } from '../types/AdminProduct';

interface ProductState {
  products: AdminProduct[];
  loading: boolean;
  error?: string;
  fetchAll: () => Promise<void>;
  add: (product: Partial<AdminProduct>) => Promise<void>;
  update: (id: number | string, product: Partial<AdminProduct>) => Promise<void>;
  remove: (id: number | string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: false,
  error: undefined,

  fetchAll: async () => {
    set({ loading: true, error: undefined });
    try {
      const products = await fetchProducts();
      // Map _id thành id nếu có
      const mapped = products.map(p => ({ ...p, id: p.id ?? (p as any)._id }));
      set({ products: mapped, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Lỗi lấy sản phẩm', loading: false });
    }
  },

  add: async (product) => {
    set({ loading: true, error: undefined });
    try {
      const newProduct = await addProduct(product);
      set({ products: [newProduct, ...get().products], loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Lỗi thêm sản phẩm', loading: false });
    }
  },

  update: async (id, product) => {
    set({ loading: true, error: undefined });
    try {
      const updated = await updateProduct(id, product);
      set({
        products: get().products.map(p => p.id === updated.id ? updated : p),
        loading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Lỗi cập nhật sản phẩm', loading: false });
    }
  },

  remove: async (id) => {
    set({ loading: true, error: undefined });
    try {
      await deleteProduct(id);
      set({
        products: get().products.filter(p => p.id !== id),
        loading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Lỗi xóa sản phẩm', loading: false });
    }
  },
}));
