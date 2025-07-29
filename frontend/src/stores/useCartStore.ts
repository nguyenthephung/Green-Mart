import { create } from 'zustand';
import { fetchCart, addToCart as apiAddToCart, updateCartItem, removeCartItem } from '../services/cartService';


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
  clearCart: () => void;
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
          items = (res.data as { items: CartItem[] }).items || [];
        } else if (Array.isArray(res.data)) {
          items = res.data as CartItem[];
        }
        const { totalItems, totalAmount } = calculateTotals(items);
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
      console.log('[useCartStore.addToCart] item:', item);
      let res;
      if (item.type === 'weight') {
        res = await apiAddToCart(String(item.id), undefined, item.unit, item.weight, 'weight');
      } else {
        res = await apiAddToCart(String(item.id), item.quantity, item.unit, undefined, 'count');
      }
      console.log('[useCartStore.addToCart] apiAddToCart response:', res);
      if (res.success) {
        await get().fetchCart();
        set({ loading: false });
      } else {
        set({ error: res.message || 'Lỗi thêm sản phẩm', loading: false });
      }
    } catch (err: any) {
      console.error('[useCartStore.addToCart] ERROR:', err);
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
    console.log('[useCartStore] removeFromCart called:', { productId, unit, type });
    // Optimistically update UI
    set((state) => {
      const items = state.items.filter(item => {
        const match = String(item.id) === String(productId) && item.unit === unit && item.type === type;
        if (match) {
          console.log('[useCartStore] Removing item:', item);
        }
        return !match;
      });
      const { totalItems, totalAmount } = calculateTotals(items);
      return { items, totalItems, totalAmount };
    });
    try {
      const res = await removeCartItem(String(productId), unit, type);
      console.log('[useCartStore] removeCartItem API result:', res);
      if (res.success) {
        await get().fetchCart();
      } else {
        set({ error: res.message || 'Lỗi xóa sản phẩm', loading: false });
        alert('Lỗi xóa sản phẩm: ' + (res.message || 'Unknown error'));
      }
    } catch (err: any) {
      set({ error: err.message || 'Lỗi xóa sản phẩm', loading: false });
      alert('Lỗi xóa sản phẩm: ' + (err?.message || err));
    }
  },
  clearCart: () => {
    // Only clear items, not the cart object
    set({ items: [], totalItems: 0, totalAmount: 0 });
  },
  getCartCount: () => get().totalItems,
  getItemQuantity: (id: string | number) => {
    const item = get().items.find(item => item.id === id);
    return item?.quantity || 0;
  },
}));