import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { FaShieldAlt, FaTruck, FaQuestionCircle, FaUndo, FaFileContract, FaLock } from 'react-icons/fa';


const PolicyPage: React.FC = () => {
  const { section } = useParams<{ section: string }>();

  const policies = {
    faqs: {
      title: 'Câu hỏi thường gặp',
      icon: <FaQuestionCircle className="text-green-500" />,
      content: [
        {
          question: 'Làm thế nào để đặt hàng?',
          answer: 'Bạn có thể đặt hàng qua website, ứng dụng di động hoặc gọi điện trực tiếp đến hotline của chúng tôi.'
        },
        {
          question: 'Thời gian giao hàng là bao lâu?',
          answer: 'Thông thường từ 1-3 ngày làm việc tùy thuộc vào khu vực giao hàng.'
        },
        {
          question: 'Tôi có thể thanh toán bằng cách nào?',
          answer: 'Chúng tôi hỗ trợ thanh toán bằng tiền mặt, chuyển khoản, thẻ tín dụng và ví điện tử.'
        }
      ]
    },
    shipping: {
      title: 'Chính sách giao hàng',
      icon: <FaTruck className="text-blue-500" />,
      content: [
        {
          question: 'Phí giao hàng',
          answer: 'Miễn phí giao hàng cho đơn hàng từ 300.000đ. Phí giao hàng 30.000đ cho đơn hàng dưới 300.000đ.'
        },
        {
          question: 'Thời gian giao hàng',
          answer: 'Nội thành Hà Nội và TP.HCM: 1-2 ngày. Các tỉnh thành khác: 2-5 ngày làm việc.'
        },
        {
          question: 'Kiểm tra hàng hóa',
          answer: 'Khách hàng được kiểm tra hàng hóa trước khi thanh toán và có quyền từ chối nếu không đúng yêu cầu.'
        }
      ]
    },
    return: {
      title: 'Chính sách đổi trả & Hoàn tiền',
      icon: <FaUndo className="text-orange-500" />,
      content: [
        {
          question: 'Điều kiện đổi trả',
          answer: 'Sản phẩm còn nguyên vẹn, chưa sử dụng, trong vòng 7 ngày kể từ ngày nhận hàng.'
        },
        {
          question: 'Quy trình đổi trả',
          answer: 'Liên hệ hotline → Gửi hàng về → Kiểm tra → Đổi/Trả tiền trong 3-5 ngày làm việc.'
        },
        {
          question: 'Chi phí đổi trả',
          answer: 'Miễn phí đổi trả nếu lỗi từ phía GreenMart. Khách hàng chịu phí ship nếu đổi ý.'
        }
      ]
    },
    terms: {
      title: 'Điều khoản sử dụng',
      icon: <FaFileContract className="text-purple-500" />,
      content: [
        {
          question: 'Quyền và nghĩa vụ của khách hàng',
          answer: 'Khách hàng có quyền được cung cấp thông tin chính xác về sản phẩm và phải thanh toán đầy đủ theo thỏa thuận.'
        },
        {
          question: 'Quy định về tài khoản',
          answer: 'Mỗi khách hàng chỉ được tạo một tài khoản và chịu trách nhiệm bảo mật thông tin đăng nhập.'
        },
        {
          question: 'Chính sách hủy đơn hàng',
          answer: 'Khách hàng có thể hủy đơn hàng trước khi hàng được giao đi mà không mất phí.'
        }
      ]
    },
    privacy: {
      title: 'Chính sách bảo mật',
      icon: <FaShieldAlt className="text-red-500" />,
      content: [
        {
          question: 'Thu thập thông tin',
          answer: 'Chúng tôi chỉ thu thập thông tin cần thiết để xử lý đơn hàng và cải thiện dịch vụ.'
        },
        {
          question: 'Sử dụng thông tin',
          answer: 'Thông tin được sử dụng để xử lý đơn hàng, giao hàng và liên lạc với khách hàng khi cần thiết.'
        },
        {
          question: 'Bảo vệ thông tin',
          answer: 'Chúng tôi áp dụng các biện pháp bảo mật cao nhất để bảo vệ thông tin cá nhân của khách hàng.'
        }
      ]
    },
    security: {
      title: 'Bảo mật thông tin',
      icon: <FaLock className="text-indigo-500" />,
      content: [
        {
          question: 'Mã hóa dữ liệu',
          answer: 'Tất cả dữ liệu nhạy cảm được mã hóa bằng SSL 256-bit để đảm bảo an toàn tuyệt đối.'
        },
        {
          question: 'Xác thực 2 lớp',
          answer: 'Chúng tôi khuyến khích sử dụng xác thực 2 lớp để tăng cường bảo mật tài khoản.'
        },
        {
          question: 'Giám sát an ninh',
          answer: 'Hệ thống được giám sát 24/7 để phát hiện và ngăn chặn các hoạt động bất thường.'
        }
      ]
    }
  };

  if (!section || !policies[section as keyof typeof policies]) {
    return <Navigate to="/" replace />;
  }

  const policy = policies[section as keyof typeof policies];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-lg">
              {policy.icon}
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {policy.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Thông tin chi tiết về {policy.title.toLowerCase()}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="space-y-8">
              {policy.content.map((item, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-6 last:pb-0">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {item.question}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Cần hỗ trợ thêm?</h3>
          <p className="mb-6">Liên hệ với chúng tôi để được tư vấn chi tiết</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+84123456789"
              className="px-6 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              📞 0123 456 789
            </a>
            <a
              href="mailto:contact@greenmart.vn"
              className="px-6 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              ✉️ contact@greenmart.vn
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;
