// Script chuẩn hóa status đơn hàng trong localStorage về 3 trạng thái: Chờ xác nhận, Chờ giao hàng, Đã hủy

const normalizeStatus = (status: string) => {
  if (!status) return 'Chờ xác nhận';
  const s = status.toLowerCase();
  if (s.includes('hủy')) return 'Đã hủy';
  if (s.includes('giao') || s.includes('shipping') || s.includes('vận chuyển'))
    return 'Chờ giao hàng';
  if (
    s.includes('xác nhận') ||
    s.includes('chờ') ||
    s.includes('processing') ||
    s.includes('pending')
  )
    return 'Chờ xác nhận';
  return 'Chờ xác nhận';
};

export function normalizeOrdersInLocalStorage() {
  const raw = localStorage.getItem('orders');
  if (!raw) return;
  const orders = JSON.parse(raw);
  const newOrders = orders.map((order: { status: string }) => ({
    ...order,
    status: normalizeStatus(order.status),
  }));
  localStorage.setItem('orders', JSON.stringify(newOrders));
}

// Để sử dụng: import và gọi normalizeOrdersInLocalStorage() ở App hoặc OrdersPage
