import { create } from 'zustand';
import {
  fetchCart,
  addToCart as apiAddToCart,
  updateCartItem,
  removeCartItem,
} from '../services/cartService';
import { useNewToastStore } from './useNewToastStore';

// Local storage key for guest cart
const GUEST_CART_KEY = 'guest_cart';
const CART_CACHE_KEY = 'cart_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache interface
interface CartCache {
  data: CartItem[];
  timestamp: number;
  userId?: string;
}

// Helper functions for cart caching
const getCartCache = (): CartCache | null => {
  try {
    const stored = localStorage.getItem(CART_CACHE_KEY);
    if (!stored) return null;

    const cache: CartCache = JSON.parse(stored);
    const now = Date.now();

    // Check if cache is expired
    if (now - cache.timestamp > CACHE_DURATION) {
      localStorage.removeItem(CART_CACHE_KEY);
      return null;
    }

    return cache;
  } catch {
    localStorage.removeItem(CART_CACHE_KEY);
    return null;
  }
};

const setCartCache = (data: CartItem[], userId?: string) => {
  try {
    const cache: CartCache = {
      data,
      timestamp: Date.now(),
      userId,
    };
    localStorage.setItem(CART_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    // ...existing code (đã xóa log)...
  }
};

const clearCartCache = () => {
  try {
    localStorage.removeItem(CART_CACHE_KEY);
  } catch (error) {
    // ...existing code (đã xóa log)...
  }
};

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
    // ...existing code (đã xóa log)...
  }
};

const clearGuestCart = () => {
  try {
    localStorage.removeItem(GUEST_CART_KEY);
  } catch (error) {
    // ...existing code (đã xóa log)...
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
  flashSale?: {
    flashSaleId: string;
    isFlashSale: boolean;
    originalPrice: number;
    discountPercentage: number;
  };
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  loading: boolean;
  error?: string;
  fetchCart: (force?: boolean) => Promise<void>;
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity: number }) => Promise<void>;
  updateQuantity: (
    productId: string | number,
    value: number,
    unit?: string,
    type?: 'count' | 'weight',
    flashSale?: any
  ) => Promise<void>;
  removeFromCart: (
    productId: string | number,
    unit?: string,
    type?: 'count' | 'weight',
    flashSale?: any
  ) => Promise<void>;
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
      return sum + item.price * (item.weight || 0);
    } else {
      return sum + item.price * (item.quantity || 0);
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
  fetchCart: async (force = false) => {
    // Check cache first (unless forced refresh)
    if (!force) {
      const cached = getCartCache();
      if (cached) {
        const { totalItems, totalAmount } = calculateTotals(cached.data);
        set({ items: cached.data, totalItems, totalAmount, loading: false });
        return;
      }
    }

    set({ loading: true, error: undefined });
    try {
      const res = await fetchCart();
      let items: CartItem[] = [];
      if (res.success && res.data) {
        // Check if this is a guest response
        if ((res.data as any)?.isGuest) {
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
            weight: item.weight || 0,
            isSale: item.isSale ?? false,
            salePrice: typeof item.salePrice === 'number' ? item.salePrice : undefined,
            // Preserve Flash Sale information
            flashSale: item.flashSale || undefined,
          }));
        } else if (Array.isArray(res.data)) {
          items = res.data as CartItem[];
        }

        const { totalItems, totalAmount } = calculateTotals(items);
        // Cache the cart data
        setCartCache(items);
        set({ items, totalItems, totalAmount, loading: false });
      } else {
        const guestItems = getGuestCart();
        const { totalItems, totalAmount } = calculateTotals(guestItems);
        set({ items: guestItems, totalItems, totalAmount, loading: false });
      }
    } catch (err: any) {
      // Load guest cart as fallback
      const guestItems = getGuestCart();
      const { totalItems, totalAmount } = calculateTotals(guestItems);
      set({ items: guestItems, totalItems, totalAmount, loading: false });
    }
  },
  addToCart: async (
    item: Omit<CartItem, 'quantity'> & {
      quantity: number;
      weight?: number;
      type?: 'count' | 'weight';
    }
  ) => {
    // ...existing code...

    // Optimistic update - update UI immediately
    set(state => {
      const existingIndex = state.items.findIndex(
        cartItem =>
          String(cartItem.id) === String(item.id) &&
          cartItem.unit === item.unit &&
          cartItem.type === item.type &&
          // Include Flash Sale status in matching to keep Flash Sale and regular items separate
          Boolean(cartItem.flashSale?.isFlashSale) === Boolean(item.flashSale?.isFlashSale)
      );

      let newItems = [...state.items];

      if (existingIndex >= 0) {
        // Update existing item
        if (item.type === 'weight') {
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            weight: (newItems[existingIndex].weight || 0) + (item.weight || 0),
            // Update flash sale info if provided
            ...(item.flashSale && { flashSale: item.flashSale }),
          };
        } else {
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: newItems[existingIndex].quantity + item.quantity,
            // Update flash sale info if provided
            ...(item.flashSale && { flashSale: item.flashSale }),
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
          weight: item.weight,
          // Include flash sale info if provided
          ...(item.flashSale && { flashSale: item.flashSale }),
        });
      }

      const { totalItems, totalAmount } = calculateTotals(newItems);

      // Clear cache since we're updating
      clearCartCache();

      return {
        ...state,
        items: newItems,
        totalItems,
        totalAmount,
        loading: false,
        error: undefined,
      };
    });

    // Then sync with server in background (don't block UI)
    try {
      let res;
      if (item.type === 'weight') {
        res = await apiAddToCart(
          String(item.id),
          undefined,
          item.unit,
          item.weight,
          'weight',
          item.flashSale
        );
      } else {
        res = await apiAddToCart(
          String(item.id),
          item.quantity,
          item.unit,
          undefined,
          'count',
          item.flashSale
        );
      }

      if (res.success) {
        // Update cache with current state
        const currentState = get();
        setCartCache(currentState.items);

        // Show success notification
        useNewToastStore
          .getState()
          .showSuccess('Thành công!', `Đã thêm "${item.name}" vào giỏ hàng`, 3000, [
            {
              label: 'Xem giỏ hàng',
              action: () => {
                window.location.href = '/mycart';
              },
            },
          ]);

        // Auto scroll to top when item is added to cart (from any page)
        if (window.location.pathname !== '/mycart') {
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 500);
        }
      } else if ((res as any)?.requireLogin) {
        // Guest user - sync with localStorage
        const currentState = get();
        setGuestCart(currentState.items);
      } else {
        // API error - revert optimistic update by refetching
        await get().fetchCart(true); // Force refresh
        set({ error: res.message || 'Lỗi thêm sản phẩm' });
      }
    } catch (err: any) {
      // Revert optimistic update on error
      await get().fetchCart(true); // Force refresh
      set({ error: err.message || 'Lỗi thêm sản phẩm' });
    }
  },
  updateQuantity: async (
    productId: string | number,
    value: number,
    unit?: string,
    type?: 'count' | 'weight',
    flashSale?: any
  ) => {
    // ...existing code...
    // Find the item to get its flashSale info first (include flashSaleId in matching)

    // Optimistic update - update UI immediately
    set(state => {
      const newItems = state.items.map(item => {
        if (
          String(item.id) === String(productId) &&
          item.unit === unit &&
          item.type === type &&
          ((item.flashSale?.isFlashSale &&
            flashSale?.isFlashSale &&
            String(item.flashSale?.flashSaleId) === String(flashSale?.flashSaleId)) ||
            (!item.flashSale?.isFlashSale && !flashSale?.isFlashSale))
        ) {
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
        error: undefined,
      };
    });

    // Then sync with server in background
    try {
      let res;
      if (type === 'weight') {
        res = await updateCartItem(String(productId), undefined, unit, value, 'weight', flashSale);
      } else {
        res = await updateCartItem(String(productId), value, unit, undefined, 'count', flashSale);
      }
      // Không fetch lại cart sau thao tác
      if ((res as any)?.requireLogin) {
        // Guest user - sync with localStorage
        const currentState = get();
        setGuestCart(currentState.items);
      } else if (!res.success) {
        set({ error: res.message || 'Lỗi cập nhật số lượng' });
      }
    } catch (err: any) {
      // Revert optimistic update on error
      set({ error: err.message || 'Lỗi cập nhật số lượng' });
    }
  },
  removeFromCart: async (
    productId: string | number,
    unit?: string,
    type?: 'count' | 'weight',
    flashSale?: any
  ) => {
    // ...existing code...
    // Find the item to get its flashSale info before removing (include flashSaleId in matching)

    // Optimistic update - update UI immediately
    set(state => {
      const newItems = state.items.filter(item => {
        const match =
          String(item.id) === String(productId) &&
          item.unit === unit &&
          item.type === type &&
          ((item.flashSale?.isFlashSale &&
            flashSale?.isFlashSale &&
            String(item.flashSale?.flashSaleId) === String(flashSale?.flashSaleId)) ||
            (!item.flashSale?.isFlashSale && !flashSale?.isFlashSale));
        return !match;
      });
      const { totalItems, totalAmount } = calculateTotals(newItems);
      return {
        ...state,
        items: newItems,
        totalItems,
        totalAmount,
        loading: false,
        error: undefined,
      };
    });

    // Then sync with server in background
    try {
      const res = await removeCartItem(String(productId), unit, type, flashSale);
      // Không fetch lại cart sau thao tác
      if ((res as any)?.requireLogin) {
        // Guest user - sync with localStorage
        const currentState = get();
        setGuestCart(currentState.items);
      } else if (!res.success) {
        set({ error: res.message || 'Lỗi xóa sản phẩm' });
      }
    } catch (err: any) {
      // Revert optimistic update on error
      set({ error: err.message || 'Lỗi xóa sản phẩm' });
    }
  },
  clearCart: async () => {
    try {
      set({ loading: true, error: undefined });
      // Lấy userId từ store nếu có
      let userId: string | undefined;
      try {
        const { useUserStore } = await import('./useUserStore');
        const user = useUserStore.getState().user;
        userId = user?.id;
      } catch (e) {
        userId = undefined;
      }
      // Gọi API backend để clear cart nếu là user
      let apiResult;
      try {
        apiResult = await import('../services/cartService')
          .then(m => m.clearCart(userId))
          .catch(() => null);
        if (apiResult && apiResult.success) {
          console.log('[DEBUG][useCartStore] clearCart: Backend clear thành công', apiResult);
        } else {
          console.warn(
            '[DEBUG][useCartStore] clearCart: Backend clear thất bại hoặc không trả về success',
            apiResult
          );
        }
      } catch (apiError) {
        console.error('[DEBUG][useCartStore] clearCart: Lỗi gọi API backend', apiError);
      }
      // Luôn clear guest cart và local state
      clearGuestCart();
      set({ items: [], totalItems: 0, totalAmount: 0, loading: false });
    } catch (err: any) {
      console.error('Clear cart error:', err);
      clearGuestCart();
      set({
        items: [],
        totalItems: 0,
        totalAmount: 0,
        error: err.message || 'Lỗi xóa giỏ hàng',
        loading: false,
      });
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

      // Notify success
      useNewToastStore.getState().showSuccess('Đồng bộ giỏ hàng thành công', '', 3000);
    } catch (error) {
      console.error('Failed to sync guest cart:', error);
    }
  },
}));
