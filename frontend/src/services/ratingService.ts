import { apiClient } from './api';

export interface Rating {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  productId: string;
  rating: number;
  review?: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRatingRequest {
  rating: number;
  review?: string;
  images?: string[];
}

export interface RatingResponse {
  success: boolean;
  data: {
    ratings: Rating[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

class RatingService {
  // Get ratings for a product
  async getProductRatings(
    productId: string,
    page = 1,
    limit = 10,
    sort = '-createdAt'
  ): Promise<Rating[]> {
    const response = await apiClient<{
      ratings: Rating[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/ratings/product/${productId}?page=${page}&limit=${limit}&sort=${sort}`, {
      method: 'GET',
    });

    if (response.success && response.data) {
      return response.data.ratings || [];
    }
    throw new Error((response as any).message || 'Failed to get ratings');
  }

  // Create a new rating
  async createRating(productId: string, data: CreateRatingRequest): Promise<Rating> {
    const response = await apiClient<Rating>(`/ratings/product/${productId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.success && response.data) {
      return response.data;
    }
    throw new Error((response as any).message || 'Failed to create rating');
  }

  // Update a rating
  async updateRating(ratingId: string, data: CreateRatingRequest): Promise<Rating> {
    const response = await apiClient<Rating>(`/ratings/${ratingId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (response.success && response.data) {
      return response.data;
    }
    throw new Error((response as any).message || 'Failed to update rating');
  }

  // Delete a rating
  async deleteRating(ratingId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient<{ success: boolean; message: string }>(
      `/ratings/${ratingId}`,
      {
        method: 'DELETE',
      }
    );

    if (response.success) {
      return { success: true, message: (response as any).message || 'Rating deleted successfully' };
    }
    throw new Error((response as any).message || 'Failed to delete rating');
  }

  // Vote helpful for a rating
  async voteHelpful(ratingId: string): Promise<Rating> {
    const response = await apiClient<Rating>(`/ratings/${ratingId}/helpful`, {
      method: 'POST',
    });

    if (response.success && response.data) {
      return response.data;
    }
    throw new Error((response as any).message || 'Failed to vote helpful');
  }
}

export const ratingService = new RatingService();
export default ratingService;
