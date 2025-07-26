// Mock data sản phẩm cho admin quản lý
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

export const adminProducts: AdminProduct[] = [
  {
    id: '1',
    name: 'Táo Mỹ',
    price: 45000,
    salePrice: 35000,
    discountAmount: 10000,
    isSale: true,
    category: 'Trái cây',
    image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc',
    images: [
      'https://cdn.tgdd.vn/2021/11/content/tao-my-1-1200x676.jpg',
      'https://cdn.tgdd.vn/2021/11/content/tao-my-2-1200x676.jpg',
    ],
    stock: 120,
    status: 'active',
    description: 'Táo Mỹ nhập khẩu tươi ngon, giàu vitamin.',
    brand: 'FruitUS',
    unit: 'kg',
  },
  {
    id: '2',
    name: 'Sữa tươi Vinamilk',
    price: 32000,
    category: 'Sữa',
    image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c',
    images: ['https://cdn.tgdd.vn/2021/11/content/sua-tuoi-1-1200x676.jpg'],
    stock: 80,
    status: 'active',
    description: 'Sữa tươi tiệt trùng Vinamilk 1L.',
    brand: 'Vinamilk',
    unit: 'hộp',
  },
  {
    id: '3',
    name: 'Thịt bò Úc',
    price: 220000,
    isSale: false,
    category: 'Thịt',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141',
    images: ['https://cdn.tgdd.vn/2021/11/content/thit-bo-1-1200x676.jpg'],
    stock: 30,
    status: 'inactive',
    description: 'Thịt bò Úc nhập khẩu mềm ngon.',
    brand: 'BeefAU',
    unit: 'kg',
  },
  {
    id: '4',
    name: 'Cà Rốt',
    price: 18000,
    salePrice: 13000,
    discountAmount: 5000,
    isSale: true,
    category: 'Rau củ',
    image: 'https://cdn.tgdd.vn/2021/11/content/ca-rot-1-1200x676.jpg',
    images: ['https://cdn.tgdd.vn/2021/11/content/ca-rot-2-1200x676.jpg'],
    stock: 50,
    status: 'active',
    description: 'Cà rốt Đà Lạt tươi sạch.',
    brand: 'VietGap',
    unit: 'kg',
  },
  {
    id: '5',
    name: 'Nước Suối Lavie',
    price: 5000,
    category: 'Đồ uống',
    image: 'https://cdn.tgdd.vn/2021/11/content/nuoc-suoi-1-1200x676.jpg',
    images: [],
    stock: 200,
    status: 'active',
    description: 'Nước suối đóng chai Lavie 500ml.',
    brand: 'Lavie',
    unit: 'chai',
  },
  {
    id: '6',
    name: 'Bánh Oreo',
    price: 12000,
    salePrice: 9000,
    discountAmount: 3000,
    isSale: true,
    category: 'Bánh kẹo',
    image: 'https://cdn.tgdd.vn/2021/11/content/oreo-1-1200x676.jpg',
    images: [],
    stock: 60,
    status: 'active',
    description: 'Bánh Oreo vị socola.',
    brand: 'Oreo',
    unit: 'gói',
  },
];
