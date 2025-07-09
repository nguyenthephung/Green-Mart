import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Voucher } from '../types/Voucher';

export interface UserInfo {
  fullName: string;
  email: string;
  phone: string;
}

export interface AddressInfo {
  wardName: string;
  id: number;
  label: string;
  address: string;
  district: string;
  ward: string;
  street: string;
  latitude: number;
  longitude: number;
  isSelected: boolean;
}

export interface PaymentInfo {
  id: number;
  method: string;
  expiry: string;
  isSelected: boolean;
}

interface UserContextType {
  userInfo: UserInfo;
  setUserInfo: (info: UserInfo) => void;
  addresses: AddressInfo[];
  setAddresses: (addresses: AddressInfo[]) => void;
  payments: PaymentInfo[];
  setPayments: (payments: PaymentInfo[]) => void;
  voucher: Voucher | null;
  setVoucher: (voucher: Voucher | null) => void;
}

const defaultUserInfo: UserInfo = {
  fullName: '',
  email: '',
  phone: '',
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userInfo, setUserInfo] = useState<UserInfo>(() => {
    const stored = localStorage.getItem('userInfo');
    return stored ? JSON.parse(stored) : defaultUserInfo;
  });
  const [addresses, setAddresses] = useState<AddressInfo[]>(() => {
    const stored = localStorage.getItem('addresses');
    return stored ? JSON.parse(stored) : [];
  });
  const [payments, setPayments] = useState<PaymentInfo[]>(() => {
    const stored = localStorage.getItem('payments');
    return stored ? JSON.parse(stored) : [];
  });
  const [voucher, setVoucher] = useState<Voucher | null>(() => {
    const stored = localStorage.getItem('voucher');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
  }, [userInfo]);
  useEffect(() => {
    localStorage.setItem('addresses', JSON.stringify(addresses));
  }, [addresses]);
  useEffect(() => {
    localStorage.setItem('payments', JSON.stringify(payments));
  }, [payments]);
  useEffect(() => {
    localStorage.setItem('voucher', JSON.stringify(voucher));
  }, [voucher]);

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo, addresses, setAddresses, payments, setPayments, voucher, setVoucher }}>
      {children}
    </UserContext.Provider>
  );
};
