export interface AdminProduct {
  type?: 'count' | 'weight';
  descriptionImages(descriptionImages: any): unknown;
  _id: unknown;
  id: string;
  name: string;
  price: number;
  category: string;
  subCategory?: string;
  image: string;
  images?: string[];
  stock: number;
  status: 'active' | 'inactive';
  description?: string;
  brand?: string;
  unit?: string;
  isSale?: boolean;
  isFeatured?: boolean;
  discountAmount?: number;
  salePrice?: number;
  averageRating?: number;
  totalRatings?: number;
  totalSold?: number;
}
