// src/pages/ForgotPassword.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Giả lập gửi mã OTP thành công
    if (email) {
      navigate("/otp-verify");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        {/* Nút quay lại */}
        <button onClick={() => navigate(-1)} className="mb-6">
          <span className="text-2xl">&larr;</span>
        </button>

        <h2 className="text-2xl font-bold mb-2">Forgot Password?</h2>
        <p className="text-sm text-gray-500 mb-6">
          Don’t worry! It occurs. Please enter the email address linked with your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
          >
            Send Code
          </button>
        </form>
      </div>
    </div>
  );
}
