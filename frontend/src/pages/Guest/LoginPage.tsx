import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserStore } from "../../stores/useUserStore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [message, setMessage] = useState("");
  
  const navigate = useNavigate();
  const login = useUserStore(state => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setMessage("");

    // Validation
    if (!email.trim()) {
      setErrors({ email: "Email không được để trống" });
      setIsLoading(false);
      return;
    }
    if (!password.trim()) {
      setErrors({ password: "Mật khẩu không được để trống" });
      setIsLoading(false);
      return;
    }

    try {
      const result = await login(email, password);
      
      if (result.success) {
        setMessage("Đăng nhập thành công! Đang chuyển hướng...");
        // Navigate immediately on success
        navigate("/home");
      } else {
        setMessage(result.message);
        if (result.errors) {
          setErrors(result.errors);
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <button className="mb-6" onClick={() => navigate(-1)}>
          <span className="text-2xl">&larr;</span>
        </button>

        <h2 className="text-2xl font-bold mb-6">
          Welcome back! Glad <br /> to see you, Again!
        </h2>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            message.includes('thành công') 
              ? 'bg-green-100 text-green-700 border border-green-300' 
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Enter your email"
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
              type="password"
              placeholder="Enter your password"
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Đang đăng nhập...' : 'Login'}
          </button>
        </form>

        <div className="text-right mt-2">
          <Link
            to="/forgot-password"
            className="text-sm text-blue-500 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <div className="my-6 text-center text-sm text-gray-500">Or Login with</div>

        <div className="flex justify-center gap-4 mb-6">
          <button className="border p-3 rounded-xl w-12 h-12 flex items-center justify-center">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png"
              alt="Facebook"
              className="w-5 h-5"
            />
          </button>
          <button className="border p-3 rounded-xl w-12 h-12 flex items-center justify-center">
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
              className="w-5 h-5"
            />
          </button>
          <button className="border p-3 rounded-xl w-12 h-12 flex items-center justify-center">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
              alt="Apple"
              className="w-5 h-5"
            />
          </button>
        </div>

        <div className="text-center text-sm">
          Don’t have an account?{" "}
          <Link to="/register" className="text-green-600 font-semibold">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
}