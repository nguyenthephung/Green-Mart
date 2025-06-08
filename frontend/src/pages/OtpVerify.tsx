import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OtpVerify() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  // Auto focus vào input đầu tiên khi component mount
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Xử lý phím Backspace
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Nếu ô hiện tại trống và không phải ô đầu tiên, focus về ô trước
        inputsRef.current[index - 1]?.focus();
      } else if (otp[index]) {
        // Nếu ô hiện tại có giá trị, xóa nó
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
    // Xử lý phím mũi tên
    else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    else if (e.key === 'ArrowRight' && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
    // Xử lý paste
    else if (e.key === 'Enter') {
      handleVerify();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 4); // Chỉ lấy 4 số đầu
    
    if (digits.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < digits.length && i < 4; i++) {
        newOtp[i] = digits[i];
      }
      setOtp(newOtp);
      
      // Focus vào ô cuối cùng đã điền hoặc ô tiếp theo
      const nextIndex = Math.min(digits.length, 3);
      inputsRef.current[nextIndex]?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join("");
    if (code.length === 4) {
      // Chuyển đến trang Reset Password
      navigate("/reset-password");
    } else {
      alert("Please enter the full OTP code.");
      // Focus vào ô đầu tiên còn trống
      const emptyIndex = otp.findIndex(digit => digit === "");
      if (emptyIndex !== -1) {
        inputsRef.current[emptyIndex]?.focus();
      }
    }
  };

  const handleResend = () => {
    // Reset OTP và focus vào ô đầu tiên
    setOtp(["", "", "", ""]);
    inputsRef.current[0]?.focus();
    // TODO: Gọi API resend OTP
    console.log("Resending OTP...");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm text-center">
        {/* Nút quay lại */}
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 text-left hover:bg-gray-100 p-2 rounded-full transition-colors"
          aria-label="Go back"
        >
          <span className="text-2xl">&larr;</span>
        </button>

        <h2 className="text-2xl font-bold mb-2">OTP Verification</h2>
        <p className="text-sm text-gray-500 mb-6">
          Enter the verification code we just sent on your email address.
        </p>

        <div className="flex justify-between mb-6 gap-2">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className="w-14 h-14 text-center text-xl border-2 rounded-md border-teal-400 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-200 transition-all"
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={handlePaste}
              aria-label={`OTP digit ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={otp.join("").length < 4}
          className="w-full bg-black text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          Verify
        </button>

        <div className="mt-6 text-center text-sm">
          Didn't receive code?{" "}
          <button 
            onClick={handleResend}
            className="text-blue-500 hover:underline focus:outline-none focus:underline"
          >
            Resend
          </button>
        </div>
      </div>
    </div>
  );
}