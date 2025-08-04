import { create } from 'zustand';
import { fetchCart, addToCart as apiAddToCart, updateCartItem, removeCartItem, clearCart as apiClearCart } from '../services/cartService';


export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  image: string;
  unit: string;
  quantity: number; // cho sản phẩm đếm số lượng
  type?: 'count' | 'weight';
  weight?: number; // cho sản phẩm cân ký
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  loading: boolean;
  error?: string;
  fetchCart: () => Promise<void>;
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity: number }) => Promise<void>;
  updateQuantity: (productId: string | number, value: number, unit?: string, type?: 'count' | 'weight') => Promise<void>;
  removeFromCart: (productId: string | number, unit?: string, type?: 'count' | 'weight') => Promise<void>;
  clearCart: () => Promise<void>;
  cleanInvalidItems: () => Promise<void>;
  getCartCount: () => number;
  getItemQuantity: (id: string | number) => number;
}

// Helper function để tính totals
const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => {
    if (item.type === 'weight') {
      return sum + (item.weight || 0);
    } else {
      return sum + (item.quantity || 0);
    }
  }, 0);
  const totalAmount = items.reduce((sum, item) => {
    if (item.type === 'weight') {
      return sum + (item.price * (item.weight || 0));
    } else {
      return sum + (item.price * (item.quantity || 0));
    }
  }, 0);
  return { totalItems, totalAmount };
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  totalItems: 0,
  totalAmount: 0,
  loading: false,
  error: undefined,
  fetchCart: async () => {
    set({ loading: true, error: undefined });
    try {
      const res = await fetchCart();
      let items: CartItem[] = [];
      if (res.success && res.data) {
        // Always use res.data.items if present (backend always returns { items: [...] })
        if (res.data && typeof res.data === 'object' && 'items' in res.data) {
          const rawItems = (res.data as { items: any[] }).items || [];
          // Map backend cart items to frontend format
          items = rawItems.map((item: any) => ({
            id: item.productId || item.id, // Map productId to id for consistency
            name: item.name,
            price: item.price,
            image: item.image,
            unit: item.unit,
            quantity: item.quantity || 0,
            type: item.type || 'count',
            weight: item.weight || 0
          }));
        } else if (Array.isArray(res.data)) {
          items = res.data as CartItem[];
        }
        const { totalItems, totalAmount } = calculateTotals(items);
        console.log('Cart store: fetchCart calculated totals', { totalItems, totalAmount, itemsCount: items.length });
        set({ items, totalItems, totalAmount, loading: false });
      } else {
        set({ error: res.message || 'Lỗi lấy giỏ hàng', loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'Lỗi lấy giỏ hàng', loading: false });
    }
  },
  addToCart: async (item: Omit<CartItem, 'quantity'> & { quantity: number; weight?: number; type?: 'count' | 'weight' }) => {
    set({ loading: true, error: undefined });
    try {
      let res;
      if (item.type === 'weight') {
        res = await apiAddToCart(String(item.id), undefined, item.unit, item.weight, 'weight');
      } else {
        res = await apiAddToCart(String(item.id), item.quantity, item.unit, undefined, 'count');
      }
      if (res.success) {
        console.log('Cart store: addToCart success, calling fetchCart...');
        await get().fetchCart();
        set({ loading: false });
      } else {
        set({ error: res.message || 'Lỗi thêm sản phẩm', loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'Lỗi thêm sản phẩm', loading: false });
    }
  },
  updateQuantity: async (productId: string | number, value: number, unit?: string, type?: 'count' | 'weight') => {
    set({ loading: true, error: undefined });
    try {
      let res;
      if (type === 'weight') {
        res = await updateCartItem(String(productId), undefined, unit, value, 'weight');
      } else {
        res = await updateCartItem(String(productId), value, unit, undefined, 'count');
      }
      if (res.success) {
        await get().fetchCart();
      } else {
        set({ error: res.message || 'Lỗi cập nhật số lượng', loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'Lỗi cập nhật số lượng', loading: false });
    }
  },
  removeFromCart: async (productId: string | number, unit?: string, type?: 'count' | 'weight') => {
    set({ loading: true, error: undefined });
    // Optimistically update UI
    set((state) => {
      const items = state.items.filter(item => {
        const match = String(item.id) === String(productId) && item.unit === unit && item.type === type;
        return !match;
      });
      const { totalItems, totalAmount } = calculateTotals(items);
      return { items, totalItems, totalAmount };
    });
    try {
      const res = await removeCartItem(String(productId), unit, type);
      if (res.success) {
        await get().fetchCart();
      } else {
        set({ error: res.message || 'Lỗi xóa sản phẩm', loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'Lỗi xóa sản phẩm', loading: false });
    }
  },
  clearCart: async () => {
    try {
      set({ loading: true, error: undefined });
      
      // Call API to clear cart in database
      const res = await apiClearCart();
      
      if (res.success) {
        // Clear items from state
        set({ items: [], totalItems: 0, totalAmount: 0, loading: false });
      } else {
        set({ error: res.message || 'Lỗi xóa giỏ hàng', loading: false });
      }
    } catch (err: any) {
      console.error('Clear cart error:', err);
      // Even if API fails, clear local state
      set({ items: [], totalItems: 0, totalAmount: 0, error: err.message || 'Lỗi xóa giỏ hàng', loading: false });
    }
  },
  cleanInvalidItems: async () => {
    set({ loading: true, error: undefined });
    try {
      const currentItems = get().items;
      const validItems = currentItems.filter(item => {
        const hasId = item.id && item.id !== '' && item.id !== 'undefined';
        const idString = String(item.id).trim();
        const isValidObjectId = /^[a-fA-F0-9]{24}$/.test(idString);
        return hasId && isValidObjectId && item.name && item.quantity > 0 && item.price > 0;
      });
      
      if (validItems.length !== currentItems.length) {
        const { totalItems, totalAmount } = calculateTotals(validItems);
        set({ items: validItems, totalItems, totalAmount, loading: false });
        console.log(`Removed ${currentItems.length - validItems.length} invalid items from cart`);
      } else {
        set({ loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'Lỗi dọn dẹp giỏ hàng', loading: false });
    }
  },
  getCartCount: () => get().totalItems,
  getItemQuantity: (id: string | number) => {
    const item = get().items.find(item => item.id === id);
    return item?.quantity || 0;
  },
}));