// src/pages/PasswordChanged.tsx
import { Link } from 'react-router-dom';

export default function PasswordChanged() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm text-center">
        {/* Biểu tượng thành công */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Nội dung */}
        <h2 className="text-xl font-bold mb-2">Password Changed!</h2>
        <p className="text-gray-500 text-sm mb-6">Your password has been changed successfully.</p>

        {/* Nút trở lại trang đăng nhập */}
        <Link
          to="/login"
          className="block w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
