// Banner types
export interface Banner {
  id: number;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  position: BannerPosition;
  priority: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
}

// Filter and sorting types
export type SortField =
  | 'title'
  | 'position'
  | 'priority'
  | 'clickCount'
  | 'createdAt'
  | 'startDate';
export type SortOrder = 'asc' | 'desc';
export type ViewMode = 'table' | 'grid';
export type FilterPosition = 'all' | 'hero' | 'sidebar' | 'footer' | 'category';
export type FilterStatus = 'all' | 'active' | 'inactive';
export type BannerPosition = 'hero' | 'sidebar' | 'footer' | 'category';
