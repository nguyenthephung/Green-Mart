import { authAPI, tokenManager } from './api';
import type { LoginData, RegisterData, User, ApiResponse, AuthResponse } from './api';

export type { LoginData, RegisterData, User };

export interface AuthResult {
  success: boolean;
  data?: {
    token: string;
    user: User;
  };
  message: string;
  errors?: Record<string, string>;
}

export const authService = {
  login: async (data: LoginData): Promise<AuthResult> => {
    try {
      console.log('Attempting login with:', { email: data.email });

      const response: ApiResponse<AuthResponse> = await authAPI.login(data);

      console.log('Login response:', response);

      if (response.success && response.data) {
        return {
          success: response.success,
          data: {
            token: response.data.token,
            user: response.data.user,
          },
          message: response.message || 'Đăng nhập thành công',
        };
      } else {
        return {
          success: false,
          message: response.message || 'Đăng nhập thất bại',
          errors: response.errors,
        };
      }
    } catch (error: any) {
      console.error('Login service error:', error);
      return {
        success: false,
        message: error.message || 'Lỗi đăng nhập. Vui lòng thử lại.',
      };
    }
  },

  register: async (data: RegisterData): Promise<AuthResult> => {
    try {
      console.log('Attempting register with:', {
        name: data.name,
        email: data.email,
        phone: data.phone,
      });

      const response: ApiResponse<AuthResponse> = await authAPI.register(data);

      console.log('Register response:', response);

      if (response.success && response.data) {
        return {
          success: response.success,
          data: {
            token: response.data.token,
            user: response.data.user,
          },
          message: response.message || 'Đăng ký thành công',
        };
      } else {
        return {
          success: false,
          message: response.message || 'Đăng ký thất bại',
          errors: response.errors,
        };
      }
    } catch (error: any) {
      console.error('Register service error:', error);
      return {
        success: false,
        message: error.message || 'Lỗi đăng ký. Vui lòng thử lại.',
      };
    }
  },

  getProfile: async (): Promise<{ success: boolean; data?: User; message: string }> => {
    try {
      const response: ApiResponse<User> = await authAPI.getProfile();
      return {
        success: response.success,
        data: response.data,
        message: response.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Lỗi lấy thông tin người dùng',
      };
    }
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await authAPI.logout();
      tokenManager.remove();
      return {
        success: response.success,
        message: response.message,
      };
    } catch (error: any) {
      // Vẫn remove token local dù API lỗi
      tokenManager.remove();
      return {
        success: true,
        message: 'Đăng xuất thành công',
      };
    }
  },
};
