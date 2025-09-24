import React, { useState } from 'react';
import { X, User, Phone, MapPin, Mail } from 'lucide-react';
import { useGuestStore } from '../../stores/useGuestStore';
import AddressSelector from '../Guest/Account/AddressSelector';
import type { UserAddress } from '../Guest/Account/AddressSelector';
import type { GuestUser } from '../../types/GuestOrder';

interface GuestInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (guestInfo: GuestUser) => void;
}

const GuestInfoModal: React.FC<GuestInfoModalProps> = ({ isOpen, onClose, onSave }) => {
  const { guestInfo, setGuestInfo } = useGuestStore();

  const [formData, setFormData] = useState<GuestUser>({
    name: guestInfo?.name || '',
    phone: guestInfo?.phone || '',
    address: guestInfo?.address || '',
    email: guestInfo?.email || '',
  });

  const [addressData, setAddressData] = useState<UserAddress>({
    phone: guestInfo?.phone || '',
    fullName: guestInfo?.name || '',
    district: '',
    ward: '',
    street: '',
    latitude: 0,
    longitude: 0,
  });

  const [errors, setErrors] = useState<Partial<GuestUser>>({});

  const calculateShippingFee = (address: UserAddress): number => {
    // Simple shipping fee calculation based on district
    // This should match the logic in your checkout system
    const centralDistricts = ['Quận 1', 'Quận 3', 'Quận 5', 'Quận 10'];
    const nearDistricts = ['Quận 2', 'Quận 4', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 11', 'Quận 12'];

    if (centralDistricts.includes(address.district)) {
      return 15000; // Central districts - cheaper shipping
    } else if (nearDistricts.includes(address.district)) {
      return 25000; // Near districts - medium shipping
    } else {
      return 35000; // Far districts - higher shipping
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<GuestUser> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ tên';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!addressData.district || !addressData.ward || !addressData.street) {
      newErrors.address = 'Vui lòng chọn địa chỉ đầy đủ';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const fullAddress = `${addressData.street}, ${addressData.ward}, ${addressData.district}`;
      const cleanedData = {
        ...formData,
        phone: formData.phone.replace(/\s/g, ''),
        address: fullAddress,
        latitude: addressData.latitude,
        longitude: addressData.longitude,
        shippingFee: shippingFee,
      };
      setGuestInfo(cleanedData);
      onSave(cleanedData);
      onClose();
    }
  };

  const handleInputChange = (field: keyof GuestUser, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAddressChange = (address: UserAddress) => {
    setAddressData(address);

    // Only update name and phone if they are empty, preserve user input
    setFormData(prev => ({
      ...prev,
      name: prev.name.trim() || address.fullName, // Keep existing name if user typed something
      phone: prev.phone.trim() || address.phone, // Keep existing phone if user typed something
    }));

    // Clear address error when address is selected
    if (errors.address) {
      setErrors(prev => ({ ...prev, address: undefined }));
    }
  };

  if (!isOpen) return null;

  const shippingFee = addressData.district ? calculateShippingFee(addressData) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-20">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[calc(90vh-5rem)] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Thông Tin Khách Hàng
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="inline w-4 h-4 mr-2" />
              Họ và tên *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                errors.name
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Nhập họ và tên của bạn"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Phone className="inline w-4 h-4 mr-2" />
              Số điện thoại *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => handleInputChange('phone', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                errors.phone
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Nhập số điện thoại"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          {/* Address Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="inline w-4 h-4 mr-2" />
              Địa chỉ nhận hàng *
            </label>
            <AddressSelector value={addressData} onChange={handleAddressChange} />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}

            {/* Shipping Fee Display */}
            {shippingFee > 0 && (
              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  💰 Phí vận chuyển: {shippingFee.toLocaleString()}đ
                </p>
              </div>
            )}
          </div>

          {/* Email (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="inline w-4 h-4 mr-2" />
              Email (tùy chọn)
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={e => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                errors.email
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Nhập email để nhận thông báo"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Lưu Thông Tin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GuestInfoModal;
