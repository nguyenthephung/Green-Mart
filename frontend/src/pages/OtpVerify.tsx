import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function OtpVerify() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const navigate = useNavigate();

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return; // Chỉ cho phép nhập 1 số
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Tự động chuyển ô
    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join("");
    if (code.length === 4) {
      // Chuyển đến trang Reset Password
      navigate("/reset-password");
    } else {
      alert("Please enter the full OTP code.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm text-center">
        {/* Nút quay lại */}
        <button onClick={() => navigate(-1)} className="mb-6 text-left">
          <span className="text-2xl">&larr;</span>
        </button>

        <h2 className="text-2xl font-bold mb-2">OTP Verification</h2>
        <p className="text-sm text-gray-500 mb-6">
          Enter the verification code we just sent on your email address.
        </p>

        <div className="flex justify-between mb-6">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className="w-14 h-14 text-center text-xl border-2 rounded-md border-teal-400 focus:outline-none"
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          className="w-full bg-black text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
        >
          Verify
        </button>

        <div className="mt-6 text-center text-sm">
          Didn’t receive code?{" "}
          <button className="text-blue-500 hover:underline">Resend</button>
        </div>
      </div>
    </div>
  );
}
