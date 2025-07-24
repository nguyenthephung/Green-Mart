import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService, type User } from '../services/authService';
import { tokenManager } from '../services/api';

export type { User };

export interface UserInfo {
  avatar: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface AddressInfo {
  phone: ReactNode;
  fullName: string;
  wardName: string;
  id: number;
  label: string;
  address: string;
  district: string;
  ward: string;
  street: string;
  latitude: number;
  longitude: number;
  isSelected: boolean;
}

export interface PaymentInfo {
  id: number;
  method: string;
  expiry: string;
  isSelected: boolean;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; message: string; errors?: any }>;
  register: (data: { name: string; email: string; phone: string; password: string }) => Promise<{ success: boolean; message: string; errors?: any }>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = tokenManager.get();
      if (token) {
        const response = await authService.getProfile();
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          tokenManager.remove();
          setUser(null);
        }
      }
    } catch (error) {
      tokenManager.remove();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      setIsLoading(true);
      
      const response = await authService.login(credentials);
      
      if (response.success && response.data) {
        tokenManager.set(response.data.token);
        setUser(response.data.user);
        
        return {
          success: true,
          message: response.message
        };
      } else {
        return {
          success: false,
          message: response.message,
          errors: response.errors
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Lỗi kết nối. Vui lòng thử lại.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; phone: string; password: string }) => {
    try {
      setIsLoading(true);
      
      const response = await authService.register(data);
      
      if (response.success && response.data) {
        tokenManager.set(response.data.token);
        setUser(response.data.user);
        
        return {
          success: true,
          message: response.message
        };
      } else {
        return {
          success: false,
          message: response.message,
          errors: response.errors
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Lỗi kết nối. Vui lòng thử lại.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Ignore error, just logout locally
      console.error('Logout API error:', error);
    } finally {
      // Always clear local state regardless of API response
      tokenManager.remove();
      setUser(null);
    }
  };

  const value: UserContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    setUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
