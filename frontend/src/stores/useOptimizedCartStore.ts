import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

  // Actions
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
  getItemQuantity: (id: number) => number;
}

// Helper function để tính totals - moved outside for performance
const calculateTotals = (items: CartItem[]) => {
  let totalItems = 0;
  let totalAmount = 0;

  for (const item of items) {
    totalItems += item.quantity;
    totalAmount += Number(item.price) * item.quantity;
  }

  return { totalItems, totalAmount };
};

export const useOptimizedCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalAmount: 0,

      addToCart: newItem => {
        const state = get();
        const existingItemIndex = state.items.findIndex(item => item.id === newItem.id);

        let updatedItems: CartItem[];

        if (existingItemIndex >= 0) {
          // Update existing item
          updatedItems = [...state.items];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + 1,
          };
        } else {
          // Add new item
          updatedItems = [...state.items, { ...newItem, quantity: 1 }];
        }

        const { totalItems, totalAmount } = calculateTotals(updatedItems);

        set({
          items: updatedItems,
          totalItems,
          totalAmount,
        });
      },

      removeFromCart: id => {
        const state = get();
        const updatedItems = state.items.filter(item => item.id !== id);
        const { totalItems, totalAmount } = calculateTotals(updatedItems);

        set({
          items: updatedItems,
          totalItems,
          totalAmount,
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(id);
          return;
        }

        const state = get();
        const updatedItems = state.items.map(item =>
          item.id === id ? { ...item, quantity } : item
        );

        const { totalItems, totalAmount } = calculateTotals(updatedItems);

        set({
          items: updatedItems,
          totalItems,
          totalAmount,
        });
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalAmount: 0,
        });
      },

      getCartCount: () => {
        return get().totalItems;
      },

      getItemQuantity: id => {
        const item = get().items.find(item => item.id === id);
        return item?.quantity || 0;
      },
    }),
    {
      name: 'cart-storage',
      version: 1,
    }
  )
);
