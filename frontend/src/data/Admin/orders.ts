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

export const adminOrders: Order[] = [
  {
    id: 1001,
    customerName: 'Nguyễn Văn An',
    customerEmail: 'nguyen.van.an@email.com',
    customerPhone: '0901234567',
    customerAddress: '123 Nguyễn Huệ, Q1, TP.HCM',
    items: [
      { id: 1, productName: 'Cà chua cherry', quantity: 2, price: 45000, image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=100' },
      { id: 2, productName: 'Xà lách xoăn', quantity: 1, price: 25000, image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=100' }
    ],
    totalAmount: 115000,
    status: 'pending',
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    orderDate: '2024-03-20T14:30:00',
    notes: 'Giao hàng buổi chiều'
  },
  {
    id: 1002,
    customerName: 'Trần Thị Bình',
    customerEmail: 'tran.thi.binh@email.com',
    customerPhone: '0912345678',
    customerAddress: '456 Lê Lợi, Q3, TP.HCM',
    items: [
      { id: 3, productName: 'Cà rốt tím', quantity: 3, price: 35000, image: 'https://images.unsplash.com/photo-1659261200833-ec8761558af7?w=100' },
      { id: 4, productName: 'Bơ Hass', quantity: 2, price: 80000, image: 'https://images.unsplash.com/photo-1583487907579-2a8e9e2c9d1a?w=100' }
    ],
    totalAmount: 265000,
    status: 'confirmed',
    paymentMethod: 'bank_transfer',
    paymentStatus: 'paid',
    orderDate: '2024-03-20T10:15:00',
    trackingCode: 'GM202403200001'
  },
  {
    id: 1003,
    customerName: 'Lê Minh Cường',
    customerEmail: 'le.minh.cuong@email.com',
    customerPhone: '0923456789',
    customerAddress: '789 Hai Bà Trưng, Q1, TP.HCM',
    items: [
      { id: 5, productName: 'Táo Fuji nhập khẩu', quantity: 1, price: 120000 },
      { id: 6, productName: 'Cam sành Vinh', quantity: 2, price: 45000 }
    ],
    totalAmount: 210000,
    status: 'shipping',
    paymentMethod: 'momo',
    paymentStatus: 'paid',
    orderDate: '2024-03-19T16:45:00',
    trackingCode: 'GM202403190002',
    deliveryDate: '2024-03-21T00:00:00'
  }
];
