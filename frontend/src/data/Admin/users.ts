export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'admin' | 'user' | 'staff';
  status: 'active' | 'inactive' | 'suspended';
  isVerified: boolean;
  joinDate: string;
  lastLogin: string;
  totalOrders: number;
  totalSpent: number;
  address?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
}

export const adminUsers: User[] = [
  {
    id: 1,
    name: 'Nguyễn Văn An',
    email: 'nguyen.van.an@email.com',
    phone: '0901234567',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    role: 'user',
    status: 'active',
    isVerified: true,
    joinDate: '2024-01-15',
    lastLogin: '2024-03-20T10:30:00',
    totalOrders: 24,
    totalSpent: 2450000,
    address: '123 Nguyễn Huệ, Q1, TP.HCM',
    dateOfBirth: '1990-05-15',
    gender: 'male'
  },
  {
    id: 2,
    name: 'Trần Thị Bình',
    email: 'tran.thi.binh@email.com',
    phone: '0912345678',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b2e5bb10?w=150',
    role: 'user',
    status: 'active',
    isVerified: true,
    joinDate: '2024-02-10',
    lastLogin: '2024-03-19T15:20:00',
    totalOrders: 18,
    totalSpent: 1890000,
    address: '456 Lê Lợi, Q3, TP.HCM',
    dateOfBirth: '1985-08-22',
    gender: 'female'
  },
  {
    id: 3,
    name: 'Lê Minh Cường',
    email: 'le.minh.cuong@email.com',
    phone: '0923456789',
    role: 'staff',
    status: 'active',
    isVerified: true,
    joinDate: '2024-01-05',
    lastLogin: '2024-03-20T09:00:00',
    totalOrders: 0,
    totalSpent: 0,
    address: '789 Hai Bà Trưng, Q1, TP.HCM',
    dateOfBirth: '1992-12-10',
    gender: 'male'
  },
  {
    id: 4,
    name: 'Phạm Thị Diệu',
    email: 'pham.thi.dieu@email.com',
    phone: '0934567890',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    role: 'user',
    status: 'inactive',
    isVerified: false,
    joinDate: '2024-02-01',
    lastLogin: '2024-03-18T11:10:00',
    totalOrders: 3,
    totalSpent: 320000,
    address: '321 Nguyễn Trãi, Q5, TP.HCM',
    dateOfBirth: '1995-03-30',
    gender: 'female'
  }
];
