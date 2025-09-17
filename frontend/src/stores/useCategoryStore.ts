import { create } from 'zustand';
import type { Category } from '../types/Category';
import {
  getCategories,
  addCategory,
  editCategory as editCategoryApi,
  deleteCategory,
  toggleCategoryStatus
} from '../services/categoryService';

interface CategoryStore {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  add: (cat: Omit<Category, 'id'>) => Promise<void>;
  edit: (cat: Category) => Promise<void>;
  remove: (id: string) => Promise<void>;
  toggleStatus: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],
  loading: false,
  error: null,
  async fetchCategories() {
    set({ loading: true, error: null });
    try {
      const data = await getCategories();
      
      // Map _id to id (string)
      const mapped = Array.isArray(data)
        ? data.map((cat: any) => ({
            ...cat,
            id: cat._id ? String(cat._id) : cat.id
          }))
        : [];
      
      // Remove duplicates based on id
      const uniqueCategories = mapped.filter((cat, index, self) => 
        index === self.findIndex(c => c.id === cat.id)
      );
      
      set({ categories: uniqueCategories, loading: false });
    } catch (err: any) {
      console.error('CategoryStore: Error fetching categories:', err);
      set({ error: err.message, loading: false });
    }
  },
  async add(cat) {
    set({ loading: true, error: null });
    try {
      const addedRaw = await addCategory(cat);
      // Map _id to id (string) nếu cần
      const added = {
        ...addedRaw,
        id: addedRaw._id ? String(addedRaw._id) : addedRaw.id
      };
      set((state) => {
        // Check if category already exists
        const existingIndex = state.categories.findIndex(c => c.id === added.id);
        if (existingIndex >= 0) {
          // Update existing category instead of adding duplicate
          const updatedCategories = [...state.categories];
          updatedCategories[existingIndex] = added;
          return { categories: updatedCategories, loading: false };
        } else {
          // Add new category
          return { categories: [...state.categories, added], loading: false };
        }
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
  async edit(cat) {
    set({ loading: true, error: null });
    try {
      const updatedRaw = await editCategoryApi(cat);
      // Map _id to id (string) nếu cần
      const updated = {
        ...updatedRaw,
        id: updatedRaw._id ? String(updatedRaw._id) : updatedRaw.id
      };
      set((state) => ({
        categories: state.categories.map(c => c.id === updated.id ? updated : c),
        loading: false
      }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
  async remove(id: string) {
    set({ loading: true, error: null });
    try {
      await deleteCategory(id);
      set((state) => ({ categories: state.categories.filter(c => String(c.id) !== String(id)), loading: false }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
  async toggleStatus(id: string) {
    set({ loading: true, error: null });
    try {
      const updatedRaw = await toggleCategoryStatus(id);
      // Map _id to id (string) nếu cần
      const updated = {
        ...updatedRaw,
        id: updatedRaw._id ? String(updatedRaw._id) : updatedRaw.id
      };
      set((state) => ({
        categories: state.categories.map(c => c.id === updated.id ? updated : c),
        loading: false
      }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  }
}));
