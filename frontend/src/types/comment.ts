export interface Comment {
  _id: string;
  productId: string;
  user: {
    _id: string;
    fullName: string;
    role?: string;
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
