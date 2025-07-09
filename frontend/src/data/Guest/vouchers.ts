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
