import { create } from 'zustand';
import { fetchCart, addToCart as apiAddToCart, updateCartItem, removeCartItem } from '../services/cartService';

export interface CartItem {
  id: number;
  name: string;
  price: number | string;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  loading: boolean;
  error?: string;
  fetchCart: () => Promise<void>;
  addToCart: (item: Omit<CartItem, 'quantity'>) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => void;
  getCartCount: () => number;
  getItemQuantity: (id: number) => number;
}

// Helper function để tính totals
const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
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
        if (Array.isArray(res.data)) {
          items = res.data as CartItem[];
        } else if (res.data && typeof res.data === 'object' && 'items' in res.data) {
          items = (res.data as { items: CartItem[] }).items || [];
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
  addToCart: async (item: Omit<CartItem, 'quantity'>) => {
    set({ loading: true, error: undefined });
    try {
      // Chỉ truyền id và quantity cho API, các trường khác backend tự lấy
      const res = await apiAddToCart(item.id.toString(), 1);
      if (res.success) {
        await get().fetchCart();
        set({ loading: false });
      } else {
        set({ error: res.message || 'Lỗi thêm sản phẩm', loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'Lỗi thêm sản phẩm', loading: false });
    }
  },
  updateQuantity: async (productId: number, quantity: number) => {
    set({ loading: true, error: undefined });
    try {
      const res = await updateCartItem(productId.toString(), quantity);
      if (res.success) {
        await get().fetchCart();
      } else {
        set({ error: res.message || 'Lỗi cập nhật số lượng', loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'Lỗi cập nhật số lượng', loading: false });
    }
  },
  removeFromCart: async (productId: number) => {
    set({ loading: true, error: undefined });
    try {
      const res = await removeCartItem(productId.toString());
      if (res.success) {
        await get().fetchCart();
      } else {
        set({ error: res.message || 'Lỗi xóa sản phẩm', loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'Lỗi xóa sản phẩm', loading: false });
    }
  },
  clearCart: () => {
    set({ items: [], totalItems: 0, totalAmount: 0 });
  },
  getCartCount: () => get().totalItems,
  getItemQuantity: (id: number) => {
    const item = get().items.find(item => item.id === id);
    return item?.quantity || 0;
  },
}));