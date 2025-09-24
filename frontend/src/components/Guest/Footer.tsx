import { Link, useNavigate } from 'react-router-dom';
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaLeaf,
  FaCertificate,
  FaTruck,
  FaShieldAlt,
} from 'react-icons/fa';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handlePolicyClick = (section: string) => {
    // Navigate to a specific policy section
    navigate(`/policy/${section}`);
  };

  const handleContactClick = (type: 'email' | 'phone') => {
    if (type === 'email') {
      window.open('mailto:contact@greenmart.vn', '_blank');
    } else if (type === 'phone') {
      window.open('tel:+84123456789', '_blank');
    }
  };
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 dark:from-gray-950 dark:via-gray-900 dark:to-green-950 text-white mt-16 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-green-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-green-600 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 py-4">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <FaLeaf className="text-green-200" />
                <span>100% Organic</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCertificate className="text-green-200" />
                <span>Chứng nhận chất lượng</span>
              </div>
              <div className="flex items-center gap-2">
                <FaTruck className="text-green-200" />
                <span>Giao hàng miễn phí</span>
              </div>
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-green-200" />
                <span>Bảo hành 100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {/* Company Info */}
              <div className="lg:col-span-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative">
                    <img
                      src="/logo.jpg"
                      alt="GreenMart Logo"
                      className="h-16 w-16 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300 ring-2 ring-green-400"
                    />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-1">GreenMart</h3>
                    <p className="text-green-300 text-sm font-medium">Fresh & Organic</p>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Nền tảng mua sắm thực phẩm organic và tươi sống hàng đầu Việt Nam. Cam kết mang
                  đến cho bạn những sản phẩm chất lượng cao nhất.
                </p>

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-300 hover:text-green-400 transition-colors">
                    <div className="p-2 bg-green-600 rounded-lg">
                      <FaPhone size={14} />
                    </div>
                    <span>1900 1234</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300 hover:text-green-400 transition-colors">
                    <div className="p-2 bg-green-600 rounded-lg">
                      <FaEnvelope size={14} />
                    </div>
                    <span>support@greenmart.vn</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300 hover:text-green-400 transition-colors">
                    <div className="p-2 bg-green-600 rounded-lg">
                      <FaMapMarkerAlt size={14} />
                    </div>
                    <span>123 Đường ABC, Quận 1, TP.HCM</span>
                  </div>
                </div>
              </div>
              {/* Quick Links */}
              <div>
                <h4 className="font-bold text-xl mb-6 text-white relative">
                  Về GreenMart
                  <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
                </h4>
                <ul className="space-y-4">
                  <li>
                    <Link
                      to="/about"
                      className="text-gray-300 hover:text-green-400 flex items-center gap-2 group transition-all duration-300"
                    >
                      <span className="w-1 h-1 bg-green-400 rounded-full group-hover:w-2 transition-all duration-300"></span>
                      Giới thiệu
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/branches"
                      className="text-gray-300 hover:text-green-400 flex items-center gap-2 group transition-all duration-300"
                    >
                      <span className="w-1 h-1 bg-green-400 rounded-full group-hover:w-2 transition-all duration-300"></span>
                      Hệ thống cửa hàng
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/changelog"
                      className="text-gray-300 hover:text-green-400 flex items-center gap-2 group transition-all duration-300"
                    >
                      <span className="w-1 h-1 bg-green-400 rounded-full group-hover:w-2 transition-all duration-300"></span>
                      Tin tức & Sự kiện
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/careers"
                      className="text-gray-300 hover:text-green-400 flex items-center gap-2 group transition-all duration-300"
                    >
                      <span className="w-1 h-1 bg-green-400 rounded-full group-hover:w-2 transition-all duration-300"></span>
                      Tuyển dụng
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Customer Service */}
              <div>
                <h4 className="font-bold text-xl mb-6 text-white relative">
                  Hỗ trợ khách hàng
                  <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
                </h4>
                <ul className="space-y-4">
                  <li>
                    <button
                      onClick={() => handlePolicyClick('faqs')}
                      className="text-gray-300 hover:text-green-400 flex items-center gap-2 group transition-all duration-300 w-full text-left"
                    >
                      <span className="w-1 h-1 bg-green-400 rounded-full group-hover:w-2 transition-all duration-300"></span>
                      Câu hỏi thường gặp
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handlePolicyClick('shipping')}
                      className="text-gray-300 hover:text-green-400 flex items-center gap-2 group transition-all duration-300 w-full text-left"
                    >
                      <span className="w-1 h-1 bg-green-400 rounded-full group-hover:w-2 transition-all duration-300"></span>
                      Chính sách giao hàng
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handlePolicyClick('return')}
                      className="text-gray-300 hover:text-green-400 flex items-center gap-2 group transition-all duration-300 w-full text-left"
                    >
                      <span className="w-1 h-1 bg-green-400 rounded-full group-hover:w-2 transition-all duration-300"></span>
                      Đổi trả & Hoàn tiền
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleContactClick('email')}
                      className="text-gray-300 hover:text-green-400 flex items-center gap-2 group transition-all duration-300 w-full text-left"
                    >
                      <span className="w-1 h-1 bg-green-400 rounded-full group-hover:w-2 transition-all duration-300"></span>
                      Liên hệ hỗ trợ
                    </button>
                  </li>
                </ul>
              </div>

              {/* Legal & Social */}
              <div>
                <h4 className="font-bold text-xl mb-6 text-white relative">
                  Pháp lý & Kết nối
                  <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
                </h4>
                <ul className="space-y-4 mb-8">
                  <li>
                    <button
                      onClick={() => handlePolicyClick('terms')}
                      className="text-gray-300 hover:text-green-400 flex items-center gap-2 group transition-all duration-300 w-full text-left"
                    >
                      <span className="w-1 h-1 bg-green-400 rounded-full group-hover:w-2 transition-all duration-300"></span>
                      Điều khoản sử dụng
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handlePolicyClick('privacy')}
                      className="text-gray-300 hover:text-green-400 flex items-center gap-2 group transition-all duration-300 w-full text-left"
                    >
                      <span className="w-1 h-1 bg-green-400 rounded-full group-hover:w-2 transition-all duration-300"></span>
                      Chính sách bảo mật
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handlePolicyClick('security')}
                      className="text-gray-300 hover:text-green-400 flex items-center gap-2 group transition-all duration-300 w-full text-left"
                    >
                      <span className="w-1 h-1 bg-green-400 rounded-full group-hover:w-2 transition-all duration-300"></span>
                      Bảo mật thông tin
                    </button>
                  </li>
                </ul>

                {/* Social Media */}
                <div>
                  <h5 className="font-semibold text-white mb-4">Theo dõi chúng tôi</h5>
                  <div className="flex gap-3">
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all duration-300 hover:scale-110 group"
                      title="Facebook"
                    >
                      <FaFacebook
                        size={20}
                        className="group-hover:scale-110 transition-transform"
                      />
                    </a>
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl transition-all duration-300 hover:scale-110 group"
                      title="Instagram"
                    >
                      <FaInstagram
                        size={20}
                        className="group-hover:scale-110 transition-transform"
                      />
                    </a>
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-blue-400 hover:bg-blue-500 rounded-xl transition-all duration-300 hover:scale-110 group"
                      title="Twitter"
                    >
                      <FaTwitter size={20} className="group-hover:scale-110 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Newsletter Subscription */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 py-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Đăng ký nhận tin tức</h3>
              <p className="text-green-100 mb-6">
                Nhận thông tin về sản phẩm mới và ưu đãi đặc biệt
              </p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Nhập email của bạn..."
                  className="flex-1 px-4 py-3 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-white text-gray-800 placeholder-gray-500"
                />
                <button
                  type="submit"
                  className="bg-white text-green-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-600"
                >
                  Đăng ký
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-700 py-6">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <p className="text-gray-400 text-sm">
                  © 2025 <span className="text-green-400 font-semibold">GreenMart</span>. Đã đăng
                  ký bản quyền. Thiết kế bởi
                  <span className="text-green-400 font-medium"> GreenMart Team</span>
                </p>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Server Status: Online
                </span>
                <span>Version 2.1.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
