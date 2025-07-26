import React, { useState, useEffect, useCallback } from 'react';
import { useUserStore } from '../../stores/useUserStore';
import DashboardLayout from '../../layouts/DashboardLayout';
import AddressSelector, { type UserAddress } from '../../components/Guest/Account/AddressSelector';
import { AddressService, type AddressResponse } from '../../services/addressService';
import type { AddressInfo } from '../../reduxSlice/UserContext';

const MyAddresses: React.FC = () => {
  const user = useUserStore(state => state.user);
  const addresses = useUserStore(state => state.addresses);
  const setAddresses = useUserStore(state => state.setAddresses);
  
  // Optimize state - combine related states
  const [modals, setModals] = useState({
    showAdd: false,
    editId: null as number | null
  });
  
  const [addressData, setAddressData] = useState<{
    new: UserAddress | null;
    edit: UserAddress | null;
  }>({
    new: null,
    edit: null
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Memoize conversion function
  const convertToAddressInfo = useCallback((addressResponse: AddressResponse): AddressInfo => ({
    id: parseInt(addressResponse.id),
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
  }), []);

  // Optimized modal handlers
  const handleModalToggle = useCallback((type: 'add' | 'edit', value?: boolean | number) => {
    if (type === 'add') {
      setModals(prev => ({ ...prev, showAdd: value as boolean }));
      if (!value) setAddressData(prev => ({ ...prev, new: null }));
    } else {
      const editId = typeof value === 'number' ? value : null;
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
        console.error('Error loading addresses:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAddresses();
  }, [user?.id, setAddresses, convertToAddressInfo]);

  // Optimized address handlers with better error handling
  const handleAddAddress = useCallback(async () => {
    if (!addressData.new || !user?.id) return;
    
    try {
      setLoading(true);
      setError('');
      
      const addressResponse = await AddressService.createAddress(user.id, addressData.new);
      const newAddressInfo = convertToAddressInfo(addressResponse);
      
      setAddresses([
        ...addresses.map((a: AddressInfo) => ({ ...a, isSelected: false, userId: user.id })),
        { ...newAddressInfo, userId: user.id },
      ]);
      
      handleModalToggle('add', false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi thêm địa chỉ mới');
      console.error('Error adding address:', err);
    } finally {
      setLoading(false);
    }
  }, [addressData.new, user?.id, addresses, setAddresses, convertToAddressInfo, handleModalToggle]);

  // Optimized edit address handler
  const handleEditAddress = useCallback(async () => {
    if (!addressData.edit || !modals.editId || !user?.id) return;
    
    try {
      setLoading(true);
      setError('');
      
      const addressResponse = await AddressService.updateAddress(
        user.id,
        modals.editId.toString(),
        addressData.edit
      );
      
      const updatedAddressInfo = convertToAddressInfo(addressResponse);
      
      setAddresses(
        addresses.map((a: AddressInfo) =>
          a.id === modals.editId ? updatedAddressInfo : a
        )
      );
      
      handleModalToggle('edit', undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi cập nhật địa chỉ');
      console.error('Error updating address:', err);
    } finally {
      setLoading(false);
    }
  }, [addressData.edit, modals.editId, user?.id, addresses, setAddresses, convertToAddressInfo, handleModalToggle]);

  // Optimized select address handler
  const handleSelectAddress = useCallback(async (id: number) => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError('');
      
      await AddressService.setDefaultAddress(user.id, id.toString());
      
      setAddresses(
        addresses.map((address: AddressInfo) => ({
          ...address,
          isSelected: address.id === id
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi đặt địa chỉ mặc định');
      console.error('Error setting default address:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, addresses, setAddresses]);

  // Optimized delete address handler
  const handleDeleteAddress = useCallback(async (id: number) => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError('');
      
      await AddressService.deleteAddress(user.id, id.toString());
      
      setAddresses(addresses.filter((address: AddressInfo) => address.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi xóa địa chỉ');
      console.error('Error deleting address:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, addresses, setAddresses]);

  return (
    <DashboardLayout>
      <div className="bg-app-secondary p-8 rounded-3xl shadow-xl max-w-4xl mx-auto mt-6 border-app-default">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-app-primary mb-2 flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            Địa chỉ của tôi
          </h2>
          <p className="text-app-secondary">Quản lý các địa chỉ giao hàng của bạn</p>
        </div>

        <div className="bg-app-card rounded-2xl p-6 shadow-lg border-app-default">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50/50 border border-red-200/50 rounded-xl">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-red-700 font-medium">{error}</span>
                <button 
                  onClick={() => setError('')}
                  className="ml-auto text-red-400 hover:text-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green"></div>
              <p className="mt-2 text-app-secondary">Đang xử lý...</p>
            </div>
          )}

          <div className="space-y-4">
            {addresses.map((address: AddressInfo) => (
              <div 
                key={address.id} 
                className={`relative p-6 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg ${
                  address.isSelected 
                    ? 'bg-brand-green/5 border-brand-green shadow-md' 
                    : 'bg-app-card border-app-border hover:border-brand-green/50'
                }`}
              > 
                <div className="flex items-start gap-4">
                  <div className="pt-1">
                    <input
                      type="radio"
                      checked={address.isSelected}
                      onChange={() => handleSelectAddress(address.id)}
                      className="h-5 w-5 text-brand-green border-2 border-app-border focus:ring-2 focus:ring-brand-green focus:ring-offset-2"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-app-primary text-lg">{address.fullName || 'Người nhận'}</span>
                      <span className="text-app-secondary text-sm bg-app-secondary/30 px-3 py-1 rounded-full">{address.phone}</span>
                      {address.isSelected && (
                        <span className="px-3 py-1 bg-brand-green text-white text-xs rounded-full font-medium">
                          Địa chỉ mặc định
                        </span>
                      )}
                    </div>
                    <div className="text-app-primary mb-2 flex items-start gap-2">
                      <svg className="w-5 h-5 text-brand-green mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="leading-relaxed">{address.address}</span>
                    </div>
                    <div className="text-app-muted text-sm">{address.wardName} • {address.district}</div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button
                      className="flex items-center gap-2 text-brand-green hover:bg-brand-green/10 px-4 py-2 rounded-xl transition-all duration-200 font-medium"
                      onClick={() => {
                        handleModalToggle('edit', address.id);
                        setAddressData(prev => ({ ...prev, edit: address as UserAddress }));
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="flex items-center gap-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 px-4 py-2 rounded-xl transition-all duration-200 font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {addresses.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-app-primary mb-2">Chưa có địa chỉ nào</h3>
                <p className="text-app-secondary mb-6">Thêm địa chỉ đầu tiên để bắt đầu mua sắm</p>
              </div>
            )}
            
            <div className="flex justify-center py-6">
              <button 
                className="btn-secondary flex items-center gap-3" 
                onClick={() => handleModalToggle('add', true)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Thêm địa chỉ mới
              </button>
            </div>
          </div>
        </div>
        {/* Modal thêm địa chỉ */}
        {modals.showAdd && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-60 z-50 p-4 overflow-y-auto">
            <div className="bg-app-card rounded-2xl shadow-2xl w-full max-w-sm relative transform transition-all duration-300 scale-100 my-4">
              {/* Header với gradient - compact */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-2xl p-3 text-white relative overflow-hidden">
                <button
                  className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-white hover:bg-opacity-20 text-white hover:text-white transition-all duration-200 z-20"
                  onClick={() => handleModalToggle('add', false)}
                  aria-label="Đóng"
                  type="button"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="relative z-10 pr-6">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-bold">Thêm địa chỉ mới</h3>
                      <p className="text-green-100 text-xs">Điền thông tin địa chỉ giao hàng</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form content - compact */}
              <div className="p-3">
                <form className="space-y-3" onSubmit={e => { e.preventDefault(); handleAddAddress(); }}>
                  {/* Thông tin người nhận - compact */}
                  <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                    <h4 className="text-xs font-semibold text-gray-800 mb-2 flex items-center gap-1">
                      <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Thông tin người nhận
                    </h4>
                    
                    <div className="space-y-2">
                      <div>
                        <label className="block text-gray-700 font-medium mb-1 text-xs">
                          Họ và tên <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent transition-all duration-200 pl-7 text-xs"
                            placeholder="Nhập họ và tên người nhận"
                            value={addressData.new?.fullName || ''}
                            onChange={e => {
                              setAddressData(prev => ({
                                ...prev,
                                new: {
                                  ...prev.new,
                                  fullName: e.target.value,
                                  phone: prev.new?.phone ?? '',
                                  street: prev.new?.street ?? '',
                                  ward: prev.new?.ward ?? '',
                                  district: prev.new?.district ?? '',
                                  latitude: prev.new?.latitude ?? 0,
                                  longitude: prev.new?.longitude ?? 0,
                                } as UserAddress
                              }));
                            }}
                            disabled={loading}
                          />
                          <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 font-medium mb-1 text-xs">
                          Số điện thoại <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent transition-all duration-200 pl-7 text-xs"
                            placeholder="Nhập số điện thoại"
                            value={addressData.new?.phone || ''}
                            onChange={e => {
                              setAddressData(prev => ({
                                ...prev,
                                new: {
                                  ...prev.new,
                                  fullName: prev.new?.fullName ?? '',
                                  phone: e.target.value,
                                  street: prev.new?.street ?? '',
                                  ward: prev.new?.ward ?? '',
                                  district: prev.new?.district ?? '',
                                  latitude: prev.new?.latitude ?? 0,
                                  longitude: prev.new?.longitude ?? 0,
                                } as UserAddress
                              }));
                            }}
                            disabled={loading}
                            required
                          />
                          <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Địa chỉ chi tiết - compact */}
                  <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
                    <h4 className="text-xs font-semibold text-gray-800 mb-2 flex items-center gap-1">
                      <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Địa chỉ giao hàng
                    </h4>
                    
                    <AddressSelector 
                      value={undefined} 
                      onChange={addr => {
                        setAddressData(prev => ({
                          ...prev,
                          new: { 
                            ...(prev.new || {}), 
                            ...addr,
                            fullName: prev.new?.fullName || '',
                            phone: prev.new?.phone || ''
                          } as UserAddress
                        }));
                      }} 
                    />
                  </div>

                  {/* Action buttons - compact */}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleModalToggle('add', false)}
                      className="flex-1 py-1.5 px-3 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-all duration-200 text-xs"
                      disabled={loading}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-1.5 px-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-md font-medium hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-1 text-xs"
                      disabled={!(addressData.new && addressData.new.fullName && addressData.new.phone && addressData.new.street && addressData.new.ward && addressData.new.district) || loading}
                    >
                      {loading && <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>}
                      {loading ? 'Đang lưu...' : 'Lưu địa chỉ'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        {/* Modal chỉnh sửa địa chỉ */}
        {modals.editId !== null && addressData.edit && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-60 z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative transform transition-all duration-300 scale-100 my-4">
              {/* Header với gradient - compact */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-2xl p-3 text-white relative overflow-hidden">
                <button
                  className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-white hover:bg-opacity-20 text-white hover:text-white transition-all duration-200 z-20"
                  onClick={() => handleModalToggle('edit', undefined)}
                  aria-label="Đóng"
                  type="button"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="relative z-10 pr-6">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-bold">Chỉnh sửa địa chỉ</h3>
                      <p className="text-blue-100 text-xs">Cập nhật thông tin địa chỉ giao hàng</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form content - compact */}
              <div className="p-3">
                <form className="space-y-3" onSubmit={e => { e.preventDefault(); handleEditAddress(); }}>
                  {/* Thông tin người nhận - compact */}
                  <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                    <h4 className="text-xs font-semibold text-gray-800 mb-2 flex items-center gap-1">
                      <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Thông tin người nhận
                    </h4>
                    
                    <div className="space-y-2">
                      <div>
                        <label className="block text-gray-700 font-medium mb-1 text-xs">
                          Họ và tên <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pl-7 text-xs"
                            placeholder="Nhập họ và tên người nhận"
                            value={addressData.edit?.fullName || ''}
                            onChange={e => setAddressData(prev => ({
                              ...prev,
                              edit: { ...(prev.edit || {}), fullName: e.target.value } as UserAddress
                            }))}
                            disabled={loading}
                            required
                          />
                          <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 font-medium mb-1 text-xs">
                          Số điện thoại <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pl-7 text-xs"
                            placeholder="Nhập số điện thoại"
                            value={addressData.edit?.phone || ''}
                            onChange={e => setAddressData(prev => ({
                              ...prev,
                              edit: { ...(prev.edit || {}), phone: e.target.value } as UserAddress
                            }))}
                            disabled={loading}
                            required
                          />
                          <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Địa chỉ chi tiết - compact */}
                  <div className="bg-orange-50 rounded-lg p-2 border border-orange-100">
                    <h4 className="text-xs font-semibold text-gray-800 mb-2 flex items-center gap-1">
                      <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Địa chỉ giao hàng
                    </h4>
                    
                    <AddressSelector 
                      value={addressData.edit} 
                      onChange={addr => setAddressData(prev => ({
                        ...prev,
                        edit: { ...(prev.edit || {}), ...addr } as UserAddress
                      }))} 
                    />
                  </div>

                  {/* Action buttons - compact */}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleModalToggle('edit', undefined)}
                      className="flex-1 py-1.5 px-3 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-all duration-200 text-xs"
                      disabled={loading}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-1.5 px-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md font-medium hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-1 text-xs"
                      disabled={!(addressData.edit && addressData.edit.fullName && addressData.edit.phone && addressData.edit.street && addressData.edit.ward && addressData.edit.district) || loading}
                    >
                      {loading && <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>}
                      {loading ? 'Đang cập nhật...' : 'Cập nhật địa chỉ'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default React.memo(MyAddresses);