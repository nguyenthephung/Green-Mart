import type { UserAddress } from '../components/Guest/Account/AddressSelector';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface AddressResponse {
  id: string; // MongoDB _id là string
  userId: string;
  fullName: string;
  phone: string;
  city?: string;
  district: string;
  ward: string;
  street: string;
  latitude?: number;
  longitude?: number;
  isSelected: boolean;
  label: string;
  address: string;
  wardName: string;
  districtName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

export class AddressService {
  // Lấy tất cả địa chỉ của user
  static async getUserAddresses(userId: string): Promise<AddressResponse[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users/${userId}/addresses`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });
      const result: ApiResponse<AddressResponse[]> = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Lỗi khi lấy danh sách địa chỉ');
      }

      return result.data || [];
    } catch (error) {
      console.error('Error fetching addresses:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Không thể kết nối đến server');
    }
  }

  // Tạo địa chỉ mới
  static async createAddress(userId: string, addressData: UserAddress): Promise<AddressResponse> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users/${userId}/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(addressData),
      });
      
      const result: ApiResponse<AddressResponse> = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Lỗi khi tạo địa chỉ mới');
      }
      
      return result.data!;
    } catch (error) {
      console.error('Error creating address:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Không thể kết nối đến server');
    }
  }

  // Cập nhật địa chỉ
  static async updateAddress(userId: string, addressId: string, addressData: Partial<UserAddress>): Promise<AddressResponse> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users/${userId}/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(addressData),
      });
      
      const result: ApiResponse<AddressResponse> = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Lỗi khi cập nhật địa chỉ');
      }
      
      return result.data!;
    } catch (error) {
      console.error('Error updating address:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Không thể kết nối đến server');
    }
  }

  // Xóa địa chỉ
  static async deleteAddress(userId: string, addressId: string): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users/${userId}/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });
      
      if (!response.ok) {
        const result: ApiResponse<void> = await response.json();
        throw new Error(result.message || 'Lỗi khi xóa địa chỉ');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Không thể kết nối đến server');
    }
  }

  // Đặt làm địa chỉ mặc định
  static async setDefaultAddress(userId: string, addressId: string): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users/${userId}/addresses/${addressId}/default`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });
      
      if (!response.ok) {
        const result: ApiResponse<void> = await response.json();
        throw new Error(result.message || 'Lỗi khi đặt địa chỉ mặc định');
      }
      
      const result: ApiResponse<void> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Lỗi khi đặt địa chỉ mặc định');
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Không thể kết nối đến server');
    }
  }
}
