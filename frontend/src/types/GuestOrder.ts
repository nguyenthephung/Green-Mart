export interface GuestUser {
  name: string;
  phone: string;
  address: string;
  email?: string;
}

export interface GuestOrder {
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    weight?: number;
    image: string;
    unit: string;
  }>;
  guestInfo: GuestUser;
  deliveryType: 'pickup' | 'delivery';
  paymentMethod: 'cod' | 'momo' | 'bank_transfer';
  totalAmount: number;
  shippingFee: number;
  notes?: string;
}
