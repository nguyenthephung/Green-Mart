import React, { useState, useEffect, useCallback } from 'react';
import { useUserStore } from '../../stores/useUserStore';
import DashboardLayout from '../../layouts/DashboardLayout';
import { type UserAddress } from '../../components/Guest/Account/AddressSelector';
import { AddressService, type AddressResponse } from '../../services/addressService';
import {
  LocationService,
  type Province,
  type District,
  type Ward,
} from '../../services/locationService';
import type { AddressInfo } from '../../types/User';
import { useResponsive } from '../../hooks/useResponsive';

// Address Form Component
interface AddressFormContentProps {
  address: UserAddress | null;
  onSubmit: (data: UserAddress) => void;
  onCancel: () => void;
  loading: boolean;
  submitText: string;
}

const AddressFormContent: React.FC<AddressFormContentProps> = ({
  address,
  onSubmit,
  onCancel,
  loading,
  submitText,
}) => {
  const [formData, setFormData] = useState<UserAddress>({
    fullName: address?.fullName || '',
    phone: address?.phone || '',
    city: address?.city || '',
    district: address?.district || '',
    ward: address?.ward || '',
    street: address?.street || '',
    address: address?.address || '',
    label: address?.label || '',
    wardName: address?.wardName || '',
    latitude: address?.latitude || 0,
    longitude: address?.longitude || 0,
  });

  const [errors, setErrors] = useState<Partial<UserAddress>>({});

  // Location state
  const [provinces] = useState<Province[]>(LocationService.getProvinces());
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('');
  const [shippingFee, setShippingFee] = useState<number>(0);

  // Initialize location data if editing
  useEffect(() => {
    if (address) {
      // Try to find matching province/district/ward
      const province = provinces.find(
        p => p.name === address.district || p.districts.some(d => d.name === address.district)
      );

      if (province) {
        setSelectedProvince(province.code);
        setDistricts(province.districts);

        const district = province.districts.find(d => d.name === address.district);
        if (district) {
          setSelectedDistrict(district.code);
          setWards(district.wards);

          const ward = district.wards.find(w => w.name === address.ward);
          if (ward) {
            setSelectedWard(ward.code);
          }
        }
      }
    }
  }, [address, provinces]);

  // Update districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      const newDistricts = LocationService.getDistrictsByProvince(selectedProvince);
      setDistricts(newDistricts);
      setSelectedDistrict('');
      setSelectedWard('');
      setWards([]);
    }
  }, [selectedProvince]);

  // Update wards when district changes
  useEffect(() => {
    if (selectedDistrict) {
      const newWards = LocationService.getWardsByDistrict(selectedDistrict);
      setWards(newWards);
      setSelectedWard('');

      // Calculate shipping fee
      const fee = LocationService.calculateShippingFee(selectedProvince);
      setShippingFee(fee);
    }
  }, [selectedDistrict, selectedProvince]);

  // Update form data when location changes
  useEffect(() => {
    const province = LocationService.getProvinceByCode(selectedProvince);
    const district = LocationService.getDistrictByCode(selectedDistrict);
    const ward = LocationService.getWardByCode(selectedWard);

    if (province && district) {
      setFormData(prev => ({
        ...prev,
        city: province.name,
        district: district.name,
        ward: ward?.name || '',
        wardName: ward?.name || '',
      }));
    }
  }, [selectedProvince, selectedDistrict, selectedWard]);

  const validateForm = () => {
    const newErrors: Partial<UserAddress> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
    if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    if (!selectedProvince) newErrors.district = 'Vui lòng chọn tỉnh/thành phố';
    if (!selectedDistrict) newErrors.district = 'Vui lòng chọn quận/huyện';
    if (!selectedWard) newErrors.ward = 'Vui lòng chọn phường/xã';
    if (!formData.street.trim()) newErrors.street = 'Vui lòng nhập địa chỉ cụ thể';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const fullAddress = `${formData.street}, ${formData.ward}, ${formData.district}, ${formData.city || ''}`;
      const submittedData = {
        ...formData,
        address: fullAddress,
        wardName: formData.ward,
      };

      // Call onSubmit and then close modal
      onSubmit(submittedData);
    }
  };

  const handleInputChange = (field: keyof UserAddress, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Personal Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={e => handleInputChange('fullName', e.target.value)}
            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-sm sm:text-base ${
              errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            placeholder="Nhập họ và tên"
          />
          {errors.fullName && (
            <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.fullName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={e => handleInputChange('phone', e.target.value)}
            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-sm sm:text-base ${
              errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            placeholder="Nhập số điện thoại"
          />
          {errors.phone && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.phone}</p>}
        </div>
      </div>

      {/* Location Info */}
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">
          Thông tin địa chỉ
        </h3>

        {/* Location Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* Province */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tỉnh/Thành phố <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedProvince}
              onChange={e => setSelectedProvince(e.target.value)}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-sm sm:text-base ${
                errors.district
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            >
              <option value="">Chọn tỉnh/thành phố</option>
              {provinces.map(province => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </select>
            {errors.district && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.district}</p>
            )}
          </div>

          {/* District */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quận/Huyện <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedDistrict}
              onChange={e => setSelectedDistrict(e.target.value)}
              disabled={!selectedProvince}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-sm sm:text-base ${
                errors.district
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <option value="">Chọn quận/huyện</option>
              {districts.map(district => (
                <option key={district.code} value={district.code}>
                  {district.name}
                </option>
              ))}
            </select>
            {errors.district && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.district}</p>
            )}
          </div>

          {/* Ward */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phường/Xã <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedWard}
              onChange={e => setSelectedWard(e.target.value)}
              disabled={!selectedDistrict}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-sm sm:text-base ${
                errors.ward ? 'border-red-500 bg-red-50' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <option value="">Chọn phường/xã</option>
              {wards.map(ward => (
                <option key={ward.code} value={ward.code}>
                  {ward.name}
                </option>
              ))}
            </select>
            {errors.ward && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.ward}</p>}
          </div>
        </div>

        {/* Shipping Fee Display */}
        {shippingFee > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-blue-800 dark:text-blue-200 font-medium text-sm sm:text-base">
                  Phí giao hàng dự kiến: {shippingFee.toLocaleString('vi-VN')}₫
                </p>
                <p className="text-blue-600 dark:text-blue-300 text-xs sm:text-sm">
                  Miễn phí giao hàng cho đơn hàng từ 500.000₫
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Street Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Địa chỉ cụ thể <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.street}
          onChange={e => handleInputChange('street', e.target.value)}
          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-sm sm:text-base ${
            errors.street ? 'border-red-500 bg-red-50' : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
          placeholder="Số nhà, tên đường..."
        />
        {errors.street && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.street}</p>}
      </div>

      {/* Label */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nhãn địa chỉ
        </label>
        <input
          type="text"
          value={formData.label || ''}
          onChange={e => handleInputChange('label', e.target.value)}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Ví dụ: Nhà, Công ty, Trường học..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg sm:rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          {loading && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          {submitText}
        </button>
      </div>
    </form>
  );
};

const MyAddresses: React.FC = () => {
  const { isMobile } = useResponsive();
  const user = useUserStore(state => state.user);
  const addresses = useUserStore(state => state.addresses);
  const setAddresses = useUserStore(state => state.setAddresses);

  // Optimize state - combine related states
  const [modals, setModals] = useState({
    showAdd: false,
    editId: null as string | null,
  });

  const [addressData, setAddressData] = useState<{
    new: UserAddress | null;
    edit: UserAddress | null;
  }>({
    new: null,
    edit: null,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Memoize conversion function
  const convertToAddressInfo = useCallback(
    (addressResponse: AddressResponse): AddressInfo => ({
      id: addressResponse.id, // Keep as string for MongoDB ObjectId
      isSelected: addressResponse.isSelected,
      label: addressResponse.label,
      address: addressResponse.address,
      wardName: addressResponse.wardName,
      phone: addressResponse.phone,
      fullName: addressResponse.fullName,
      district: addressResponse.district || '',
      ward: addressResponse.ward || '',
      street: addressResponse.street || '',
      latitude: addressResponse.latitude || 0,
      longitude: addressResponse.longitude || 0,
    }),
    []
  );

  // Optimized modal handlers
  const handleModalToggle = useCallback((type: 'add' | 'edit', value?: boolean | string) => {
    if (type === 'add') {
      setModals(prev => ({ ...prev, showAdd: value as boolean }));
      if (!value) setAddressData(prev => ({ ...prev, new: null }));
    } else {
      const editId = typeof value === 'string' ? value : null;
      setModals(prev => ({ ...prev, editId }));
      if (!editId) setAddressData(prev => ({ ...prev, edit: null }));
    }
  }, []);

  // Load addresses từ API khi component mount
  useEffect(() => {
    const loadAddresses = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError('');
        const apiAddresses = await AddressService.getUserAddresses(user.id);
        const convertedAddresses = apiAddresses.map(convertToAddressInfo);
        setAddresses(convertedAddresses);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi khi tải danh sách địa chỉ');
      } finally {
        setLoading(false);
      }
    };

    loadAddresses();
  }, [user?.id, setAddresses, convertToAddressInfo]);

  // Optimized address handlers with better error handling
  const handleAddAddress = useCallback(
    async (newAddressData: UserAddress) => {
      if (!newAddressData || !user?.id) return;

      try {
        setLoading(true);
        setError('');

        const addressResponse = await AddressService.createAddress(user.id, newAddressData);
        const newAddressInfo = convertToAddressInfo(addressResponse);

        setAddresses([
          ...addresses.map((a: AddressInfo) => ({ ...a, isSelected: false })),
          { ...newAddressInfo },
        ]);

        // Reset form data and close modal
        setAddressData(prev => ({ ...prev, new: null }));
        handleModalToggle('add', false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi khi thêm địa chỉ mới');
      } finally {
        setLoading(false);
      }
    },
    [user?.id, addresses, setAddresses, convertToAddressInfo, handleModalToggle]
  );

  // Optimized edit address handler
  const handleEditAddress = useCallback(
    async (editedAddressData: UserAddress) => {
      if (!editedAddressData || !modals.editId || !user?.id) return;

      try {
        setLoading(true);
        setError('');

        const addressResponse = await AddressService.updateAddress(
          user.id,
          modals.editId,
          editedAddressData
        );

        const updatedAddressInfo = convertToAddressInfo(addressResponse);

        setAddresses(
          addresses.map((a: AddressInfo) => (a.id === modals.editId ? updatedAddressInfo : a))
        );

        // Reset form data and close modal
        setAddressData(prev => ({ ...prev, edit: null }));
        handleModalToggle('edit', undefined);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi khi cập nhật địa chỉ');
      } finally {
        setLoading(false);
      }
    },
    [modals.editId, user?.id, addresses, setAddresses, convertToAddressInfo, handleModalToggle]
  );

  // Optimized select address handler
  const handleSelectAddress = useCallback(
    async (id: string) => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError('');

        await AddressService.setDefaultAddress(user.id, id);

        setAddresses(
          addresses.map((address: AddressInfo) => ({
            ...address,
            isSelected: address.id === id,
          }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi khi đặt địa chỉ mặc định');
      } finally {
        setLoading(false);
      }
    },
    [user?.id, addresses, setAddresses]
  );

  // Optimized delete address handler
  const handleDeleteAddress = useCallback(
    async (id: string) => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError('');

        await AddressService.deleteAddress(user.id, id);

        setAddresses(addresses.filter((address: AddressInfo) => address.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi khi xóa địa chỉ');
      } finally {
        setLoading(false);
      }
    },
    [user?.id, addresses, setAddresses]
  );

  return (
    <DashboardLayout>
      <div className={`max-w-6xl mx-auto ${isMobile ? 'p-4' : 'p-6'} space-y-6`}>
        {/* Enhanced Header */}
        <div
          className={`bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl ${isMobile ? 'p-6' : 'p-8'} text-white shadow-xl`}
        >
          <div
            className={`flex items-center ${isMobile ? 'flex-col gap-4 text-center' : 'justify-between'}`}
          >
            <div className={`flex items-center gap-4 ${isMobile ? 'flex-col text-center' : ''}`}>
              <div
                className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} bg-white/20 rounded-xl flex items-center justify-center`}
              >
                <svg
                  className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-white`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`}>
                  Địa chỉ của tôi
                </h1>
                <p className={`text-green-100 ${isMobile ? 'text-base' : 'text-lg'}`}>
                  Quản lý các địa chỉ giao hàng của bạn
                </p>
              </div>
            </div>

            {/* Add Button */}
            <button
              onClick={() => handleModalToggle('add', true)}
              disabled={loading}
              className={`${isMobile ? 'px-4 py-2 text-sm w-full' : 'px-6 py-3'} bg-white text-green-600 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${isMobile ? 'justify-center' : ''} gap-2`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Thêm địa chỉ mới
            </button>
          </div>
        </div>

        {/* Enhanced Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
              <button
                onClick={() => setError('')}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Address List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading && addresses.length === 0 ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Đang tải danh sách địa chỉ...</p>
            </div>
          ) : addresses.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Chưa có địa chỉ nào
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Thêm địa chỉ đầu tiên để thuận tiện cho việc giao hàng
              </p>
              <button
                onClick={() => handleModalToggle('add', true)}
                className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                Thêm địa chỉ ngay
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {addresses.map(address => (
                <div
                  key={address.id}
                  className={`p-6 transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                    address.isSelected
                      ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            address.isSelected
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {address.label}
                        </span>
                        {address.isSelected && (
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 text-xs rounded-full font-medium">
                            Mặc định
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {address.fullName}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          <span className="text-gray-700 dark:text-gray-300">{address.phone}</span>
                        </div>

                        <div className="flex items-start gap-2">
                          <svg
                            className="w-4 h-4 text-gray-500 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {address.address}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 ml-4">
                      {!address.isSelected && (
                        <button
                          onClick={() => handleSelectAddress(address.id)}
                          disabled={loading}
                          className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Đặt mặc định
                        </button>
                      )}

                      <button
                        onClick={() => {
                          const editAddress = addresses.find(a => a.id === address.id);
                          if (editAddress) {
                            const addressForEdit: UserAddress = {
                              fullName: editAddress.fullName,
                              phone: editAddress.phone,
                              address: editAddress.address || '',
                              label: editAddress.label || '',
                              ward: editAddress.ward || '',
                              district: editAddress.district || '',
                              wardName: editAddress.wardName || '',
                              street: editAddress.street || '',
                              latitude: editAddress.latitude || 0,
                              longitude: editAddress.longitude || 0,
                            };
                            setAddressData(prev => ({ ...prev, edit: addressForEdit }));
                            handleModalToggle('edit', address.id);
                          }
                        }}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Sửa
                      </button>

                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        disabled={loading || address.isSelected}
                        className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced Add/Edit Modals */}
        {modals.showAdd && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-2 sm:p-4 pt-2 sm:pt-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl w-full max-w-sm sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl mx-2 sm:mx-0">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-600 sticky top-0 bg-white dark:bg-gray-800 z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Thêm địa chỉ mới
                  </h2>
                  <button
                    onClick={() => handleModalToggle('add', false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <AddressFormContent
                address={addressData.new}
                onSubmit={handleAddAddress}
                onCancel={() => handleModalToggle('add', false)}
                loading={loading}
                submitText="Thêm địa chỉ"
              />
            </div>
          </div>
        )}

        {modals.editId && addressData.edit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-2 sm:p-4 pt-2 sm:pt-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl w-full max-w-sm sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl mx-2 sm:mx-0">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-600 sticky top-0 bg-white dark:bg-gray-800 z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Chỉnh sửa địa chỉ
                  </h2>
                  <button
                    onClick={() => handleModalToggle('edit', undefined)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <AddressFormContent
                address={addressData.edit}
                onSubmit={handleEditAddress}
                onCancel={() => handleModalToggle('edit', undefined)}
                loading={loading}
                submitText="Cập nhật địa chỉ"
              />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyAddresses;
