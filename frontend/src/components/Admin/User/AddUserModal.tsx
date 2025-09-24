import React, { useState } from 'react';
import type { CreateUserRequest } from '../../../services/adminUserService';

interface AddUserModalProps {
  show: boolean;
  onAdd: (user: CreateUserRequest) => void;
  onClose: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ show, onAdd, onClose }) => {
  const [formData, setFormData] = useState<CreateUserRequest>({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user',
    status: 'active',
    avatar: '',
    isVerified: false,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!show) return null;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = 'Vui lòng nhập tên';
    if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ';
    if (!formData.password.trim()) newErrors.password = 'Vui lòng nhập mật khẩu';
    if (formData.password.length < 6) newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    if (!validateForm()) return;
    onAdd(formData);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'user',
      status: 'active',
      avatar: '',
      isVerified: false,
    });
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAdd();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-10 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4 my-10">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Thêm người dùng mới
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Họ và tên *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nhập họ và tên"
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                  errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="Nhập email"
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                  errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mật khẩu *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder="Nhập mật khẩu"
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                  errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Số điện thoại *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Nhập số điện thoại"
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Avatar URL
              </label>
              <input
                type="url"
                value={formData.avatar}
                onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                placeholder="Nhập URL avatar (tùy chọn)"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vai trò
              </label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="user">👤 Khách hàng</option>
                <option value="admin">👑 Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
                <option value="suspended">Tạm khóa</option>
              </select>
            </div>

            <div>
              <div className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  checked={formData.isVerified || false}
                  onChange={e => setFormData({ ...formData, isVerified: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Đã xác thực email
                </label>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              Thêm người dùng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
