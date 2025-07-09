import React, { useState } from 'react';
import { useUser } from '../../reduxSlice/UserContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import AddressSelector, { type UserAddress } from '../../components/Guest/Account/AddressSelector';

const MyAddresses: React.FC = () => {
  const { addresses, setAddresses } = useUser();
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<number | null>(null);
  const [newAddress, setNewAddress] = useState<UserAddress | null>(null);
  const [editAddress, setEditAddress] = useState<UserAddress | null>(null);

  // Thêm địa chỉ mới
  const handleAddAddress = () => {
    if (newAddress) {
      setAddresses([
        ...addresses.map((a) => ({ ...a, isSelected: false })),
        {
          ...newAddress,
          id: addresses.length > 0 ? Math.max(...addresses.map(a => a.id)) + 1 : 1,
          isSelected: true,
          label: `${newAddress.street}, ${newAddress.ward}, ${newAddress.district}`,
          address: `${newAddress.street}, ${newAddress.ward}, ${newAddress.district}`,
          wardName: newAddress.ward || '',
          phone: newAddress.phone || '',
          fullName: newAddress.fullName || '',
        },
      ]);
      setNewAddress(null);
      setShowAddModal(false);
    }
  };

  // Sửa địa chỉ
  const handleEditAddress = () => {
    if (editAddress && showEditModal !== null) {
      setAddresses(
        addresses.map((a) =>
          a.id === showEditModal
            ? {
                ...a,
                ...editAddress,
                label: `${editAddress.street}, ${editAddress.ward}, ${editAddress.district}`,
                address: `${editAddress.street}, ${editAddress.ward}, ${editAddress.district}`,
                wardName: editAddress.ward || '',
                districtName: editAddress.district || '',
              }
            : a
        )
      );
      setEditAddress(null);
      setShowEditModal(null);
    }
  };

  // Chọn địa chỉ giao hàng
  const handleSelectAddress = (id: number) => {
    setAddresses(
      addresses.map((address) =>
        address.id === id ? { ...address, isSelected: true } : { ...address, isSelected: false }
      )
    );
  };

  // Xóa địa chỉ
  const handleDeleteAddress = (id: number) => {
    let newAddresses = addresses.filter((address) => address.id !== id);
    // Nếu xóa địa chỉ đang chọn thì chọn lại địa chỉ đầu tiên nếu còn
    if (!newAddresses.some(a => a.isSelected) && newAddresses.length > 0) {
      newAddresses[0].isSelected = true;
    }
    setAddresses(newAddresses);
  };

  return (
    <DashboardLayout>
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-2xl mx-auto mt-6">
        <h2 className="text-2xl font-bold text-green-700 mb-8 flex items-center gap-2">
          <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          Địa chỉ của tôi
        </h2>
        <div className="space-y-5">
          {addresses.map((address) => (
            <div key={address.id} className={`flex items-start gap-4 p-5 rounded-xl border shadow-sm transition ${address.isSelected ? 'bg-green-50 border-green-400' : 'bg-white border-gray-200'}`}> 
              <div className="pt-1">
                <input
                  type="radio"
                  checked={address.isSelected}
                  onChange={() => handleSelectAddress(address.id)}
                  className="h-5 w-5 text-green-600 border-gray-300 focus:ring-2 focus:ring-green-600"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 text-lg">{address.fullName || 'Người nhận'}</span>
                  <span className="text-gray-500 text-sm">{address.phone}</span>
                  {address.isSelected && <span className="ml-2 px-2 py-0.5 bg-green-600 text-white text-xs rounded">Mặc định</span>}
                </div>
                <div className="text-gray-700 mb-1 flex items-center gap-1">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span>{address.address}</span>
                </div>
                <div className="text-gray-400 text-xs">{address.wardName} {address.district}</div>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <button
                  className="flex items-center gap-1 text-green-700 hover:bg-green-50 px-3 py-1 rounded transition"
                  onClick={() => {
                    setShowEditModal(address.id);
                    setEditAddress(address as UserAddress);
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2H7v-2a2 2 0 012-2h2v2a2 2 0 01-2 2z" /></svg>
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => handleDeleteAddress(address.id)}
                  className="flex items-center gap-1 text-red-500 hover:bg-red-50 px-3 py-1 rounded transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  Xóa
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center py-4">
            <button className="text-green-700 font-semibold hover:underline" onClick={() => setShowAddModal(true)}>
              + Thêm địa chỉ mới
            </button>
          </div>
        </div>
        {/* Modal thêm địa chỉ */}
        {showAddModal && (
          <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative">
              <button
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition"
                onClick={() => setShowAddModal(false)}
                aria-label="Đóng"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Thêm địa chỉ mới</h3>
              <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleAddAddress(); }}>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Họ và tên người nhận</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="Nhập họ và tên"
                    value={newAddress?.fullName || ''}
                    onChange={e =>
                      setNewAddress({
                        fullName: e.target.value,
                        phone: newAddress?.phone ?? '',
                        street: newAddress?.street ?? '',
                        ward: newAddress?.ward ?? '',
                        district: newAddress?.district ?? '',
                        latitude: newAddress?.latitude ?? 0,
                        longitude: newAddress?.longitude ?? 0,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="Nhập số điện thoại"
                    value={newAddress?.phone || ''}
                    onChange={e =>
                      setNewAddress({
                        fullName: newAddress?.fullName ?? '',
                        phone: e.target.value,
                        street: newAddress?.street ?? '',
                        ward: newAddress?.ward ?? '',
                        district: newAddress?.district ?? '',
                        latitude: newAddress?.latitude ?? 0,
                        longitude: newAddress?.longitude ?? 0,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Địa chỉ chi tiết</label>
                  <AddressSelector value={undefined} onChange={addr => setNewAddress({ ...(newAddress || {}), ...addr })} />
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                    disabled={!(newAddress && newAddress.fullName && newAddress.phone && newAddress.street && newAddress.ward && newAddress.district)}
                  >
                    Lưu
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Modal chỉnh sửa địa chỉ */}
        {showEditModal !== null && editAddress && (
          <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative">
              <button
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition"
                onClick={() => setShowEditModal(null)}
                aria-label="Đóng"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Chỉnh sửa địa chỉ</h3>
              <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleEditAddress(); }}>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Họ và tên người nhận</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="Nhập họ và tên"
                    value={editAddress?.fullName || ''}
                    onChange={e => setEditAddress({ ...(editAddress || {}), fullName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="Nhập số điện thoại"
                    value={editAddress?.phone || ''}
                    onChange={e => setEditAddress({ ...(editAddress || {}), phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Địa chỉ chi tiết</label>
                  <AddressSelector value={editAddress} onChange={addr => setEditAddress({ ...(editAddress || {}), ...addr })} />
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                    disabled={!(editAddress && editAddress.fullName && editAddress.phone && editAddress.street && editAddress.ward && editAddress.district)}
                  >
                    Lưu
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyAddresses;