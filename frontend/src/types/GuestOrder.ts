export interface GuestUser {
  name: string;
  phone: string;
  address: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  shippingFee?: number;
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
  paymentMethod: 'cod' | 'momo' | 'bank_transfer' | 'paypal';
  totalAmount: number;
  shippingFee: number;
  notes?: string;
}
