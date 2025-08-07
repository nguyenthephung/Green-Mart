import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';
import type { User } from '../services/authService';
import { tokenManager } from '../services/api';

import type { AddressInfo, Voucher } from '../types/User';

// Define types locally (from CheckoutSummary/CheckoutMain)
export interface UserInfo {
  fullName: string;
  phone: string;
  email?: string;
}



export interface PaymentInfo {
  id: number;
  method: string;
  isSelected: boolean;
  expiry?: string;
}

interface UserState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  addresses: AddressInfo[];
  payments: PaymentInfo[];
  voucher: Voucher | null;
  
  // Actions
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; errors?: any }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; message: string; errors?: any }>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setUserInfo: (userInfo: UserInfo | null) => void;
  setAddresses: (addresses: AddressInfo[]) => void;
  setPayments: (payments: PaymentInfo[]) => void;
  setVoucher: (voucher: Voucher | null) => void;
  updateProfile: (data: any) => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,  // Tắt loading mặc định
      isAuthenticated: false,
      userInfo: null,
      addresses: [],
      payments: [
        { id: 1, method: 'cod', expiry: '', isSelected: false },
        { id: 2, method: 'bank_transfer', expiry: '', isSelected: false },
        { id: 3, method: 'momo', expiry: '', isSelected: false },
        { id: 4, method: 'credit_card', expiry: '', isSelected: false },
      ],
      voucher: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authService.login({ email, password });
          if (response.success && response.data) {
            // Lưu token vào localStorage
            tokenManager.set(response.data.token);
            
            set({ 
              user: response.data.user, 
              isAuthenticated: true,
              isLoading: false 
            });
            
            // Fetch cart after successful login
            try {
              const { useCartStore } = await import('./useCartStore');
              const cartStore = useCartStore.getState();
              
              // First sync guest cart to server if exists
              await cartStore.syncGuestCartToServer();
              
              // Then fetch the updated cart
              await cartStore.fetchCart();
            } catch (cartError) {
              console.error('Error handling cart after login:', cartError);
            }
            
            return {
              success: true,
              message: response.message
            };
          } else {
            set({ isLoading: false });
            return {
              success: false,
              message: response.message,
              errors: response.errors
            };
          }
        } catch (error: any) {
          set({ isLoading: false });
          return {
            success: false,
            message: error.message || 'Lỗi kết nối. Vui lòng thử lại.'
          };
        }
      },

      register: async (name: string, email: string, password: string, phone?: string) => {
        set({ isLoading: true });
        try {
          const response = await authService.register({ name, email, password, phone: phone || '' });
          if (response.success && response.data) {
            // Lưu token vào localStorage
            tokenManager.set(response.data.token);
            
            set({ 
              user: response.data.user, 
              isAuthenticated: true,
              isLoading: false 
            });
            
            // Fetch cart after successful register
            try {
              const { useCartStore } = await import('./useCartStore');
              const cartStore = useCartStore.getState();
              
              // First sync guest cart to server if exists
              await cartStore.syncGuestCartToServer();
              
              // Then fetch the updated cart
              await cartStore.fetchCart();
            } catch (cartError) {
              console.error('Error handling cart after register:', cartError);
            }
            
            return {
              success: true,
              message: response.message
            };
          } else {
            set({ isLoading: false });
            return {
              success: false,
              message: response.message,
              errors: response.errors
            };
          }
        } catch (error: any) {
          set({ isLoading: false });
          return {
            success: false,
            message: error.message || 'Lỗi kết nối. Vui lòng thử lại.'
          };
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          // Ignore error, just logout locally
        } finally {
          // Xóa token khỏi localStorage
          tokenManager.remove();
          
          // Clear cart khi logout - force clear both server and local state
          try {
            const { useCartStore } = await import('./useCartStore');
            const cartStore = useCartStore.getState();
            
            // Use immediate clear method for logout
            cartStore.clearAllCartData();
          } catch (error) {
            console.error('Error clearing cart on logout:', error);
          }

          // Clear guest info when user logs out
          try {
            const { useGuestStore } = await import('./useGuestStore');
            const guestStore = useGuestStore.getState();
            guestStore.clearGuestInfo();
          } catch (error) {
            console.error('Error clearing guest info on logout:', error);
          }
          
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false,
            addresses: [], // Clear addresses for guest users
            voucher: null  // Clear voucher for guest users
          });
        }
      },

      checkAuthStatus: async () => {
        set({ isLoading: true });
        try {
          const token = tokenManager.get();
          
          if (token) {
            const response = await authService.getProfile();
            
            if (response.success && response.data) {
              set({ 
                user: response.data, 
                isAuthenticated: true,
                isLoading: false 
              });
              
              // Fetch cart after successful auth check
              try {
                const { useCartStore } = await import('./useCartStore');
                const cartStore = useCartStore.getState();
                
                // First sync guest cart to server if exists
                await cartStore.syncGuestCartToServer();
                
                // Then fetch the updated cart
                await cartStore.fetchCart();
              } catch (cartError) {
                console.error('Error handling cart after auth check:', cartError);
              }
            } else {
              tokenManager.remove();
              set({ 
                user: null, 
                isAuthenticated: false,
                isLoading: false 
              });
            }
          } else {
            set({ 
              user: null, 
              isAuthenticated: false,
              isLoading: false 
            });
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          tokenManager.remove();
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false 
          });
        }
      },

      refreshUserData: async () => {
        try {
          const token = tokenManager.get();
          if (token) {
            const response = await authService.getProfile();
            if (response.success && response.data) {
              set({ user: response.data });
            }
          }
        } catch (error) {
          console.error('Failed to refresh user data:', error);
        }
      },

      setUser: (user: User | null) => set({ 
        user, 
        isAuthenticated: !!user 
      }),

      setLoading: (isLoading: boolean) => set({ isLoading }),

      setUserInfo: (userInfo: UserInfo | null) => set({ userInfo }),

      setAddresses: (addresses: AddressInfo[]) => set({ addresses }),

      setPayments: (payments: PaymentInfo[]) => set({ payments }),

      setVoucher: (voucher: Voucher | null) => set({ voucher }),
      
      updateProfile: async (data: any) => {
        set({ isLoading: true });
        try {
          // Sửa endpoint từ '/api/users/profile' thành '/api/auth/profile'
          const response = await fetch('/api/auth/profile', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${tokenManager.get()}`
            },
            body: JSON.stringify(data)
          });

          if (response.ok) {
            const updatedUser = await response.json();
            set(state => ({ 
              user: { ...state.user, ...updatedUser },
              isLoading: false 
            }));
          } else {
            const error = await response.json();
            throw new Error(error.message || 'Cập nhật thông tin thất bại');
          }
        } catch (error: any) {
          set({ isLoading: false });
          // For demo purposes, just update local state
          set(state => ({
            user: state.user ? { 
              ...state.user, 
              name: data.name || state.user.name,
              email: data.email || state.user.email,
              phone: data.phone || state.user.phone
            } : null
          }));
          
          // Re-throw for component to handle
          if (data.newPassword) {
            throw error; // Don't silently ignore password change errors
          }
        }
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        addresses: state.addresses,
        payments: state.payments,
        voucher: state.voucher,
        userInfo: state.userInfo
      }), // Persist user data, auth status và các thông tin khác
    }
  )
);
