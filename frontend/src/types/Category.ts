export type Category = {
  id: string; // do MongoDB tạo, chỉ có khi lấy từ API
  _id?: string; // tối ưu cho dữ liệu trả về từ backend
  name: string;
  icon: string;
  description?: string;
  productCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
};