export interface Category {
  id: number;
  name: string;
  icon: string;
  description?: string;
  productCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export const adminCategories: Category[] = [
  {
    id: 1,
    name: 'Rau củ',
    icon: '🥕',
    description: 'Các loại rau củ tươi ngon, bổ dưỡng',
    productCount: 45,
    status: 'active',
    createdAt: '2024-01-15',
    updatedAt: '2024-03-20'
  },
  {
    id: 2,
    name: 'Trái cây',
    icon: '🍎',
    description: 'Trái cây tươi ngon, nhập khẩu và trong nước',
    productCount: 32,
    status: 'active',
    createdAt: '2024-01-15',
    updatedAt: '2024-03-18'
  },
  {
    id: 3,
    name: 'Thịt',
    icon: '🥩',
    description: 'Thịt tươi sống các loại',
    productCount: 28,
    status: 'active',
    createdAt: '2024-01-15',
    updatedAt: '2024-03-15'
  },
  {
    id: 4,
    name: 'Sữa',
    icon: '🥛',
    description: 'Sữa và các sản phẩm từ sữa',
    productCount: 18,
    status: 'active',
    createdAt: '2024-01-15',
    updatedAt: '2024-03-10'
  },
  {
    id: 5,
    name: 'Đồ khô',
    icon: '🌾',
    description: 'Gạo, đậu, hạt các loại',
    productCount: 22,
    status: 'active',
    createdAt: '2024-01-15',
    updatedAt: '2024-03-12'
  },
  {
    id: 6,
    name: 'Gia vị',
    icon: '🧂',
    description: 'Gia vị, nước mắm, nước tương',
    productCount: 15,
    status: 'active',
    createdAt: '2024-01-15',
    updatedAt: '2024-03-08'
  },
  {
    id: 7,
    name: 'Đồ uống',
    icon: '🥤',
    description: 'Nước ngọt, nước trái cây, trà',
    productCount: 25,
    status: 'active',
    createdAt: '2024-01-15',
    updatedAt: '2024-03-05'
  }
];
