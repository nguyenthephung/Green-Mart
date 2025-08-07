// src/pages/Welcome.tsx
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Welcome() {
  const [currentFeature, setCurrentFeature] = useState(0);
  
  const features = [
    {
      title: "Sản phẩm tươi ngon",
      description: "Thực phẩm hữu cơ chất lượng cao từ các nông trại địa phương",
      icon: "🥬",
      color: "from-green-400 to-emerald-500"
    },
    {
      title: "Giao hàng nhanh chóng",
      description: "Giao hàng trong ngày, đảm bảo độ tươi ngon",
      icon: "🚚",
      color: "from-blue-400 to-cyan-500"
    },
    {
      title: "Giá cả phải chăng",
      description: "Những sản phẩm chất lượng với mức giá tốt nhất",
      icon: "💰",
      color: "from-yellow-400 to-orange-500"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-emerald-300 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-teal-200 rounded-full opacity-15"></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-green-300 rounded-full opacity-25"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Hero Section */}
        <div className="text-center mb-16 max-w-4xl">
          {/* Logo và Title */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl">
              <span className="text-4xl">🛒</span>
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
              Green Mart
            </h1>
            <p className="text-xl text-gray-600 font-medium">
              Mua sắm thông minh, sống xanh bền vững
            </p>
          </div>

          {/* Feature Carousel */}
          <div className="mb-12">
            <div className="relative h-32 flex items-center justify-center">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-700 transform ${
                    index === currentFeature 
                      ? 'opacity-100 translate-y-0 scale-100' 
                      : 'opacity-0 translate-y-4 scale-95'
                  }`}
                >
                  <div className={`bg-gradient-to-r ${feature.color} rounded-2xl p-6 text-white shadow-2xl max-w-md mx-auto`}>
                    <div className="text-4xl mb-2">{feature.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-white/90">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Feature Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeature(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentFeature 
                      ? 'bg-green-500 scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-sm space-y-4">
          {/* Login Button */}
          <Link
            to="/login"
            className="group w-full block text-center bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-2xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span className="flex items-center justify-center gap-2">
              <span>Đăng nhập</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </Link>

          {/* Register Button */}
          <Link
            to="/register"
            className="group w-full block text-center border-2 border-green-600 text-green-600 py-4 rounded-2xl font-semibold hover:bg-green-600 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span className="flex items-center justify-center gap-2">
              <span>Đăng ký tài khoản</span>
              <span className="transition-transform group-hover:translate-x-1">✨</span>
            </span>
          </Link>

          {/* Guest Link */}
          <Link
            to="/home"
            className="group w-full block text-center text-gray-600 hover:text-green-600 py-3 font-medium transition-colors duration-300"
          >
            <span className="flex items-center justify-center gap-2">
              <span>Tiếp tục với tư cách khách</span>
              <span className="transition-transform group-hover:translate-x-1">👤</span>
            </span>
          </Link>
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center text-gray-500 text-sm">
          <p>© 2024 Green Mart. Mua sắm xanh, tương lai sáng.</p>
        </div>
      </div>
    </div>
  );
}