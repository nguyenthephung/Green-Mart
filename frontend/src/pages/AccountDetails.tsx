// src/pages/account-details/page.tsx
//'use client';

import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link từ react-router-dom

const AccountDetails = () => {
  const [fullName, setFullName] = useState('Alicia Virgo');
  const [mobileNumber, setMobileNumber] = useState('+44 7xxx 03 8471');
  const [emailAddress, setEmailAddress] = useState('AliciaVirgo@gmail.com');

  return (
    <div className="bg-white p-6">
      <div className="flex items-center mb-6">
        {/* Ảnh đại diện với nền xanh lá cây */}
        <div className="w-12 h-12 bg-green-500 rounded-full overflow-hidden">
          <img 
            src="" 
            alt="" 
            className="object-cover w-full h-full"
          />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 ml-4">{fullName}</h1>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1 bg-gray-50 p-6 rounded-lg">
          <ul>
            <li><Link to="/account-details" className="text-pink-500 font-semibold">Account Details</Link></li>
            <li><Link to="/my-orders" className="text-gray-700">My Orders</Link></li>
            <li><Link to="/my-cart" className="text-gray-700">My Cart</Link></li>
            <li><Link to="/my-address" className="text-gray-700">My Addresses</Link></li>
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
          <h2 className="text-xl font-semibold text-pink-500 mb-4">Account Details</h2>
          <div className="mt-6">
            <div className="flex items-center py-4 border-b">
              <div className="w-full">
                <label htmlFor="full-name" className="font-semibold text-gray-600">Full Name</label>
                <input
                  id="full-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <button className="text-pink-500 ml-4">Edit</button>
            </div>
            <div className="flex items-center py-4 border-b">
              <div className="w-full">
                <label htmlFor="mobile-number" className="font-semibold text-gray-600">Mobile Number</label>
                <input
                  id="mobile-number"
                  type="text"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <button className="text-pink-500 ml-4">Edit</button>
            </div>
            <div className="flex items-center py-4">
              <div className="w-full">
                <label htmlFor="email-address" className="font-semibold text-gray-600">Email Address</label>
                <input
                  id="email-address"
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <button className="text-pink-500 ml-4">Edit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;
