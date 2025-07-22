import type { UserAddress } from '../components/Guest/Account/AddressSelector';

const API_BASE_URL = 'http://localhost:5000/api';

export interface AddressResponse {
  id: string; // MongoDB _id là string
  userId: number;
  fullName: string;
  phone: string;
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
  static async getUserAddresses(userId: number): Promise<AddressResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/addresses`);
      const result: ApiResponse<AddressResponse[]> = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Lỗi khi lấy danh sách địa chỉ');
      }
      
      return result.data || [];
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw error;
    }
  }

  // Tạo địa chỉ mới
  static async createAddress(userId: number, addressData: UserAddress): Promise<AddressResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      throw error;
    }
  }

  // Cập nhật địa chỉ
  static async updateAddress(userId: number, addressId: string, addressData: Partial<UserAddress>): Promise<AddressResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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
      throw error;
    }
  }

  // Xóa địa chỉ
  static async deleteAddress(userId: number, addressId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/addresses/${addressId}`, {
        method: 'DELETE',
      });
      
      const result: ApiResponse<void> = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Lỗi khi xóa địa chỉ');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  }

  // Đặt làm địa chỉ mặc định
  static async setDefaultAddress(userId: number, addressId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/addresses/${addressId}/default`, {
        method: 'PATCH',
      });
      
      const result: ApiResponse<void> = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Lỗi khi đặt địa chỉ mặc định');
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      throw error;
    }
  }
}
