// src/pages/my-address/page.tsx
//'use client';

import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link từ react-router-dom

const MyAddresses = () => {
  // Danh sách các địa chỉ
  const [addresses, setAddresses] = useState([
    { id: 1, label: 'Home', address: '2972 Westheimer Rd, Santa Ana, Illinois 85448', isSelected: false },
    { id: 2, label: 'My Grandparents\' House', address: '2972 Westheimer Rd, Santa Ana, Illinois 85403', isSelected: false },
    { id: 3, label: 'Office', address: '2972 Westheimer Rd, Santa Ana, Illinois 85448', isSelected: false },
  ]);

  // Mở modal thêm địa chỉ
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: '', address: '' });

  const handleAddAddress = () => {
    setAddresses([...addresses, { ...newAddress, id: addresses.length + 1, isSelected: false }]);
    setNewAddress({ label: '', address: '' });
    setShowAddModal(false);
  };

  // Thay đổi trạng thái của ô tròn (chọn địa chỉ mặc định)
  const handleSelectAddress = (id: number) => {
    setAddresses(addresses.map(address => 
      address.id === id 
        ? { ...address, isSelected: true }  // Chọn địa chỉ này
        : { ...address, isSelected: false } // Bỏ chọn các địa chỉ khác
    ));
  };

  // Xóa địa chỉ
  const handleDeleteAddress = (id: number) => {
    setAddresses(addresses.filter(address => address.id !== id));
  };

  return (
    <div className="bg-white p-6">
      <div className="flex items-center mb-6">
        {/* Ảnh đại diện và tên người dùng */}
        <div className="w-12 h-12 bg-green-500 rounded-full overflow-hidden">
            <img
            src=""
            alt=""
            className="w-12 h-12 rounded-full object-cover mr-4"
            />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Alicia Virgo</h1>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1 bg-gray-50 p-6 rounded-lg">
          <ul>
            {/* Các liên kết điều hướng tới các trang */}
            <li><Link to="/account-details" className="text-gray-700">Account Details</Link></li>
            <li><Link to="/my-orders" className="text-gray-700">My Orders</Link></li>
            <li><Link to="/my-cart" className="text-gray-700">My Cart</Link></li>
            <li><Link to="/my-address" className="text-pink-500 font-semibold">My Addresses</Link></li>
            <li><Link to="/my-payment" className="text-gray-700">My Payments</Link></li>
            <li><Link to="/notification-settings" className="text-gray-700">Notification Settings</Link></li>
            <li><Link to="/refer-friends" className="text-gray-700">Refer Friends</Link></li>
            <li><Link to="/coupons" className="text-gray-700">Coupons</Link></li>
            <li><Link to="/my-recipes" className="text-gray-700">My Recipes</Link></li>
            <li><Link to="/account-settings" className="text-gray-700">Account Settings</Link></li>
            <li><Link to="/help-center" className="text-gray-700">Help Center</Link></li>
            <li><button className="text-gray-700 mt-4">Logout</button></li>
          </ul>
        </div>

        <div className="col-span-3 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-pink-500 mb-4">My Addresses</h2>
          <div className="space-y-4">
            {addresses.map((address) => (
              <div key={address.id} className="flex justify-between items-center py-4 border-b">
                {/* Nút chọn địa chỉ - nút tròn */}
                <input
                  type="radio"
                  checked={address.isSelected}
                  onChange={() => handleSelectAddress(address.id)}
                  className="h-4 w-4 text-pink-500 border-gray-300 rounded-full focus:ring-2 focus:ring-pink-500"
                />
                <div className="flex-1 ml-4">
                  {/* Tên địa chỉ - không thể sửa */}
                  <p className="text-lg font-semibold text-gray-900">{address.label}</p>
                  {/* Ô nhập Address (có thể sửa) */}
                  <input
                    type="text"
                    value={address.address}
                    onChange={(e) => setAddresses(addresses.map(a => 
                      a.id === address.id ? { ...a, address: e.target.value } : a))}
                    className="text-gray-500 w-full border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 py-2"
                  />
                </div>
                <div className="flex items-center ml-4 space-x-4">
                  {/* Nút Edit */}
                  <button className="text-pink-500">Edit</button>
                  {/* Nút Delete */}
                  <button
                    onClick={() => handleDeleteAddress(address.id)}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center py-4">
              <button
                className="text-pink-500 font-semibold"
                onClick={() => setShowAddModal(true)}
              >
                + Add New Address
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Thêm địa chỉ */}
      {showAddModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Add New Address</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="label" className="block font-semibold text-gray-600">Address Label</label>
                <input
                  id="label"
                  type="text"
                  value={newAddress.label}
                  onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label htmlFor="address" className="block font-semibold text-gray-600">Address</label>
                <input
                  id="address"
                  type="text"
                  value={newAddress.address}
                  onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div className="flex justify-end space-x-4 mt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 border border-gray-300 px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAddress}
                  className="text-white bg-pink-500 px-4 py-2 rounded-md"
                >
                  Add Address
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAddresses;
