import type { Voucher } from '../../types/Voucher';

// Danh sách voucher mẫu cho toàn bộ hệ thống
export const vouchers: Voucher[] = [
  {
    id: 1,
    code: 'TAPHOA50',
    label: 'Tạp Hóa',
    description: 'Giảm 50k cho đơn từ 300k',
    minOrder: 300000,
    discountType: 'amount',
    discountValue: 50000,
    expired: '31.07.2025',
    usedPercent: 60,
    onlyOn: 'Web',
    note: '',
  },
  {
    id: 2,
    code: 'FREESHIP',
    label: 'Freeship',
    description: 'Miễn phí vận chuyển cho đơn từ 100k',
    minOrder: 100000,
    discountType: 'amount',
    discountValue: 25000,
    expired: '31.07.2025',
    usedPercent: 80,
    onlyOn: '',
    note: '',
  },
  {
    id: 3,
    code: 'LIVE17',
    label: 'Shopee Live',
    description: 'Giảm 17% tối đa 1tr, không giới hạn đơn tối thiểu',
    minOrder: 0,
    discountType: 'percent',
    discountValue: 17,
    expired: '14.07.2025',
    usedPercent: 76,
    onlyOn: 'Live',
    note: 'Chỉ có trên Live',
  },
];

// Danh sách voucher hệ thống dùng cho LuckyWheel
export const luckyVouchers = [
  {
    id: 101,
    code: 'LUCKY10K',
    label: 'Voucher 10K',
    discountType: 'amount',
    discountValue: 10000,
    expired: '31.12.2025',
    description: 'Giảm 10.000đ cho đơn bất kỳ.',
  },
  {
    id: 102,
    code: 'LUCKY20K',
    label: 'Voucher 20K',
    discountType: 'amount',
    discountValue: 20000,
    expired: '31.12.2025',
    description: 'Giảm 20.000đ cho đơn bất kỳ.',
  },
  {
    id: 103,
    code: 'LUCKY50K',
    label: 'Voucher 50K',
    discountType: 'amount',
    discountValue: 50000,
    expired: '31.12.2025',
    description: 'Giảm 50.000đ cho đơn bất kỳ.',
  },
  {
    id: 104,
    code: 'LUCKY100K',
    label: 'Voucher 100K',
    discountType: 'amount',
    discountValue: 100000,
    expired: '31.12.2025',
    description: 'Giảm 100.000đ cho đơn bất kỳ.',
  },
  {
    id: 105,
    code: 'LUCKY5P',
    label: 'Voucher 5%',
    discountType: 'percent',
    discountValue: 5,
    expired: '31.12.2025',
    description: 'Giảm 5% cho đơn bất kỳ.',
  },
  {
    id: 106,
    code: 'LUCKY10P',
    label: 'Voucher 10%',
    discountType: 'percent',
    discountValue: 10,
    expired: '31.12.2025',
    description: 'Giảm 10% cho đơn bất kỳ.',
  },
  {
    id: 107,
    code: 'LUCKY20P',
    label: 'Voucher 20%',
    discountType: 'percent',
    discountValue: 20,
    expired: '31.12.2025',
    description: 'Giảm 20% cho đơn bất kỳ.',
  },
];

// Lưu voucher quay được vào localStorage cho từng user
export function getUserVouchers(userId: string | number) {
  const key = `user_vouchers_${userId}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

export function addUserVoucher(userId: string | number, voucher: any) {
  const key = `user_vouchers_${userId}`;
  const current = getUserVouchers(userId);
  const newVoucher = {
    ...voucher,
    receivedAt: new Date().toISOString(),
    used: false,
  };
  localStorage.setItem(key, JSON.stringify([...current, newVoucher]));
}
