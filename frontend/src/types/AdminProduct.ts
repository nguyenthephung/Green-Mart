export interface AdminProduct {
  type?: 'count' | 'weight';
  descriptionImages?: string[];
  _id?: string;
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
  isSale?: boolean;
  isFeatured?: boolean;
  discountAmount?: number;
  salePrice?: number;
  averageRating?: number;
  totalRatings?: number;
  totalSold?: number;
}
