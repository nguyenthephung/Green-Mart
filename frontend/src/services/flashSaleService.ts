import type { 
  FlashSale, 
  FlashSaleResponse, 
  CreateFlashSaleRequest, 
  ProductFlashSaleInfo 
} from '../types/FlashSale';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class FlashSaleService {
  // Public methods (không cần auth)
  async getActiveFlashSales(): Promise<FlashSale[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/flash-sales/active`);
      const data: FlashSaleResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch active flash sales');
      }
      
      return Array.isArray(data.data) ? data.data : [];
    } catch (error) {
      console.error('Error fetching active flash sales:', error);
      throw error;
    }
  }

  async getUpcomingFlashSales(): Promise<FlashSale[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/flash-sales/upcoming`);
      const data: FlashSaleResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch upcoming flash sales');
      }
      
      return Array.isArray(data.data) ? data.data : [];
    } catch (error) {
      console.error('Error fetching upcoming flash sales:', error);
      throw error;
    }
  }

  async checkProductInFlashSale(productId: string): Promise<ProductFlashSaleInfo> {
    try {
      const response = await fetch(`${API_BASE_URL}/flash-sales/check-product/${productId}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to check product in flash sale');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error checking product in flash sale:', error);
      throw error;
    }
  }

  // Admin methods (cần auth token)
  async getAllFlashSales(page = 1, limit = 10): Promise<FlashSaleResponse> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/flash-sales?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data: FlashSaleResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch flash sales');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching all flash sales:', error);
      throw error;
    }
  }

  async createFlashSale(flashSaleData: CreateFlashSaleRequest): Promise<FlashSale> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/flash-sales`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(flashSaleData)
      });

      const data: FlashSaleResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to create flash sale');
      }
      
      return data.data as FlashSale;
    } catch (error) {
      console.error('Error creating flash sale:', error);
      throw error;
    }
  }

  async updateFlashSale(id: string, flashSaleData: Partial<CreateFlashSaleRequest>): Promise<FlashSale> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/flash-sales/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(flashSaleData)
      });

      const data: FlashSaleResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to update flash sale');
      }
      
      return data.data as FlashSale;
    } catch (error) {
      console.error('Error updating flash sale:', error);
      throw error;
    }
  }

  async deleteFlashSale(id: string): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/flash-sales/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete flash sale');
      }
    } catch (error) {
      console.error('Error deleting flash sale:', error);
      throw error;
    }
  }

  async toggleFlashSaleStatus(id: string): Promise<FlashSale> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/flash-sales/${id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data: FlashSaleResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to toggle flash sale status');
      }
      
      return data.data as FlashSale;
    } catch (error) {
      console.error('Error toggling flash sale status:', error);
      throw error;
    }
  }
}

export const flashSaleService = new FlashSaleService();
export default flashSaleService;
