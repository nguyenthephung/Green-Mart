export interface Product {
  id: string | number;
  _id?: string;
  name: string;
  price: number;
  salePrice?: number;
  discountAmount?: number;
  isSale?: boolean;
  isFeatured?: boolean;
  category: string;
  image: string;
  images?: string[];
  stock?: number;
  status?: string;
  description?: string;
  brand?: string;
  unit: string;
  type?: 'count' | 'weight';
  descriptionImages?: string[];
  createdAt?: string;
  updatedAt?: string;
}
