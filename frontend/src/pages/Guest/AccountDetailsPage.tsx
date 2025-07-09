import React, { useState } from 'react';
import { useUser } from '../../reduxSlice/UserContext';
import DashboardLayout from '../../layouts/DashboardLayout';

const AccountDetails: React.FC = () => {
  const { userInfo, setUserInfo } = useUser();
  const [editMode, setEditMode] = useState(false);
  const [tempInfo, setTempInfo] = useState(userInfo);
  const [avatar, setAvatar] = useState(userInfo.avatar || 'https://i.pravatar.cc/120?u=' + (userInfo.email || 'user'));

  const handleEdit = () => {
    setTempInfo(userInfo);
    setEditMode(true);
  };
  const handleCancel = () => {
    setEditMode(false);
    setTempInfo(userInfo);
  };
  const handleSave = () => {
    setUserInfo({ ...tempInfo, avatar });
    setEditMode(false);
  };
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setAvatar(url);
    }
  };

  return (
    <DashboardLayout>
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-2xl mx-auto mt-6">
        <h2 className="text-2xl font-bold text-green-700 mb-8 flex items-center gap-2">
          <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          Thông tin tài khoản
        </h2>
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <img src={avatar} alt="avatar" className="w-28 h-28 rounded-full object-cover border-4 border-green-200 shadow" />
            {editMode && (
              <label className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow cursor-pointer hover:bg-green-100 transition">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2H7v-2a2 2 0 012-2h2v2a2 2 0 01-2 2z" /></svg>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            )}
          </div>
          <div className="mt-2 text-gray-500 text-sm">Ảnh đại diện</div>
        </div>
        <form className="space-y-6">
          {/* Họ và tên */}
          <div className="flex items-center gap-3">
            <span className="text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </span>
            <div className="w-full">
              <label htmlFor="full-name" className="font-semibold text-gray-600">Họ và tên</label>
              <input
                id="full-name"
                type="text"
                value={editMode ? tempInfo.fullName : userInfo.fullName}
                onChange={e => setTempInfo({ ...tempInfo, fullName: e.target.value })}
                className={`mt-1 block w-full px-3 py-2 border ${editMode ? 'border-green-400 bg-white' : 'border-gray-200 bg-gray-100'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent`}
                placeholder="Nhập họ và tên"
                disabled={!editMode}
              />
            </div>
          </div>
          {/* Số điện thoại */}
          <div className="flex items-center gap-3">
            <span className="text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm0 10a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2zm8-8h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V7a2 2 0 012-2zm0 10h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2a2 2 0 012-2z" /></svg>
            </span>
            <div className="w-full">
              <label htmlFor="mobile-number" className="font-semibold text-gray-600">Số điện thoại</label>
              <input
                id="mobile-number"
                type="text"
                value={editMode ? tempInfo.phone : userInfo.phone}
                onChange={e => setTempInfo({ ...tempInfo, phone: e.target.value })}
                className={`mt-1 block w-full px-3 py-2 border ${editMode ? 'border-green-400 bg-white' : 'border-gray-200 bg-gray-100'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent`}
                placeholder="Nhập số điện thoại"
                disabled={!editMode}
              />
            </div>
          </div>
          {/* Email */}
          <div className="flex items-center gap-3">
            <span className="text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12H8m8 0a4 4 0 11-8 0 4 4 0 018 0zm-8 0V8a4 4 0 018 0v4" /></svg>
            </span>
            <div className="w-full">
              <label htmlFor="email-address" className="font-semibold text-gray-600">Địa chỉ email</label>
              <input
                id="email-address"
                type="email"
                value={editMode ? tempInfo.email : userInfo.email}
                onChange={e => setTempInfo({ ...tempInfo, email: e.target.value })}
                className={`mt-1 block w-full px-3 py-2 border ${editMode ? 'border-green-400 bg-white' : 'border-gray-200 bg-gray-100'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent`}
                placeholder="Nhập địa chỉ email"
                disabled={!editMode}
              />
            </div>
          </div>
        </form>
        <div className="mt-8 flex justify-end gap-3">
          {editMode ? (
            <>
              <button
                type="button"
                className="px-5 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
                onClick={handleCancel}
              >Hủy</button>
              <button
                type="button"
                className="px-6 py-2 rounded bg-green-700 text-white font-semibold hover:bg-green-800 transition"
                onClick={handleSave}
              >Lưu</button>
            </>
          ) : (
            <button
              type="button"
              className="px-6 py-2 rounded bg-green-700 text-white font-semibold hover:bg-green-800 transition"
              onClick={handleEdit}
            >Chỉnh sửa</button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccountDetails;