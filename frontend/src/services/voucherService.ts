import { apiClient } from './api';

export const voucherService = {
  getAllByUser: async (userId: string | number) => {
    const res = await apiClient(`/users/${userId}/vouchers`);
    console.log('API /users/:userId/vouchers response:', res);
    return (res.data as { vouchers: any }).vouchers;
  },
  getAll: async () => {
    return await apiClient('/vouchers');
  },
  create: async (data: any) => {
    const res = await apiClient('/vouchers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await apiClient(`/vouchers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient(`/vouchers/${id}`, {
      method: 'DELETE',
    });
    return res.data;
  },
};
