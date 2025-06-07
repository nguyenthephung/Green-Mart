import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      alert("Passwords do not match!");
      return;
    }
    // Sau khi đổi mật khẩu thành công:
    navigate("/password-changed");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        {/* Nút quay lại */}
        <button className="mb-6" onClick={() => navigate(-1)}>
          <span className="text-2xl">&larr;</span>
        </button>

        <h2 className="text-2xl font-bold mb-2">Create new password</h2>
        <p className="text-sm text-gray-500 mb-6">
          Your new password must be unique from those previously used.
        </p>

        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}
