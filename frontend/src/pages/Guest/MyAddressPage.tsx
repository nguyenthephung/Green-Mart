import React, { useState } from 'react';
import { useUser } from '../../reduxSlice/UserContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import AddressSelector, { type UserAddress } from '../../components/Guest/Account/AddressSelector';

const MyAddresses: React.FC = () => {
  const { addresses, setAddresses } = useUser();
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<number | null>(null); // id của address đang sửa
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
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Địa chỉ của tôi</h2>
        <div className="space-y-4">
          {addresses.map((address) => (
            <div key={address.id} className={`flex justify-between items-center py-4 border-b ${address.isSelected ? 'bg-green-50' : ''}`}>
              <input
                type="radio"
                checked={address.isSelected}
                onChange={() => handleSelectAddress(address.id)}
                className="h-4 w-4 text-green-600 border-gray-300 rounded-full focus:ring-2 focus:ring-green-600"
              />
              <div className="flex-1 ml-4">
                <p className="text-lg font-semibold text-gray-900">{address.label}</p>
                <div className="text-gray-500 w-full border-b border-gray-300 py-2">
                  {address.address}
                </div>
              </div>
              <div className="flex items-center ml-4 space-x-4">
                <button
                  className="text-green-700 hover:underline"
                  onClick={() => {
                    setShowEditModal(address.id);
                    setEditAddress(address as UserAddress);
                  }}
                >
                  Chỉnh sửa
                </button>
                <button onClick={() => handleDeleteAddress(address.id)} className="text-red-500 hover:underline">
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
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Thêm địa chỉ mới</h3>
              <AddressSelector value={undefined} onChange={setNewAddress as any} />
              <div className="flex justify-end space-x-2 mt-4">
                <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setShowAddModal(false)}>
                  Hủy
                </button>
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                  onClick={handleAddAddress}
                  disabled={!newAddress}
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Modal chỉnh sửa địa chỉ */}
        {showEditModal !== null && editAddress && (
          <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Chỉnh sửa địa chỉ</h3>
              <AddressSelector value={editAddress} onChange={setEditAddress as any} />
              <div className="flex justify-end space-x-2 mt-4">
                <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setShowEditModal(null)}>
                  Hủy
                </button>
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                  onClick={handleEditAddress}
                  disabled={!editAddress}
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyAddresses;