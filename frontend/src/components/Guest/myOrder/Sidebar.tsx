import { Link } from 'react-router-dom';
import { FaUser, FaMapMarkerAlt, FaCreditCard, FaBell, FaGift, FaBook, FaCog, FaQuestionCircle, FaSignOutAlt, FaBox } from 'react-icons/fa';

const Sidebar: React.FC = () => {
  const menuItems = [
    { icon: <FaUser />, label: 'Thông tin tài khoản', path: '/accountdetail' },
    { icon: <FaBox />, label: 'Đơn hàng của tôi', path: '/myorder' },
    { icon: <FaMapMarkerAlt />, label: 'Địa chỉ của tôi', path: '/myaddress' },
    { icon: <FaCreditCard />, label: 'Phương thức thanh toán', path: '/mypayment' },
    { icon: <FaBell />, label: 'Cài đặt thông báo', path: '/notification-settings' },
    { icon: <FaGift />, label: 'Giới thiệu bạn bè', path: '/refer-friends' },
    { icon: <FaBook />, label: 'Mã giảm giá', path: '/coupons' },
    { icon: <FaBook />, label: 'Công thức của tôi', path: '/my-recipes' },
    { icon: <FaCog />, label: 'Cài đặt tài khoản', path: '/account-settings' },
    { icon: <FaQuestionCircle />, label: 'Trung tâm trợ giúp', path: '/help-center' },
  ];

  return (
    <aside className="w-64 p-6 bg-white border-r">
      <div className="flex items-center gap-3 mb-6">
        <img src="https://i.pravatar.cc/40" alt="Avatar" className="rounded-full" />
        <div>
          <h4 className="font-semibold">Alicii Virgo</h4>
        </div>
      </div>
      <ul className="space-y-4">
        {menuItems.map((item, index) => (
          <li key={index} className="flex items-center gap-3 text-gray-700 hover:text-purple-600 cursor-pointer">
            {item.icon}
            <Link to={item.path} className="w-full">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="absolute bottom-6 left-6 flex items-center gap-3 text-gray-700 hover:text-red-500 cursor-pointer">
        <FaSignOutAlt />
        <Link to="/login" className="w-full">
          Đăng xuất
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;