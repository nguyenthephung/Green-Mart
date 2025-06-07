// src/pages/Welcome.tsx
import { Link } from "react-router-dom";

export default function Welcome() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      {/* Logo hoặc tên ứng dụng */}
      <h1 className="text-4xl font-extrabold text-green-600 mb-16">Green Mart</h1>

      {/* Nút login */}
      <Link
        to="/login"
        className="w-full max-w-sm text-center bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition mb-4"
      >
        Login
      </Link>

      {/* Nút register */}
      <Link
        to="/register"
        className="w-full max-w-sm text-center border border-black text-black py-3 rounded-xl font-medium hover:bg-gray-100 transition mb-6"
      >
        Register
      </Link>

      {/* Guest link */}
      <Link
        to="/home"
        className="text-sm text-blue-500 hover:underline"
      >
        Continue as a guest
      </Link>
    </div>
  );
}
