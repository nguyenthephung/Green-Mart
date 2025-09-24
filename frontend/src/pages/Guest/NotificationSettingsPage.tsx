import React, { useState, useEffect } from 'react';
import { useNotificationStore } from '../../stores/useNotificationStore';
import DashboardLayout from '../../layouts/DashboardLayout';

const NotificationSettingsPage: React.FC = () => {
  const { settings, updateSettings, fetchSettings } = useNotificationStore();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Log dữ liệu settings và localSettings để kiểm tra
  useEffect(() => {
    // ...existing code (đã xóa log)...
  }, [settings, localSettings]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = (key: string) => {
    if (!localSettings?.settings) return;

    // ...existing code (đã xóa log)...

    setLocalSettings(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        settings: {
          ...prev.settings,
          [key]: !prev.settings[key as keyof typeof prev.settings],
        },
      };
    });
    setSaved(false);
  };

  const handleSave = async () => {
    if (!localSettings) return;

    setSaving(true);
    try {
      // Chỉ truyền đúng các trường backend yêu cầu
      const payload = {
        settings: localSettings.settings,
        pushNotifications: localSettings.pushNotifications,
        emailNotifications: localSettings.emailNotifications,
        smsNotifications: localSettings.smsNotifications,
      };
      await updateSettings(payload);
      await fetchSettings(); // Fetch lại settings từ backend sau khi lưu
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      // ...existing code (đã xóa log)...
    } finally {
      setSaving(false);
    }
  };

  // Define notification types for mapping
  const notificationTypes = [
    {
      key: 'order',
      label: 'Thông báo đơn hàng',
      description: 'Nhận thông báo về trạng thái đơn hàng, giao hàng',
      color: 'green',
      icon: (
        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
      ),
    },
    {
      key: 'promotion',
      label: 'Khuyến mãi & Ưu đãi',
      description: 'Nhận thông báo về các chương trình khuyến mãi mới',
      color: 'orange',
      icon: (
        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
        </div>
      ),
    },
    {
      key: 'system',
      label: 'Thông báo hệ thống',
      description: 'Nhận thông báo về cập nhật hệ thống, bảo trì',
      color: 'blue',
      icon: (
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
          </svg>
        </div>
      ),
    },
  ];

  const enabledCount = notificationTypes.filter(
    ({ key }) => localSettings?.settings?.[key as keyof typeof localSettings.settings]
  ).length;
  const disabledCount = notificationTypes.length - enabledCount;

  return (
    <DashboardLayout>
      <div className="bg-white dark:bg-gray-950 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-200 mb-2 flex items-center justify-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 sm:w-6 sm:h-6 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            Cài đặt thông báo
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Quản lý các loại thông báo bạn muốn nhận
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-green-50 dark:bg-gray-950 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{enabledCount}</div>
                <div className="text-sm sm:text-base text-gray-600">Đã bật</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-950 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                  />
                </svg>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{disabledCount}</div>
                <div className="text-sm sm:text-base text-gray-600">Đã tắt</div>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-gray-950 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0v1a1 1 0 01-1 1H8a1 1 0 01-1-1V4m0 0H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2h-3"
                  />
                </svg>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {notificationTypes.length}
                </div>
                <div className="text-sm sm:text-base text-gray-600">Tổng loại</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-950 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
          <div className="space-y-4 sm:space-y-6">
            {notificationTypes.map(({ key, label, description, icon }) => {
              const isEnabled =
                localSettings?.settings?.[key as keyof typeof localSettings.settings] || false;
              return (
                <div
                  key={key}
                  className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl transition-all duration-300 ${
                    key === 'order'
                      ? 'bg-green-50 dark:bg-gray-950'
                      : key === 'promotion'
                        ? 'bg-orange-50 dark:bg-gray-950'
                        : 'bg-blue-50 dark:bg-gray-950'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-4 sm:gap-6">
                    <div className="flex-shrink-0">
                      {/* Mobile icon */}
                      <div className="sm:hidden">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            key === 'order'
                              ? 'bg-green-500'
                              : key === 'promotion'
                                ? 'bg-orange-500'
                                : 'bg-blue-500'
                          }`}
                        >
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            {key === 'order' && (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                              />
                            )}
                            {key === 'promotion' && (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                              />
                            )}
                            {key === 'system' && (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                              />
                            )}
                          </svg>
                        </div>
                      </div>
                      {/* Desktop icon */}
                      <div className="hidden sm:block">{icon}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start sm:items-center justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-200">
                            {label}
                          </h3>
                          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                            {description}
                          </p>
                        </div>
                        <button
                          type="button"
                          className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 flex-shrink-0 ${
                            isEnabled
                              ? key === 'order'
                                ? 'bg-green-600 focus:ring-green-500'
                                : key === 'promotion'
                                  ? 'bg-orange-600 focus:ring-orange-500'
                                  : 'bg-blue-600 focus:ring-blue-500'
                              : 'bg-gray-200 dark:bg-gray-600 focus:ring-gray-500'
                          }`}
                          onClick={() => handleChange(key)}
                        >
                          <span
                            className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                              isEnabled ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                            isEnabled
                              ? key === 'order'
                                ? 'bg-green-500'
                                : key === 'promotion'
                                  ? 'bg-orange-500'
                                  : 'bg-blue-500'
                              : 'bg-gray-400'
                          }`}
                        ></div>
                        <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                          {isEnabled ? 'Đã bật' : 'Đã tắt'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                saving
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : saved
                    ? 'bg-green-600 text-white'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl'
              }`}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang lưu...
                </span>
              ) : saved ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Đã lưu
                </span>
              ) : (
                'Lưu thay đổi'
              )}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotificationSettingsPage;
