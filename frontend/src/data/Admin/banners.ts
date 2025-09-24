export interface Banner {
  id: number;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
  position: 'hero' | 'sidebar' | 'footer' | 'category';
  priority: number;
  startDate: string;
  endDate?: string;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
}

export const adminBanners: Banner[] = [
  {
    id: 1,
    title: 'Sale cuối tuần - Giảm 30%',
    description: 'Giảm giá tất cả sản phẩm rau củ quả tươi ngon',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
    linkUrl: '/category/vegetables',
    isActive: true,
    position: 'hero',
    priority: 1,
    startDate: '2024-03-20',
    endDate: '2024-03-25',
    clickCount: 245,
    createdAt: '2024-03-18T10:00:00',
    updatedAt: '2024-03-20T14:30:00',
  },
  {
    id: 2,
    title: 'Trái cây nhập khẩu',
    description: 'Cam tươi Úc, táo Mỹ, nho Chile chất lượng cao',
    imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800',
    linkUrl: '/category/fruits',
    isActive: true,
    position: 'hero',
    priority: 2,
    startDate: '2024-03-15',
    endDate: '2024-04-15',
    clickCount: 189,
    createdAt: '2024-03-15T09:00:00',
    updatedAt: '2024-03-18T16:20:00',
  },
  {
    id: 3,
    title: 'Thực phẩm organic',
    description: 'Sản phẩm hữu cơ an toàn cho sức khỏe',
    imageUrl: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400',
    linkUrl: '/category/organic',
    isActive: true,
    position: 'sidebar',
    priority: 1,
    startDate: '2024-03-10',
    clickCount: 98,
    createdAt: '2024-03-10T11:30:00',
    updatedAt: '2024-03-15T10:15:00',
  },
  {
    id: 4,
    title: 'Miễn phí giao hàng',
    description: 'Đơn hàng từ 200k được miễn phí ship',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    linkUrl: '/shipping-info',
    isActive: false,
    position: 'footer',
    priority: 1,
    startDate: '2024-03-01',
    endDate: '2024-03-31',
    clickCount: 156,
    createdAt: '2024-02-28T14:00:00',
    updatedAt: '2024-03-18T09:45:00',
  },
];
