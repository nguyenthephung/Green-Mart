// src/types/Voucher.ts

export type DiscountType = 'percent' | 'amount';

export interface Voucher {
  id: number;
  code: string;
  label: string;
  description: string;
  minOrder: number;
  discountType: DiscountType;
  discountValue: number;
  expired: string;
  usedPercent: number;
  onlyOn?: string;
  disabled?: boolean;
  note?: string;
}
