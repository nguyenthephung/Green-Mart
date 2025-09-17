import React, { useState, useEffect } from 'react';
import { useUserStore } from '../../stores/useUserStore';
import { profileService } from '../../services/profileService';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from '../../components/Loading';
import { useResponsive } from '../../hooks/useResponsive';

const AccountDetails: React.FC = () => {
  const user = useUserStore(state => state.user);
  const { isMobile } = useResponsive();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tempInfo, setTempInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || ''
  });
  const [avatar, setAvatar] = useState(user?.avatar || `https://i.pravatar.cc/120?u=${user?.email || 'user'}`);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    // Update tempInfo when user data changes
    if (user) {
      setTempInfo({
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || ''
      });
      // Luôn ưu tiên Cloudinary URL khi load lại trang
      setAvatar(user.avatar || `https://i.pravatar.cc/120?u=${user.email || 'user'}`);
    }
  }, [user]);

  const handleEdit = () => {
    if (user) {
      setTempInfo({
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || ''
      });
    }
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    if (user) {
      setTempInfo({
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || ''
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Kiểm tra avatar có phải Cloudinary URL không
      const avatarUrl = tempInfo.avatar;
      if (avatarUrl && avatarUrl.startsWith('blob:')) {
        alert('Vui lòng chọn và upload lại ảnh đại diện!');
        setLoading(false);
        return;
      }
      const result = await profileService.updateProfile({
        name: tempInfo.fullName,
        phone: tempInfo.phone,
        avatar: avatarUrl // luôn lấy từ tempInfo, đã được cập nhật Cloudinary URL
      });
      if (result.success) {
        setEditMode(false);
        console.log('Profile updated successfully');
        // Refresh page to get updated user data
        window.location.reload();
      } else {
        console.error('Failed to update profile:', result.message);
        // You can show error message to user here
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      // You can show error message to user here
    } finally {
      setLoading(false);
    }
  };
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Show temporary preview
      const tempUrl = URL.createObjectURL(file);
      setAvatar(tempUrl);
      // Upload to Cloudinary
      try {
        const res = await profileService.uploadAvatar(file);
        if (res.success && res.data && res.data.imageUrl) {
          setAvatar(res.data.imageUrl);
          setTempInfo(prev => ({ ...prev, avatar: res.data.imageUrl }));
        } else {
          console.error('Avatar upload failed:', res.message);
        }
      } catch (err) {
        console.error('Avatar upload error:', err);
      }
    }
  };

  // Show loading state if user is not loaded yet
  if (!user) {
    return (
      <DashboardLayout>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg max-w-2xl mx-auto mt-6 border border-gray-200 dark:border-gray-600">
          <LoadingSpinner
            size="md"
            text="Đang tải thông tin..."
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="bg-app-card p-4 lg:p-8 rounded-3xl shadow-xl max-w-3xl mx-auto mt-6 border-app-default">
        {/* Header */}
        <div className="text-center mb-6 lg:mb-8">
          <h2 className={`font-bold text-app-primary mb-2 flex items-center justify-center gap-2 lg:gap-3 ${
            isMobile ? 'text-2xl' : 'text-3xl'
          }`}>
            <div className={`bg-brand-green rounded-full flex items-center justify-center ${
              isMobile ? 'w-8 h-8' : 'w-10 h-10'
            }`}>
              <svg className={`text-white ${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            Thông tin tài khoản
          </h2>
          <p className={`text-app-secondary ${isMobile ? 'text-sm' : ''}`}>
            Quản lý và cập nhật thông tin cá nhân của bạn
          </p>
        </div>

        {/* Avatar Section */}
        <div className={`flex flex-col items-center bg-app-secondary rounded-2xl p-4 lg:p-6 border-app-default ${
          isMobile ? 'mb-6' : 'mb-10'
        }`}>
          <div className="relative group">
            <div className={`rounded-full bg-gradient-to-br from-green-400 to-emerald-500 p-1 shadow-xl ${
              isMobile ? 'w-24 h-24' : 'w-32 h-32'
            }`}>
              <img 
                src={avatar} 
                alt="avatar" 
                className="w-full h-full rounded-full object-cover bg-app-input"
              />
            </div>
            {editMode && (
              <label className="absolute bottom-2 right-2 bg-app-input rounded-full p-2 shadow-lg cursor-pointer hover:bg-green-50 dark:hover:bg-gray-500 transition-all group-hover:scale-110">
                <svg className="w-5 h-5 text-brand-green" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            )}
          </div>
          <div className="mt-4 text-center">
            <h3 className="text-xl font-semibold text-app-primary">{user?.name || 'Người dùng'}</h3>
            <p className="text-app-secondary">{user?.email}</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-app-card rounded-2xl p-8 shadow-lg border-app-default">
          <form className="space-y-8">
            {/* Họ và tên */}
            <div className="group">
              <label htmlFor="full-name" className="flex items-center gap-3 font-semibold text-app-primary mb-3">
                <div className="w-8 h-8 bg-brand-green/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-brand-green" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                Họ và tên
              </label>
              <input
                id="full-name"
                type="text"
                value={editMode ? tempInfo.fullName : (user?.name || '')}
                onChange={e => setTempInfo({ ...tempInfo, fullName: e.target.value })}
                className={`w-full px-4 py-4 border-2 rounded-xl shadow-sm transition-all duration-200 ${
                  editMode 
                    ? 'form-control-focus' 
                    : 'form-control-disabled'
                } focus:outline-none text-app-primary placeholder-app-muted`}
                placeholder="Nhập họ và tên"
                disabled={!editMode}
              />
            </div>

            {/* Số điện thoại */}
            <div className="group">
              <label htmlFor="mobile-number" className="flex items-center gap-3 font-semibold text-app-primary mb-3">
                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 002-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                Số điện thoại
              </label>
              <input
                id="mobile-number"
                type="text"
                value={editMode ? tempInfo.phone : (user?.phone || '')}
                onChange={e => setTempInfo({ ...tempInfo, phone: e.target.value })}
                className={`w-full px-4 py-4 border-2 rounded-xl shadow-sm transition-all duration-200 ${
                  editMode 
                    ? 'form-control-focus' 
                    : 'form-control-disabled'
                } focus:outline-none text-app-primary placeholder-app-muted`}
                placeholder="Nhập số điện thoại"
                disabled={!editMode}
              />
            </div>

            {/* Email */}
            <div className="group">
              <label htmlFor="email-address" className="flex items-center gap-3 font-semibold text-app-primary mb-3">
                <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                Địa chỉ email
              </label>
              <input
                id="email-address"
                type="email"
                value={editMode ? tempInfo.email : (user?.email || '')}
                onChange={e => setTempInfo({ ...tempInfo, email: e.target.value })}
                className={`w-full px-4 py-4 border-2 rounded-xl shadow-sm transition-all duration-200 ${
                  editMode 
                    ? 'form-control-focus' 
                    : 'form-control-disabled'
                } focus:outline-none text-app-primary placeholder-app-muted`}
                placeholder="Nhập địa chỉ email"
                disabled={!editMode}
              />
            </div>
          </form>

          {/* Action Buttons */}
          <div className="mt-10 flex justify-end gap-4">
            {editMode ? (
              <>
                <button
                  type="button"
                  className="btn-secondary flex items-center gap-2"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  className="btn-primary flex items-center gap-2"
                  onClick={handleEdit}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Chỉnh sửa thông tin
                </button>
                <Link
                  to="/change-password"
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2v6m0 0a2 2 0 01-2 2m2-2h-6m6 0a2 2 0 01-2 2m0 0H9a2 2 0 01-2-2m0 0V9a2 2 0 012-2m0 0a2 2 0 012-2" />
                  </svg>
                  Đổi mật khẩu
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccountDetails;