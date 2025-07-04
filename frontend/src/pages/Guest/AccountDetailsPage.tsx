import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';

const AccountDetails: React.FC = () => {
  const [fullName, setFullName] = useState<string>('Alicia Virgo');
  const [mobileNumber, setMobileNumber] = useState<string>('+44 7xxx 03 8471');
  const [emailAddress, setEmailAddress] = useState<string>('AliciaVirgo@gmail.com');

  return (
    <DashboardLayout>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        
        <h2 className="text-xl font-semibold text-pink-500 mb-4">Account Details</h2>
        <div className="mt-6">
          <div className="flex items-center py-4 border-b">
            <div className="w-full">
              <label htmlFor="full-name" className="font-semibold text-gray-600">
                Full Name
              </label>
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
              <label htmlFor="mobile-number" className="font-semibold text-gray-600">
                Mobile Number
              </label>
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
              <label htmlFor="email-address" className="font-semibold text-gray-600">
                Email Address
              </label>
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
    </DashboardLayout>
  );
};

export default AccountDetails;