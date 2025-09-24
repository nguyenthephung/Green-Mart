import { apiClient } from './api';

// Cập nhật voucher cho user (thêm voucherId vào user.vouchers)
export async function updateUserVouchers(userId: string | number, voucherId: string | number) {
  return apiClient(`/users/${userId}/vouchers`, {
    method: 'PATCH',
    body: JSON.stringify({ voucherId }),
  });
}
