// Mock data cho comment sản phẩm
// Định dạng: { id, productId, userId, userName, content, createdAt }

export interface Comment {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  content: string;
  createdAt: string;
}

export const comments: Comment[] = [
  {
    id: 1,
    productId: 1,
    userId: 2,
    userName: 'Nguyễn Văn A',
    content: 'Sản phẩm rất tốt, giao nhanh!',
    createdAt: '2025-07-10T10:00:00Z',
  },
  {
    id: 2,
    productId: 1,
    userId: 3,
    userName: 'Trần Thị B',
    content: 'Đóng gói cẩn thận, sẽ ủng hộ tiếp.',
    createdAt: '2025-07-10T11:00:00Z',
  },
];
