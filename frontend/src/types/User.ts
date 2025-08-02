export interface CurrentUser {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  role?: string;
  avatar?: string;
  vouchers?: string[]; // Array of MongoDB ObjectId (voucher ids)
  createdAt?: string;
  updatedAt?: string;
}
export interface Voucher {
  _id: string;
  code: string;
  label: string;
  description: string;
  minOrder: number;
  discountType: 'percent' | 'amount';
  discountValue: number;
  expired: string; // ISO string
  usedPercent: number;
  currentUsage: number;
  onlyOn?: string;
  isActive: boolean;
  note?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface UserInfo {
  fullName: string;
  phone: string;
  email?: string;
}

export interface AddressInfo {
  id: number;
  isSelected: boolean;
  label?: string;
  address: string;
  wardName?: string;
  phone: string;
  fullName: string;
  district?: string;
  ward?: string;
  street?: string;
  latitude?: number;
  longitude?: number;
  userId?: string;
}

export interface PaymentInfo {
  id: number;
  method: string;
  isSelected: boolean;
  expiry?: string;
}
