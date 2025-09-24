const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface WishlistResponse {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  originalPrice?: number;
  discount?: number;
  inStock: boolean;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export const WishlistService = {
  // Lấy danh sách wishlist của user
  async getUserWishlist(userId: number): Promise<WishlistResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/wishlist`);
      const result: ApiResponse<WishlistResponse[]> = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Không thể tải danh sách yêu thích');
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw error;
    }
  },

  // Thêm sản phẩm vào wishlist
  async addToWishlist(
    userId: number,
    productData: {
      productId: string;
      productName: string;
      productImage: string;
      productPrice: number;
      originalPrice?: number;
      discount?: number;
      inStock: boolean;
      category: string;
    }
  ): Promise<WishlistResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const result: ApiResponse<WishlistResponse> = await response.json();

      if (result.success) {
        return result.data;
      } else {
        // Nếu sản phẩm đã có trong wishlist (409 Conflict), ném lỗi đặc biệt
        if (response.status === 409) {
          throw new Error('Product already in wishlist');
        }
        throw new Error(result.error || 'Không thể thêm vào danh sách yêu thích');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  },

  // Xóa sản phẩm khỏi wishlist
  async removeFromWishlist(userId: number, productId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/wishlist/${productId}`, {
        method: 'DELETE',
      });

      const result: ApiResponse<void> = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Không thể xóa khỏi danh sách yêu thích');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  },

  // Xóa toàn bộ wishlist
  async clearWishlist(userId: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/wishlist`, {
        method: 'DELETE',
      });

      const result: ApiResponse<void> = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Không thể xóa danh sách yêu thích');
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      throw error;
    }
  },

  // Kiểm tra sản phẩm có trong wishlist không
  async checkInWishlist(userId: number, productId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/wishlist/${productId}/check`);
      const result: ApiResponse<{ inWishlist: boolean }> = await response.json();

      if (result.success) {
        return result.data.inWishlist;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error checking wishlist:', error);
      return false;
    }
  },
};
