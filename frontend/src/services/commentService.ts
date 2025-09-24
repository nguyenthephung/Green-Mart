import { apiClient } from './api';

export interface Comment {
  _id: string;
  productId: string;
  user: {
    _id: string;
    fullName: string;
  };
  content: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  productId: string;
  content: string;
  rating?: number;
}

export interface UpdateCommentRequest {
  content: string;
  rating?: number;
}

export interface CommentResponse {
  success: boolean;
  data: {
    comments: Comment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    rating?: {
      average: number;
      count: number;
    };
  };
  message?: string;
}

export interface CreateCommentData {
  productId: string;
  content: string;
  rating?: number;
}

export interface UpdateCommentData {
  content?: string;
  rating?: number;
}

class CommentService {
  // Get comments for a product
  async getProductComments(productId: string, page = 1, limit = 10): Promise<Comment[]> {
    const response = await apiClient<{
      comments: Comment[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
      rating?: {
        average: number;
        count: number;
      };
    }>(`/comments/product/${productId}?page=${page}&limit=${limit}`, {
      method: 'GET',
    });

    if (response.success && response.data) {
      // Backend returns response.data.comments directly
      return response.data.comments || [];
    }
    throw new Error((response as any).message || 'Failed to get comments');
  }

  // Create a new comment
  async createComment(data: CreateCommentData): Promise<Comment> {
    const response = await apiClient<Comment>('/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.success && response.data) {
      // Backend returns the comment in response.data
      return response.data;
    }
    throw new Error((response as any).message || 'Failed to create comment');
  }

  // Update a comment
  async updateComment(commentId: string, data: UpdateCommentData): Promise<Comment> {
    const response = await apiClient<Comment>(`/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (response.success && response.data) {
      return response.data;
    }
    throw new Error((response as any).message || 'Failed to update comment');
  }

  // Delete a comment
  async deleteComment(commentId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient<{ success: boolean; message: string }>(
      `/comments/${commentId}`,
      {
        method: 'DELETE',
      }
    );

    if (response.success) {
      return {
        success: true,
        message: (response as any).message || 'Comment deleted successfully',
      };
    }
    throw new Error((response as any).message || 'Failed to delete comment');
  }

  // Get user's comments
  async getUserComments(page = 1, limit = 10): Promise<CommentResponse> {
    const response = await apiClient<CommentResponse>(
      `/comments/my-comments?page=${page}&limit=${limit}`,
      {
        method: 'GET',
      }
    );

    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get user comments');
  }
}

export const commentService = new CommentService();
export default commentService;
