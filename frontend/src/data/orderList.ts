export type OrderStatus = 'Delivered' | 'Canceled' | 'Pending' | 'Processing';

export interface Order {
  id: string;
  product: string;
  date: string;
  customerName: string;
  customerImage: string;
  status: OrderStatus;
  amount: number;
}

export const orders: Order[] = [
  {
    id: '25426',
    product: 'Lorem Ipsum',
    date: 'Nov 8th, 2023',
    customerName: 'Kavin',
    customerImage: '/avatars/kavin.png',
    status: 'Delivered',
    amount: 200000,
  },
  {
    id: '25425',
    product: 'Lorem Ipsum',
    date: 'Nov 7th, 2023',
    customerName: 'Komael',
    customerImage: '/avatars/komael.png',
    status: 'Canceled',
    amount: 200000,
  },
  {
    id: '25424',
    product: 'Lorem Ipsum',
    date: 'Nov 6th, 2023',
    customerName: 'Nikhil',
    customerImage: '/avatars/nikhil.png',
    status: 'Delivered',
    amount: 200000,
  },
  {
    id: '25423',
    product: 'Lorem Ipsum',
    date: 'Nov 5th, 2023',
    customerName: 'Shivam',
    customerImage: '/avatars/shivam.png',
    status: 'Canceled',
    amount: 200000,
  },
  {
    id: '25422',
    product: 'Lorem Ipsum',
    date: 'Nov 4th, 2023',
    customerName: 'Shadab',
    customerImage: '/avatars/shadab.png',
    status: 'Delivered',
    amount: 200000,
  },
  {
    id: '25421',
    product: 'Lorem Ipsum',
    date: 'Nov 2nd, 2023',
    customerName: 'Yogesh',
    customerImage: '/avatars/yogesh.png',
    status: 'Delivered',
    amount: 200000,
  },
  {
    id: '25420',
    product: 'Lorem Ipsum',
    date: 'Nov 1st, 2023',
    customerName: 'Sunita',
    customerImage: '/avatars/sunita.png',
    status: 'Processing',
    amount: 200000,
  },
  {
    id: '25419',
    product: 'Lorem Ipsum',
    date: 'Nov 1st, 2023',
    customerName: 'Priyanka',
    customerImage: '/avatars/priyanka.png',
    status: 'Pending',
    amount: 200000,
  },
  {
    id: '25418',
    product: 'Lorem Ipsum',
    date: 'Nov 1st, 2023',
    customerName: 'Priyanka',
    customerImage: '/avatars/priyanka.png',
    status: 'Delivered',
    amount: 200000,
  },
  {
    id: '25417',
    product: 'Lorem Ipsum',
    date: 'Nov 1st, 2023',
    customerName: 'Priyanka',
    customerImage: '/avatars/priyanka.png',
    status: 'Pending',
    amount: 200000,
  },
  {
    id: '25416',
    product: 'Lorem Ipsum',
    date: 'Nov 1st, 2023',
    customerName: 'Priyanka',
    customerImage: '/avatars/priyanka.png',
    status: 'Processing',
    amount: 200000,
  },
  {
    id: '25415',
    product: 'Lorem Ipsum',
    date: 'Nov 1st, 2023',
    customerName: 'Priyanka',
    customerImage: '/avatars/priyanka.png',
    status: 'Processing',
    amount: 200000,
  },
  {
    id: '25414',
    product: 'Lorem Ipsum',
    date: 'Nov 1st, 2023',
    customerName: 'Priyanka',
    customerImage: '/avatars/priyanka.png',
    status: 'Pending',
    amount: 200000,
  },
  {
    id: '25413',
    product: 'Lorem Ipsum',
    date: 'Nov 1st, 2023',
    customerName: 'Priyanka',
    customerImage: '/avatars/priyanka.png',
    status: 'Pending',
    amount: 200000,
  },
];
