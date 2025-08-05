import { create } from 'zustand';
import { fetchCart, addToCart as apiAddToCart, updateCartItem, removeCartItem, clearCart as apiClearCart } from '../services/cartService';

// Local storage key for guest cart
const GUEST_CART_KEY = 'guest_cart';

// Helper functions for guest cart
const getGuestCart = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const setGuestCart = (items: CartItem[]) => {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save guest cart:', error);
  }
};

const clearGuestCart = () => {
  try {
    localStorage.removeItem(GUEST_CART_KEY);
  } catch (error) {
    console.error('Failed to clear guest cart:', error);
  }
};

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
  clearAllCartData: () => void; // Clear both server and guest cart
  cleanInvalidItems: () => Promise<void>;
  getCartCount: () => number;
  getItemQuantity: (id: string | number) => number;
  syncGuestCartToServer: () => Promise<void>;
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
        // Check if this is a guest response
        if ((res.data as any)?.isGuest) {
          console.log('Guest user detected, loading from localStorage');
          items = getGuestCart();
        } else if (res.data && typeof res.data === 'object' && 'items' in res.data) {
          // Regular user with cart data
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
        // If fetch fails, check if we have guest cart
        console.log('Cart fetch failed, checking guest cart');
        const guestItems = getGuestCart();
        const { totalItems, totalAmount } = calculateTotals(guestItems);
        set({ items: guestItems, totalItems, totalAmount, loading: false });
      }
    } catch (err: any) {
      console.log('Cart fetch error, loading guest cart as fallback:', err.message);
      // Load guest cart as fallback
      const guestItems = getGuestCart();
      const { totalItems, totalAmount } = calculateTotals(guestItems);
      set({ items: guestItems, totalItems, totalAmount, loading: false });
    }
  },
  addToCart: async (item: Omit<CartItem, 'quantity'> & { quantity: number; weight?: number; type?: 'count' | 'weight' }) => {
    // Optimistic update - update UI immediately
    set((state) => {
      const existingIndex = state.items.findIndex(cartItem => 
        String(cartItem.id) === String(item.id) && 
        cartItem.unit === item.unit &&
        cartItem.type === item.type
      );
      
      let newItems = [...state.items];
      
      if (existingIndex >= 0) {
        // Update existing item
        if (item.type === 'weight') {
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            weight: (newItems[existingIndex].weight || 0) + (item.weight || 0)
          };
        } else {
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: newItems[existingIndex].quantity + item.quantity
          };
        }
      } else {
        // Add new item
        newItems.push({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          unit: item.unit,
          quantity: item.quantity,
          type: item.type,
          weight: item.weight
        });
      }
      
      const { totalItems, totalAmount } = calculateTotals(newItems);
      return { 
        ...state,
        items: newItems, 
        totalItems, 
        totalAmount, 
        loading: false,
        error: undefined
      };
    });

    // Then sync with server in background (don't block UI)
    try {
      let res;
      if (item.type === 'weight') {
        res = await apiAddToCart(String(item.id), undefined, item.unit, item.weight, 'weight');
      } else {
        res = await apiAddToCart(String(item.id), item.quantity, item.unit, undefined, 'count');
      }
      
      if (res.success) {
        console.log('Cart store: addToCart success - optimistic update already applied');
        // No need to fetchCart again since we already updated optimistically
      } else if ((res as any)?.requireLogin) {
        // Guest user - sync with localStorage
        console.log('Syncing with guest cart (local storage)');
        const currentState = get();
        setGuestCart(currentState.items);
      } else {
        // API error - revert optimistic update by refetching
        console.warn('API error, reverting optimistic update');
        await get().fetchCart();
        set({ error: res.message || 'Lỗi thêm sản phẩm' });
      }
    } catch (err: any) {
      console.error('Add to cart error, reverting optimistic update:', err);
      // Revert optimistic update on error
      await get().fetchCart();
      set({ error: err.message || 'Lỗi thêm sản phẩm' });
    }
  },
  updateQuantity: async (productId: string | number, value: number, unit?: string, type?: 'count' | 'weight') => {
    // Optimistic update - update UI immediately
    set((state) => {
      const newItems = state.items.map(item => {
        if (String(item.id) === String(productId) && 
            item.unit === unit && 
            item.type === type) {
          if (type === 'weight') {
            return { ...item, weight: value };
          } else {
            return { ...item, quantity: value };
          }
        }
        return item;
      });
      
      const { totalItems, totalAmount } = calculateTotals(newItems);
      return { 
        ...state,
        items: newItems, 
        totalItems, 
        totalAmount, 
        loading: false,
        error: undefined
      };
    });

    // Then sync with server in background
    try {
      let res;
      if (type === 'weight') {
        res = await updateCartItem(String(productId), undefined, unit, value, 'weight');
      } else {
        res = await updateCartItem(String(productId), value, unit, undefined, 'count');
      }
      
      if (res.success) {
        console.log('Cart store: updateQuantity success - optimistic update already applied');
        // No need to fetchCart again since we already updated optimistically
      } else if ((res as any)?.requireLogin) {
        // Guest user - sync with localStorage  
        const currentState = get();
        setGuestCart(currentState.items);
      } else {
        // API error - revert optimistic update by refetching
        console.warn('API error, reverting optimistic update');
        await get().fetchCart();
        set({ error: res.message || 'Lỗi cập nhật số lượng' });
      }
    } catch (err: any) {
      console.error('Update quantity error, reverting optimistic update:', err);
      // Revert optimistic update on error
      await get().fetchCart();
      set({ error: err.message || 'Lỗi cập nhật số lượng' });
    }
  },
  removeFromCart: async (productId: string | number, unit?: string, type?: 'count' | 'weight') => {
    // Optimistic update - update UI immediately
    set((state) => {
      const newItems = state.items.filter(item => {
        const match = String(item.id) === String(productId) && 
                      item.unit === unit && 
                      item.type === type;
        return !match;
      });
      
      const { totalItems, totalAmount } = calculateTotals(newItems);
      return { 
        ...state,
        items: newItems, 
        totalItems, 
        totalAmount, 
        loading: false,
        error: undefined
      };
    });

    // Then sync with server in background
    try {
      const res = await removeCartItem(String(productId), unit, type);
      if (res.success) {
        console.log('Cart store: removeFromCart success - optimistic update already applied');
        // No need to fetchCart again since we already updated optimistically
      } else if ((res as any)?.requireLogin) {
        // Guest user - sync with localStorage
        const currentState = get();
        setGuestCart(currentState.items);
      } else {
        // API error - revert optimistic update by refetching
        console.warn('API error, reverting optimistic update');
        await get().fetchCart();
        set({ error: res.message || 'Lỗi xóa sản phẩm' });
      }
    } catch (err: any) {
      console.error('Remove from cart error, reverting optimistic update:', err);
      // Revert optimistic update on error
      await get().fetchCart();
      set({ error: err.message || 'Lỗi xóa sản phẩm' });
    }
  },
  clearCart: async () => {
    try {
      set({ loading: true, error: undefined });
      
      // Try to call API to clear cart in database
      try {
        const res = await apiClearCart();
        if (res.success) {
          console.log('Server cart cleared successfully');
        } else {
          console.log('Server cart clear response:', res.message);
        }
      } catch (apiError: any) {
        console.log('Server cart clear failed (user may not be authenticated):', apiError.message);
        // This is okay for guest users or when logged out
      }
      
      // Always clear guest cart from localStorage
      clearGuestCart();
      
      // Always clear local state regardless of API result
      set({ items: [], totalItems: 0, totalAmount: 0, loading: false });
      
    } catch (err: any) {
      console.error('Clear cart error:', err);
      // Even if everything fails, clear local state
      clearGuestCart();
      set({ items: [], totalItems: 0, totalAmount: 0, error: err.message || 'Lỗi xóa giỏ hàng', loading: false });
    }
  },

  clearAllCartData: () => {
    // Immediate clear for logout - no API calls
    clearGuestCart();
    set({ items: [], totalItems: 0, totalAmount: 0, loading: false, error: undefined });
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
  syncGuestCartToServer: async () => {
    try {
      const guestItems = getGuestCart();
      if (guestItems.length === 0) return;
      
      console.log('Syncing guest cart to server:', guestItems);
      
      // Add each guest item to server cart
      for (const item of guestItems) {
        try {
          if (item.type === 'weight') {
            await apiAddToCart(String(item.id), undefined, item.unit, item.weight, 'weight');
          } else {
            await apiAddToCart(String(item.id), item.quantity, item.unit, undefined, 'count');
          }
        } catch (itemError) {
          console.error('Failed to sync item:', item, itemError);
        }
      }
      
      // Clear guest cart after successful sync
      clearGuestCart();
      
      // Refresh cart from server
      await get().fetchCart();
      
      console.log('Guest cart synced successfully');
    } catch (error) {
      console.error('Failed to sync guest cart:', error);
    }
  },
}));