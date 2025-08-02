export interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Order {
  id: number;
  orderNumber?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  subtotal?: number;
  shippingFee?: number;
  discount?: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  paymentMethod: 'cod' | 'momo' | 'bank_transfer' | 'credit_card';
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderDate: string;
  deliveryDate?: string;
  lastUpdated?: string;
  notes?: string;
  trackingCode?: string;
  shippingInfo?: {
    address: string;
    estimatedDelivery: string;
    courier: string;
  };
}

// Common types for order management
export type OrderStatus = Order['status'];
export type PaymentMethod = Order['paymentMethod'];
export type PaymentStatus = Order['paymentStatus'];

export type SortField = 'id' | 'customerName' | 'orderDate' | 'totalAmount' | 'status';
export type SortOrder = 'asc' | 'desc';
export type ViewMode = 'table' | 'grid';
export type FilterStatus = 'all' | 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
export type FilterPayment = 'all' | 'pending' | 'paid' | 'failed';
export type FilterPaymentMethod = 'all' | 'cod' | 'momo' | 'bank_transfer' | 'credit_card';
