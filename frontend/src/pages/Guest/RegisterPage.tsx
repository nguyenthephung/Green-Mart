import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUserStore } from "../../stores/useUserStore";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [message, setMessage] = useState("");
  
  const navigate = useNavigate();
  const register = useUserStore(state => state.register);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrors({ general: "Vui lòng điền đầy đủ thông tin bắt buộc" });
      return;
    }
    
    // Validate password match
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Mật khẩu xác nhận không khớp" });
      return;
    }

    setIsLoading(true);
    setErrors({});
    setMessage("");

    try {
      const result = await register(name, email, password, phone);
      
      if (result.success) {
        setMessage("Đăng ký thành công! Đang chuyển hướng...");
        // Navigate immediately on success
        navigate("/home");
      } else {
        setMessage(result.message);
        if (result.errors) {
          setErrors(result.errors);
        }
      }
    } catch (error) {
      console.error("Register error:", error);
      setMessage("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 px-4 transition-colors duration-300">
      <div className="w-full max-w-sm">
        <button className="mb-6" onClick={() => navigate(-1)}>
          <span className="text-2xl text-gray-800 dark:text-white">&larr;</span>
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Welcome to GREEN MART
        </h2>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            message.includes('thành công') 
              ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 border border-green-300 dark:border-green-600' 
              : 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 border border-red-300 dark:border-red-600'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Họ và tên"
              className={`w-full px-4 py-3 rounded-xl border bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-2 ${
                errors.name 
                  ? 'border-red-300 focus:ring-red-500 dark:border-red-500' 
                  : 'border-gray-200 focus:ring-black dark:focus:ring-green-500'
              }`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
          </div>

          <div>
            <input
              type="email"
              placeholder="Email"
              className={`w-full px-4 py-3 rounded-xl border bg-gray-100 focus:outline-none focus:ring-2 ${
                errors.email 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-200 focus:ring-black'
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <input
              type="tel"
              placeholder="Số điện thoại (VD: 0901234567)"
              className={`w-full px-4 py-3 rounded-xl border bg-gray-100 focus:outline-none focus:ring-2 ${
                errors.phone 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-200 focus:ring-black'
              }`}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Mật khẩu (ít nhất 6 ký tự)"
              className={`w-full px-4 py-3 rounded-xl border bg-gray-100 focus:outline-none focus:ring-2 ${
                errors.password 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-200 focus:ring-black'
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Xác nhận mật khẩu"
              className={`w-full px-4 py-3 rounded-xl border bg-gray-100 focus:outline-none focus:ring-2 ${
                errors.confirmPassword 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-200 focus:ring-black'
              }`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <div className="my-6 text-center text-sm text-gray-500">Or Register with</div>

        <div className="flex gap-4 mb-6">
          <button className="flex-1 flex items-center justify-center py-3 border border-gray-200 rounded-xl hover:bg-gray-50">
            <span className="text-xl mr-2">📱</span>
            Facebook
          </button>
          <button className="flex-1 flex items-center justify-center py-3 border border-gray-200 rounded-xl hover:bg-gray-50">
            <span className="text-xl mr-2">🔍</span>
            Google
          </button>
        </div>

        <div className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-green-600 font-semibold">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}