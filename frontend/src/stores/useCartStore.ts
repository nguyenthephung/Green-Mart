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

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalAmount: 0,

      addToCart: (newItem) => {
        const state = get();
        const existingItem = state.items.find(item => item.id === newItem.id);
        
        let updatedItems: CartItem[];
        if (existingItem) {
          updatedItems = state.items.map(item =>
            item.id === newItem.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          updatedItems = [...state.items, { ...newItem, quantity: 1 }];
        }

        const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = updatedItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

        set({
          items: updatedItems,
          totalItems,
          totalAmount
        });
      },

      removeFromCart: (id) => {
        const state = get();
        const updatedItems = state.items.filter(item => item.id !== id);
        const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = updatedItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

        set({
          items: updatedItems,
          totalItems,
          totalAmount
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(id);
          return;
        }

        const state = get();
        const updatedItems = state.items.map(item =>
          item.id === id
            ? { ...item, quantity }
            : item
        );

        const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = updatedItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

        set({
          items: updatedItems,
          totalItems,
          totalAmount
        });
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalAmount: 0
        });
      },

      getCartCount: () => {
        return get().totalItems;
      },

      getItemQuantity: (id) => {
        const item = get().items.find(item => item.id === id);
        return item?.quantity || 0;
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
