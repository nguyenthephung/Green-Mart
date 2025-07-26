export interface AdminProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  images?: string[];
  stock: number;
  status: 'active' | 'inactive';
  description?: string;
  brand?: string;
  unit?: string;
  isSale?: boolean;
  discountAmount?: number;
  salePrice?: number;
}
