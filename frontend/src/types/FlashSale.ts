export interface FlashSaleProduct {
  productId: string;
  originalPrice: number;
  flashSalePrice: number;
  discountPercentage: number;
  quantity: number;
  sold: number;
  product?: {
    _id: string;
    name: string;
    image: string;
    stock?: number;
    category?: string;
    subCategory?: string;
  };
}

export interface FlashSale {
  _id: string;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  products: FlashSaleProduct[];
  status: 'scheduled' | 'active' | 'ended' | 'cancelled';
  bannerImage?: string;
  priority: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFlashSaleRequest {
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  products: {
    productId: string;
    flashSalePrice: number;
    quantity: number;
  }[];
  bannerImage?: string;
  priority?: number;
}

export interface FlashSaleResponse {
  success: boolean;
  data?: FlashSale | FlashSale[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProductFlashSaleInfo {
  inFlashSale: boolean;
  flashSale?: {
    _id: string;
    name: string;
    endTime: string;
  };
  productInfo?: FlashSaleProduct;
}
