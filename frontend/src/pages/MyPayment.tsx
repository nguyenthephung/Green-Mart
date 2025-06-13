// src/pages/my-payments/page.tsx
'use client';

import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link từ react-router-dom

const MyPayments = () => {
  // Danh sách các phương thức thanh toán
  const [payments, setPayments] = useState([
    { id: 1, method: 'MasterCard 6588', expiry: 'Exp 12/2024' },
    { id: 2, method: 'MasterCard 6588', expiry: 'Exp 12/2024' },
    { id: 3, method: 'Paypal', expiry: 'Exp 12/2024' },
  ]);

  // Mở modal thêm phương thức thanh toán mới
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPayment, setNewPayment] = useState({ method: '', expiry: '' });

  const handleAddPayment = () => {
    setPayments([...payments, { ...newPayment, id: payments.length + 1 }]);
    setNewPayment({ method: '', expiry: '' });
    setShowAddModal(false);
  };

  // Xóa phương thức thanh toán
  const handleDeletePayment = (id: number) => {
    setPayments(payments.filter(payment => payment.id !== id));
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
            {/* Liên kết điều hướng với Link từ react-router-dom */}
            <li><Link to="/account-details" className="text-gray-700">Account Details</Link></li>
            <li><Link to="/my-orders" className="text-gray-700">My Orders</Link></li>
            <li><Link to="/my-cart" className="text-gray-700">My Cart</Link></li>
            <li><Link to="/my-address" className="text-gray-700">My Addresses</Link></li>
            <li><Link to="/my-payment" className="text-pink-500 font-semibold">My Payments</Link></li>
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
          <h2 className="text-xl font-semibold text-pink-500 mb-4">My Payments</h2>
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="flex justify-between items-center py-4 border-b">
                {/* Hiển thị phương thức thanh toán */}
                <div className="flex-1">
                  <p className="text-lg font-semibold text-gray-900">{payment.method}</p>
                  <p className="text-gray-500">{payment.expiry}</p>
                </div>
                {/* Nút xóa (dấu X) */}
                <button
                  onClick={() => handleDeletePayment(payment.id)}
                  className="text-red-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
            {/* Nút thêm phương thức thanh toán */}
            <div className="flex justify-between items-center py-4">
              <button
                className="text-pink-500 font-semibold"
                onClick={() => setShowAddModal(true)}
              >
                + Add Payment Method
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Thêm phương thức thanh toán */}
      {showAddModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Add New Payment Method</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="method" className="block font-semibold text-gray-600">Payment Method</label>
                <input
                  id="method"
                  type="text"
                  value={newPayment.method}
                  onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label htmlFor="expiry" className="block font-semibold text-gray-600">Expiry Date</label>
                <input
                  id="expiry"
                  type="text"
                  value={newPayment.expiry}
                  onChange={(e) => setNewPayment({ ...newPayment, expiry: e.target.value })}
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
                  onClick={handleAddPayment}
                  className="text-white bg-pink-500 px-4 py-2 rounded-md"
                >
                  Add Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPayments;
