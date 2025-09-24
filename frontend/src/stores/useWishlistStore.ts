import { create } from 'zustand';
import { WishlistService } from '../services/wishlistService';
import type { WishlistItem } from '../types/Wishlist';
import { useUserStore } from './useUserStore';
import { useNewToastStore } from './useNewToastStore';

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  error: string | null;
  loadWishlist: () => Promise<void>;
  addToWishlist: (product: any) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  getWishlistCount: () => number;
  initializeWishlist: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  initializeWishlist: async () => {
    const user = useUserStore.getState().user;
    if (user?.id) {
      await get().loadWishlist();
    } else {
      set({ items: [] }); // Clear wishlist if no user
    }
  },

  loadWishlist: async () => {
    const user = useUserStore.getState().user;
    if (!user?.id) return;
    set({ isLoading: true, error: null });
    try {
      const wishlistData = await WishlistService.getUserWishlist(parseInt(user.id));
      const convertedItems: WishlistItem[] = wishlistData.map((item: any) => ({
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
        addedAt: new Date(item.createdAt),
      }));
      set({ items: convertedItems });
    } catch (error) {
      set({ error: 'Không thể tải danh sách yêu thích' });
    } finally {
      set({ isLoading: false });
    }
  },

  addToWishlist: async (product: any) => {
    const user = useUserStore.getState().user;
    if (!user?.id) {
      set({ error: 'Vui lòng đăng nhập để sử dụng tính năng này' });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const productData = {
        productId: product.id.toString(),
        productName: product.name,
        productImage: product.image,
        productPrice: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount,
        inStock: product.inStock !== false,
        category: product.category || 'Khác',
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
        addedAt: new Date(newItem.createdAt),
      };
      set(prev => ({ items: [wishlistItem, ...prev.items] }));

      // Show success notification
      useNewToastStore
        .getState()
        .showSuccess('Thành công!', `Đã thêm "${product.name}" vào danh sách yêu thích`, 5000, [
          {
            label: 'Xem wishlist',
            action: () => {
              window.location.href = '/wishlist';
            },
          },
        ]);
    } catch (error: any) {
      // Nếu sản phẩm đã có trong wishlist, không hiển thị lỗi
      if (error.message === 'Product already in wishlist') {
        // Show info notification
        useNewToastStore
          .getState()
          .showInfo('Thông báo', `"${product.name}" đã có trong danh sách yêu thích`, 3000);
        // Load lại wishlist để đồng bộ trạng thái
        await get().loadWishlist();
      } else {
        set({ error: 'Không thể thêm vào danh sách yêu thích' });
        throw error;
      }
    } finally {
      set({ isLoading: false });
    }
  },

  removeFromWishlist: async (productId: string) => {
    const user = useUserStore.getState().user;
    if (!user?.id) return;

    // Find the product name before removing
    const productToRemove = get().items.find(item => item.productId === productId);
    const productName = productToRemove?.productName || 'Sản phẩm';

    set({ isLoading: true, error: null });
    try {
      await WishlistService.removeFromWishlist(parseInt(user.id), productId);
      set(prev => ({ items: prev.items.filter(item => item.productId !== productId) }));

      // Show success notification
      useNewToastStore
        .getState()
        .showSuccess('Đã xóa!', `Đã xóa "${productName}" khỏi danh sách yêu thích`, 3000);
    } catch (error) {
      set({ error: 'Không thể xóa khỏi danh sách yêu thích' });
      // Show error notification
      useNewToastStore
        .getState()
        .showError('Lỗi!', 'Không thể xóa sản phẩm khỏi danh sách yêu thích', 5000);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  clearWishlist: async () => {
    const user = useUserStore.getState().user;
    if (!user?.id) return;
    set({ isLoading: true, error: null });
    try {
      await WishlistService.clearWishlist(parseInt(user.id));
      set({ items: [] });

      // Show success notification
      useNewToastStore
        .getState()
        .showSuccess('Đã xóa!', 'Đã xóa toàn bộ danh sách yêu thích', 3000);
    } catch (error) {
      set({ error: 'Không thể xóa danh sách yêu thích' });
      // Show error notification
      useNewToastStore.getState().showError('Lỗi!', 'Không thể xóa danh sách yêu thích', 5000);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  isInWishlist: (productId: string) => {
    return get().items.some(item => item.productId === productId);
  },

  getWishlistCount: () => {
    return get().items.length;
  },
}));
