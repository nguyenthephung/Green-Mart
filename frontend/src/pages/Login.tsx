import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      navigate("/home");
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

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Enter your password"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
          >
            Login
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
