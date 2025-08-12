import { create } from 'zustand';
import type { FlashSale, ProductFlashSaleInfo } from '../types/FlashSale';
import flashSaleService from '../services/flashSaleService';

interface FlashSaleStore {
  // State
  activeFlashSales: FlashSale[];
  upcomingFlashSales: FlashSale[];
  allFlashSales: FlashSale[];
  currentFlashSale: FlashSale | null;
  productFlashSaleInfo: Record<string, ProductFlashSaleInfo>;
  loading: boolean;
  error: string | null;

  // Actions
  fetchActiveFlashSales: () => Promise<void>;
  fetchUpcomingFlashSales: () => Promise<void>;
  fetchAllFlashSales: (page?: number, limit?: number) => Promise<void>;
  checkProductInFlashSale: (productId: string) => Promise<ProductFlashSaleInfo>;
  createFlashSale: (flashSaleData: any) => Promise<void>;
  updateFlashSale: (id: string, flashSaleData: any) => Promise<void>;
  deleteFlashSale: (id: string) => Promise<void>;
  toggleFlashSaleStatus: (id: string) => Promise<void>;
  clearError: () => void;
  setCurrentFlashSale: (flashSale: FlashSale | null) => void;
  
  // Helper functions
  isProductInActiveFlashSale: (productId: string) => boolean;
  getActiveFlashSaleIds: () => string[];
  getFlashSaleForProduct: (productId: string) => { flashSale: FlashSale; product: any } | null;
}

export const useFlashSaleStore = create<FlashSaleStore>((set, get) => ({
  // Initial state
  activeFlashSales: [],
  upcomingFlashSales: [],
  allFlashSales: [],
  currentFlashSale: null,
  productFlashSaleInfo: {},
  loading: false,
  error: null,

  // Actions
  fetchActiveFlashSales: async () => {
    set({ loading: true, error: null });
    try {
      const flashSales = await flashSaleService.getActiveFlashSales();
      set({ activeFlashSales: flashSales, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch active flash sales',
        loading: false 
      });
    }
  },

  fetchUpcomingFlashSales: async () => {
    set({ loading: true, error: null });
    try {
      const flashSales = await flashSaleService.getUpcomingFlashSales();
      set({ upcomingFlashSales: flashSales, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch upcoming flash sales',
        loading: false 
      });
    }
  },

  fetchAllFlashSales: async (page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await flashSaleService.getAllFlashSales(page, limit);
      set({ 
        allFlashSales: Array.isArray(response.data) ? response.data : [], 
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch flash sales',
        loading: false 
      });
    }
  },

  checkProductInFlashSale: async (productId: string) => {
    try {
      const info = await flashSaleService.checkProductInFlashSale(productId);
      set(state => ({
        productFlashSaleInfo: {
          ...state.productFlashSaleInfo,
          [productId]: info
        }
      }));
      return info;
    } catch (error) {
      console.error('Error checking product in flash sale:', error);
      return { inFlashSale: false };
    }
  },

  createFlashSale: async (flashSaleData: any) => {
    set({ loading: true, error: null });
    try {
      const newFlashSale = await flashSaleService.createFlashSale(flashSaleData);
      set(state => ({
        allFlashSales: [newFlashSale, ...state.allFlashSales],
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create flash sale',
        loading: false 
      });
      throw error;
    }
  },

  updateFlashSale: async (id: string, flashSaleData: any) => {
    set({ loading: true, error: null });
    try {
      const updatedFlashSale = await flashSaleService.updateFlashSale(id, flashSaleData);
      set(state => ({
        allFlashSales: state.allFlashSales.map(fs => 
          fs._id === id ? updatedFlashSale : fs
        ),
        activeFlashSales: state.activeFlashSales.map(fs => 
          fs._id === id ? updatedFlashSale : fs
        ),
        upcomingFlashSales: state.upcomingFlashSales.map(fs => 
          fs._id === id ? updatedFlashSale : fs
        ),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update flash sale',
        loading: false 
      });
      throw error;
    }
  },

  deleteFlashSale: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await flashSaleService.deleteFlashSale(id);
      set(state => ({
        allFlashSales: state.allFlashSales.filter(fs => fs._id !== id),
        activeFlashSales: state.activeFlashSales.filter(fs => fs._id !== id),
        upcomingFlashSales: state.upcomingFlashSales.filter(fs => fs._id !== id),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete flash sale',
        loading: false 
      });
      throw error;
    }
  },

  toggleFlashSaleStatus: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const updatedFlashSale = await flashSaleService.toggleFlashSaleStatus(id);
      set(state => ({
        allFlashSales: state.allFlashSales.map(fs => 
          fs._id === id ? updatedFlashSale : fs
        ),
        activeFlashSales: state.activeFlashSales.map(fs => 
          fs._id === id ? updatedFlashSale : fs
        ),
        upcomingFlashSales: state.upcomingFlashSales.map(fs => 
          fs._id === id ? updatedFlashSale : fs
        ),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to toggle flash sale status',
        loading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  setCurrentFlashSale: (flashSale: FlashSale | null) => 
    set({ currentFlashSale: flashSale }),

  // Helper functions
  isProductInActiveFlashSale: (productId: string): boolean => {
    const { activeFlashSales } = get();
    return activeFlashSales.some((flashSale: FlashSale) => 
      flashSale.products.some((product: any) => product.productId === productId)
    );
  },

  getActiveFlashSaleIds: (): string[] => {
    const { activeFlashSales } = get();
    const productIds: string[] = [];
    activeFlashSales.forEach((flashSale: FlashSale) => {
      flashSale.products.forEach((product: any) => {
        productIds.push(product.productId);
      });
    });
    return productIds;
  },

  getFlashSaleForProduct: (productId: string): { flashSale: FlashSale; product: any } | null => {
    const { activeFlashSales } = get();
    for (const flashSale of activeFlashSales) {
      const product = flashSale.products.find((p: any) => p.productId === productId);
      if (product) {
        return { flashSale, product };
      }
    }
    return null;
  }
}));
