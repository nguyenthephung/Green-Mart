import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Voucher } from '../types/Voucher';
import { authAPI, tokenManager, type User, type LoginData, type RegisterData } from '../services/api';

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
  // Existing properties
  userInfo: UserInfo;
  setUserInfo: (info: UserInfo) => void;
  addresses: AddressInfo[];
  setAddresses: (addresses: AddressInfo[]) => void;
  payments: PaymentInfo[];
  setPayments: (payments: PaymentInfo[]) => void;
  voucher: Voucher | null;
  setVoucher: (voucher: Voucher | null) => void;
  
  // New auth properties
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Auth functions
  login: (credentials: LoginData) => Promise<{ success: boolean; message: string; errors?: any }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message: string; errors?: any }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const defaultUserInfo: UserInfo = {
  fullName: '',
  email: '',
  phone: '',
  avatar: ''
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  // Existing state
  const [userInfo, setUserInfo] = useState<UserInfo>(() => {
    const stored = localStorage.getItem('userInfo');
    return stored ? JSON.parse(stored) : defaultUserInfo;
  });
  const [addresses, setAddresses] = useState<AddressInfo[]>(() => {
    const stored = localStorage.getItem('addresses');
    return stored ? JSON.parse(stored) : [];
  });
  const [payments, setPayments] = useState<PaymentInfo[]>(() => {
    const stored = localStorage.getItem('payments');
    return stored ? JSON.parse(stored) : [];
  });
  const [voucher, setVoucher] = useState<Voucher | null>(() => {
    const stored = localStorage.getItem('voucher');
    return stored ? JSON.parse(stored) : null;
  });

  // New auth state
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Auth functions
  const login = async (credentials: LoginData) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(credentials);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Save token
        tokenManager.set(token);
        
        // Update state
        setUser(user);
        setIsAuthenticated(true);
        
        // Sync with userInfo for compatibility
        setUserInfo({
          fullName: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar || ''
        });
        
        return { success: true, message: response.message };
      } else {
        return { 
          success: false, 
          message: response.message || 'Đăng nhập thất bại',
          errors: response.errors 
        };
      }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Lỗi kết nối server',
        errors: error 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(userData);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Save token
        tokenManager.set(token);
        
        // Update state
        setUser(user);
        setIsAuthenticated(true);
        
        // Sync with userInfo for compatibility
        setUserInfo({
          fullName: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar || ''
        });
        
        return { success: true, message: response.message };
      } else {
        return { 
          success: false, 
          message: response.message || 'Đăng ký thất bại',
          errors: response.errors 
        };
      }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Lỗi kết nối server',
        errors: error 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state
      tokenManager.remove();
      setUser(null);
      setIsAuthenticated(false);
      setUserInfo(defaultUserInfo);
      localStorage.removeItem('userInfo');
    }
  };

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      
      if (!tokenManager.exists()) {
        setIsAuthenticated(false);
        return;
      }

      const response = await authAPI.getProfile();
      
      if (response.success && response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
        
        // Sync with userInfo for compatibility
        setUserInfo({
          fullName: response.data.name,
          email: response.data.email,
          phone: response.data.phone,
          avatar: response.data.avatar || ''
        });
      } else {
        // Token invalid
        tokenManager.remove();
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      tokenManager.remove();
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Existing useEffects
  useEffect(() => {
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
  }, [userInfo]);
  
  useEffect(() => {
    localStorage.setItem('addresses', JSON.stringify(addresses));
  }, [addresses]);
  
  useEffect(() => {
    localStorage.setItem('payments', JSON.stringify(payments));
  }, [payments]);
  
  useEffect(() => {
    localStorage.setItem('voucher', JSON.stringify(voucher));
  }, [voucher]);

  return (
    <UserContext.Provider value={{ 
      // Existing properties
      userInfo, 
      setUserInfo, 
      addresses, 
      setAddresses, 
      payments, 
      setPayments, 
      voucher, 
      setVoucher,
      // New auth properties
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      checkAuth
    }}>
      {children}
    </UserContext.Provider>
  );
};
