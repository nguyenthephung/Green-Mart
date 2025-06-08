import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <button className="mb-6" onClick={() => navigate(-1)}>
          <span className="text-2xl">&larr;</span>
        </button>

        <h2 className="text-2xl font-bold mb-6">
          Welcome to GREEN MART
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm password"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
          >
            Agree and Register
          </button>
        </form>

        <div className="my-6 text-center text-sm text-gray-500">Or Login with</div>

        <div className="flex justify-center gap-4 mb-6">
          <button className="border p-3 rounded-xl w-12 h-12 flex items-center justify-center">
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png" alt="Facebook" className="w-5 h-5" />
          </button>
          <button className="border p-3 rounded-xl w-12 h-12 flex items-center justify-center">
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="w-5 h-5" />
          </button>
          <button className="border p-3 rounded-xl w-12 h-12 flex items-center justify-center">
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-green-600 font-semibold">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
