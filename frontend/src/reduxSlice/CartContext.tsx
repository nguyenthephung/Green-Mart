import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useUser } from './UserContext';

export interface CartItem {
  id: number;
  name: string;
  price: number | string;
  image: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeFromCart: (id: number) => void;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const [cart, setCart] = useState<CartItem[]>(() => {
    const cartKey = user ? `cart_${user.id}` : 'cart_guest';
    const stored = localStorage.getItem(cartKey);
    return stored ? JSON.parse(stored) : [];
  });

  // Update cart when user changes
  useEffect(() => {
    const cartKey = user ? `cart_${user.id}` : 'cart_guest';
    const stored = localStorage.getItem(cartKey);
    setCart(stored ? JSON.parse(stored) : []);
  }, [user]);

  // Lưu cart vào localStorage mỗi khi cart thay đổi
  useEffect(() => {
    const cartKey = user ? `cart_${user.id}` : 'cart_guest';
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, user]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    
    setCart((prev) => {
      const found = prev.find((i) => i.id === item.id);
      let updated;
      if (found) {
        updated = prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        updated = [...prev, { ...item, price: String(item.price), quantity: 1 }];
      }
      return updated;
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    setCart((prev) => {
      const updated = prev
        .map((i) => (i.id === id ? { ...i, quantity: quantity } : i))
        .filter((i) => i.quantity > 0);
      return updated;
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      return updated;
    });
  };

  const getCartCount = () => cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQuantity, removeFromCart, getCartCount }}
    >
      {children}
    </CartContext.Provider>
  );
};
