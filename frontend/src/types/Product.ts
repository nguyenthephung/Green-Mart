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
  richDescription?: {
    content: string;
    format: 'html' | 'markdown';
    sections?: {
      title: string;
      content: string;
      type: 'text' | 'image' | 'video' | 'table';
    }[];
  };
  specifications?: {
    [key: string]: string | number;
  };
  brand?: string;
  unit?: string;
  type?: 'count' | 'weight';
  descriptionImages?: string[];
  averageRating?: number;
  totalRatings?: number;
  totalSold?: number;
  createdAt?: string;
  updatedAt?: string;
}
