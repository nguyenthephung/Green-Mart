import React from 'react';
import type { User } from '../../../services/adminUserService';

interface ViewUserModalProps {
  show: boolean;
  user: User;
  onClose: () => void;
}

const ViewUserModal: React.FC<ViewUserModalProps> = ({ show, user, onClose }) => {
  if (!show) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-10 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Chi tiết người dùng
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-600 dark:text-gray-300 font-bold text-xl">
                  {user.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {user.name}
                {user.isVerified && (
                  <span className="text-blue-500 dark:text-blue-400" title="Đã xác thực">
                    ✓
                  </span>
                )}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">ID: {user._id.slice(-8)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <p className="text-gray-900 dark:text-white">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Điện thoại
              </label>
              <p className="text-gray-900 dark:text-white">{user.phone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Vai trò
              </label>
              <p className="text-gray-900 dark:text-white">
                {user.role === 'admin' ? '👑 Admin' : '👤 Khách hàng'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Trạng thái
              </label>
              <p className="text-gray-900 dark:text-white">
                {user.status === 'active'
                  ? '✅ Hoạt động'
                  : user.status === 'suspended'
                    ? '🚫 Tạm khóa'
                    : '⏸️ Không hoạt động'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tham gia
              </label>
              <p className="text-gray-900 dark:text-white">
                {new Date(user.joinDate).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cập nhật cuối
              </label>
              <p className="text-gray-900 dark:text-white">
                {new Date(user.updatedAt).toLocaleString('vi-VN')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tổng đơn hàng
              </label>
              <p className="font-semibold text-blue-600 dark:text-blue-400">{user.totalOrders}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tổng chi tiêu
              </label>
              <p className="font-semibold text-green-600 dark:text-green-400">
                {formatPrice(user.totalSpent)}
              </p>
            </div>
            {user.lastLogin && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Đăng nhập cuối
                </label>
                <p className="text-gray-900 dark:text-white">
                  {new Date(user.lastLogin).toLocaleString('vi-VN')}
                </p>
              </div>
            )}
          </div>

          {user.vouchers && Object.keys(user.vouchers).length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Voucher sở hữu
              </label>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {Object.keys(user.vouchers).length} voucher
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewUserModal;
