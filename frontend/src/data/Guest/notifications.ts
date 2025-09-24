// Notification mock data
export const defaultSettings = {
  order: true,
  promotion: true,
  system: true,
  review: true,
};

export const icons = {
  order: '📦',
  promotion: '🎁',
  system: '⚙️',
  review: '⭐',
};

export const descriptions = {
  order: 'Thông báo về đơn hàng',
  promotion: 'Khuyến mãi và ưu đãi',
  system: 'Thông báo hệ thống',
  review: 'Đánh giá sản phẩm',
};

export const notifications = [
  { id: 1, type: 'order', title: 'Đơn hàng #1234 đã được giao', time: '1 giờ trước', read: false },
  { id: 2, type: 'promotion', title: 'Nhận ngay mã giảm giá 50%', time: '2 giờ trước', read: true },
  {
    id: 3,
    type: 'system',
    title: 'Cập nhật chính sách bảo mật',
    time: '1 ngày trước',
    read: false,
  },
  {
    id: 4,
    type: 'review',
    title: 'Hãy đánh giá sản phẩm bạn đã mua',
    time: '2 ngày trước',
    read: true,
  },
];
