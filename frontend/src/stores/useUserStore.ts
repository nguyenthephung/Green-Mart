import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';
import type { User } from '../services/authService';
import { tokenManager } from '../services/api';
import type { Voucher } from '../types/Voucher';
import type { UserInfo, AddressInfo, PaymentInfo } from '../reduxSlice/UserContext';

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
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setUserInfo: (userInfo: UserInfo | null) => void;
  setAddresses: (addresses: AddressInfo[]) => void;
  setPayments: (payments: PaymentInfo[]) => void;
  setVoucher: (voucher: Voucher | null) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      userInfo: null,
      addresses: [],
      payments: [
        { id: 1, method: 'cod', expiry: '', isSelected: true },
        { id: 2, method: 'bank', expiry: '', isSelected: false },
        { id: 3, method: 'momo', expiry: '', isSelected: false },
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
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false 
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
          tokenManager.remove();
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false 
          });
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
