import { FaUser, FaMapMarkerAlt, FaCreditCard, FaBell, FaGift, FaBook, FaCog, FaQuestionCircle, FaSignOutAlt } from "react-icons/fa";

const Sidebar = () => {
  const menuItems = [
    { icon: <FaUser />, label: "Account Details" },
    { icon: <FaMapMarkerAlt />, label: "My Addresses" },
    { icon: <FaCreditCard />, label: "My Payments" },
    { icon: <FaBell />, label: "Notification Setting" },
    { icon: <FaGift />, label: "Coupons" },
    { icon: <FaBook />, label: "My Recipes" },
    { icon: <FaCog />, label: "Account Settings" },
    { icon: <FaQuestionCircle />, label: "Help Center" }
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
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
      <div className="absolute bottom-6 left-6 flex items-center gap-3 text-gray-700 hover:text-red-500 cursor-pointer">
        <FaSignOutAlt />
        <span>Logout</span>
      </div>
    </aside>
  );
};

export default Sidebar;
