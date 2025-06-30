import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

interface Address {
  id: number;
  label: string;
  address: string;
  isSelected: boolean;
}

const MyAddresses: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([
    { id: 1, label: 'Home', address: '2972 Westheimer Rd, Santa Ana, Illinois 85448', isSelected: false },
    { id: 2, label: "My Grandparents' House", address: '2972 Westheimer Rd, Santa Ana, Illinois 85403', isSelected: false },
    { id: 3, label: 'Office', address: '2972 Westheimer Rd, Santa Ana, Illinois 85448', isSelected: false },
  ]);

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newAddress, setNewAddress] = useState<{ label: string; address: string }>({ label: '', address: '' });

  const handleAddAddress = () => {
    setAddresses([...addresses, { ...newAddress, id: addresses.length + 1, isSelected: false }]);
    setNewAddress({ label: '', address: '' });
    setShowAddModal(false);
  };

  const handleSelectAddress = (id: number) => {
    setAddresses(
      addresses.map((address) =>
        address.id === id ? { ...address, isSelected: true } : { ...address, isSelected: false }
      )
    );
  };

  const handleDeleteAddress = (id: number) => {
    setAddresses(addresses.filter((address) => address.id !== id));
  };

  return (
    <DashboardLayout>
      <div className="bg-white p-6 rounded-lg shadow-lg">
      
        <h2 className="text-xl font-semibold text-pink-500 mb-4">My Addresses</h2>
        <div className="space-y-4">
          {addresses.map((address) => (
            <div key={address.id} className="flex justify-between items-center py-4 border-b">
              <input
                type="radio"
                checked={address.isSelected}
                onChange={() => handleSelectAddress(address.id)}
                className="h-4 w-4 text-pink-500 border-gray-300 rounded-full focus:ring-2 focus:ring-pink-500"
              />
              <div className="flex-1 ml-4">
                <p className="text-lg font-semibold text-gray-900">{address.label}</p>
                <input
                  type="text"
                  value={address.address}
                  onChange={(e) =>
                    setAddresses(
                      addresses.map((a) => (a.id === address.id ? { ...a, address: e.target.value } : a))
                    )
                  }
                  className="text-gray-500 w-full border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 py-2"
                />
              </div>
              <div className="flex items-center ml-4 space-x-4">
                <button className="text-pink-500">Edit</button>
                <button onClick={() => handleDeleteAddress(address.id)} className="text-red-500">
                  Delete
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center py-4">
            <button className="text-pink-500 font-semibold" onClick={() => setShowAddModal(true)}>
              + Add New Address
            </button>
          </div>
        </div>
        {showAddModal && (
          <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Add New Address</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="label" className="block font-semibold text-gray-600">
                    Address Label
                  </label>
                  <input
                    id="label"
                    type="text"
                    value={newAddress.label}
                    onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block font-semibold text-gray-600">
                    Address
                  </label>
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
    </DashboardLayout>
  );
};

export default MyAddresses;