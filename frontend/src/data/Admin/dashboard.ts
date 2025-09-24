// Dashboard mock data
export const stats = [
  {
    label: 'Tổng sản phẩm',
    value: 120,
    icon: '📦',
    color: 'bg-gradient-to-br from-green-100 to-green-200 text-green-700 border-green-300',
    change: '+12%',
    changeColor: 'text-green-600',
  },
  {
    label: 'Tổng danh mục',
    value: 8,
    icon: '🗂️',
    color: 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 border-blue-300',
    change: '+2%',
    changeColor: 'text-blue-600',
  },
  {
    label: 'Tổng người dùng',
    value: 1200,
    icon: '👤',
    color: 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 border-purple-300',
    change: '+8%',
    changeColor: 'text-purple-600',
  },
  {
    label: 'Doanh thu tháng',
    value: '45.2M',
    icon: '💰',
    color: 'bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-700 border-yellow-300',
    change: '+15%',
    changeColor: 'text-yellow-600',
  },
];

export const recentOrders = [
  {
    id: 'DH001',
    user: 'Nguyễn Văn A',
    total: 1200000,
    status: 'Đã giao',
    date: '12/07/2025',
    time: '14:30',
  },
  {
    id: 'DH002',
    user: 'Trần Thị B',
    total: 850000,
    status: 'Đang xử lý',
    date: '12/07/2025',
    time: '13:15',
  },
  {
    id: 'DH003',
    user: 'Lê Văn C',
    total: 2000000,
    status: 'Đã hủy',
    date: '11/07/2025',
    time: '10:45',
  },
  {
    id: 'DH004',
    user: 'Phạm Thị D',
    total: 650000,
    status: 'Đã giao',
    date: '11/07/2025',
    time: '09:20',
  },
  {
    id: 'DH005',
    user: 'Hoàng Văn E',
    total: 1500000,
    status: 'Đang vận chuyển',
    date: '11/07/2025',
    time: '16:00',
  },
];

export const topProducts = [
  { name: 'Táo Mỹ', sold: 156, revenue: 7020000, trend: '📈' },
  { name: 'Sữa tươi Vinamilk', sold: 89, revenue: 2848000, trend: '📈' },
  { name: 'Thịt bò Úc', sold: 23, revenue: 5060000, trend: '📉' },
  { name: 'Cà rốt Đà Lạt', sold: 67, revenue: 871000, trend: '📈' },
];

export const quickStats = [
  { label: 'Đơn hàng hôm nay', value: 28, icon: '🛒', color: 'text-green-600' },
  { label: 'Sản phẩm hết hàng', value: 5, icon: '⚠️', color: 'text-red-600' },
  { label: 'Khách hàng mới', value: 12, icon: '✨', color: 'text-blue-600' },
  { label: 'Đánh giá mới', value: 8, icon: '⭐', color: 'text-yellow-600' },
];
