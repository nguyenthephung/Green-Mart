import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center p-6">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Không có quyền truy cập</h1>
          <p className="text-gray-600 mb-6">
            Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            to="/home"
            className="block w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition"
          >
            Về trang chủ
          </Link>
          <Link
            to="/login"
            className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition"
          >
            Đăng nhập lại
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
