import React from 'react';
import { useUser } from '../../reduxSlice/UserContext';
import DashboardLayout from '../../layouts/DashboardLayout';

const AccountDetails: React.FC = () => {
  const { userInfo, setUserInfo } = useUser();

  return (
    <DashboardLayout>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Thông tin tài khoản</h2>
        <div className="mt-6">
          <div className="flex items-center py-4 border-b">
            <div className="w-full">
              <label htmlFor="full-name" className="font-semibold text-gray-600">
                Họ và tên
              </label>
              <input
                id="full-name"
                type="text"
                value={userInfo.fullName}
                onChange={(e) => setUserInfo({ ...userInfo, fullName: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                placeholder="Nhập họ và tên"
              />
            </div>
            <button className="text-gray-800 ml-4">Chỉnh sửa</button>
          </div>
          <div className="flex items-center py-4 border-b">
            <div className="w-full">
              <label htmlFor="mobile-number" className="font-semibold text-gray-600">
                Số điện thoại
              </label>
              <input
                id="mobile-number"
                type="text"
                value={userInfo.phone}
                onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                placeholder="Nhập số điện thoại"
              />
            </div>
            <button className="text-gray-800 ml-4">Chỉnh sửa</button>
          </div>
          <div className="flex items-center py-4">
            <div className="w-full">
              <label htmlFor="email-address" className="font-semibold text-gray-600">
                Địa chỉ email
              </label>
              <input
                id="email-address"
                type="email"
                value={userInfo.email}
                onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                placeholder="Nhập địa chỉ email"
              />
            </div>
            <button className="text-gray-800 ml-4">Chỉnh sửa</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccountDetails;