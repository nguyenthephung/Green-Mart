import { useEffect } from 'react';
import { useUserStore } from '../stores/useUserStore';
import { useWishlistStore } from '../stores/useWishlistStore';
import { useCartStore } from '../stores/useCartStore';

/**
 * Hook để tự động sync dữ liệu khi user thay đổi
 */
export const useAuthSync = () => {
  const user = useUserStore(state => state.user);
  const initializeWishlist = useWishlistStore(state => state.initializeWishlist);
  const syncGuestCartToServer = useCartStore(state => state.syncGuestCartToServer);
  const fetchCart = useCartStore(state => state.fetchCart);

  useEffect(() => {
    const syncUserData = async () => {
      if (user?.id) {
        // User đã đăng nhập - sync wishlist và cart
        try {
          await Promise.all([initializeWishlist(), syncGuestCartToServer(), fetchCart()]);
        } catch (error) {
          console.error('Error syncing user data:', error);
        }
      } else {
        // User đăng xuất - clear wishlist
        await initializeWishlist();
      }
    };

    syncUserData();
  }, [user?.id, initializeWishlist, syncGuestCartToServer, fetchCart]);

  return { user };
};
