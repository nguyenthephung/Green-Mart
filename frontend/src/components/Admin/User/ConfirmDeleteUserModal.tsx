import React from 'react';
import type { User } from '../../../services/adminUserService';

interface ConfirmDeleteUserModalProps {
  show: boolean;
  user: User;
  onClose: () => void;
  onConfirm: (userId: string) => void;
  isLoading?: boolean;
}

const ConfirmDeleteUserModal: React.FC<ConfirmDeleteUserModalProps> = ({ 
  show, 
  user, 
  onClose, 
  onConfirm, 
  isLoading = false 
}) => {
  if (!show) return null;

  const handleConfirm = () => {
    onConfirm(user._id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.764 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Xác nhận xóa người dùng</h2>
          
          <div className="mb-4">
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Bạn có chắc chắn muốn xóa người dùng này không?
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-600 dark:text-gray-300 font-bold">{user.name.charAt(0)}</span>
                  )}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-800 dark:text-red-300">
              ⚠️ <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến người dùng này sẽ bị xóa vĩnh viễn.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button 
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {isLoading && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isLoading ? 'Đang xóa...' : 'Xóa'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteUserModal;
