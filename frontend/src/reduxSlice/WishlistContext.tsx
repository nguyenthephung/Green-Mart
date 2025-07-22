import React, { createContext, useContext, useState, useEffect } from 'react';
import { WishlistService } from '../services/wishlistService';
import { useUserStore } from '../stores/useUserStore';
import type { WishlistItem, WishlistContextType } from '../types/Wishlist';

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: React.ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUserStore();

  // Load wishlist khi user thay đổi
  useEffect(() => {
    if (user?.id) {
      loadWishlist();
    } else {
      setItems([]);
    }
  }, [user?.id]);

  const loadWishlist = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      const wishlistData = await WishlistService.getUserWishlist(parseInt(user.id));
      
      const convertedItems: WishlistItem[] = wishlistData.map(item => ({
        id: item.id,
        productId: item.productId,
        userId: item.userId,
        productName: item.productName,
        productImage: item.productImage,
        productPrice: item.productPrice,
        originalPrice: item.originalPrice,
        discount: item.discount,
        inStock: item.inStock,
        category: item.category,
        addedAt: new Date(item.createdAt)
      }));

      setItems(convertedItems);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setError('Không thể tải danh sách yêu thích');
    } finally {
      setIsLoading(false);
    }
  };

  const addToWishlist = async (product: any) => {
    if (!user?.id) {
      setError('Vui lòng đăng nhập để sử dụng tính năng này');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const productData = {
        productId: product.id.toString(),
        productName: product.name,
        productImage: product.image,
        productPrice: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount,
        inStock: product.inStock !== false,
        category: product.category || 'Khác'
      };

      const newItem = await WishlistService.addToWishlist(parseInt(user.id), productData);
      
      const wishlistItem: WishlistItem = {
        id: newItem.id,
        productId: newItem.productId,
        userId: newItem.userId,
        productName: newItem.productName,
        productImage: newItem.productImage,
        productPrice: newItem.productPrice,
        originalPrice: newItem.originalPrice,
        discount: newItem.discount,
        inStock: newItem.inStock,
        category: newItem.category,
        addedAt: new Date(newItem.createdAt)
      };

      setItems(prev => [wishlistItem, ...prev]);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      setError('Không thể thêm vào danh sách yêu thích');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      await WishlistService.removeFromWishlist(parseInt(user.id), productId);
      setItems(prev => prev.filter(item => item.productId !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setError('Không thể xóa khỏi danh sách yêu thích');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearWishlist = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      await WishlistService.clearWishlist(parseInt(user.id));
      setItems([]);
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      setError('Không thể xóa danh sách yêu thích');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return items.some(item => item.productId === productId);
  };

  const getWishlistCount = (): number => {
    return items.length;
  };

  const value: WishlistContextType = {
    items,
    isLoading,
    error,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    getWishlistCount,
    loadWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistProvider;
