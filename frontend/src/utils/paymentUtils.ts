export const getPaymentMethodLabel = (method: string): string => {
  switch (method?.toLowerCase()) {
    case 'cod':
      return 'Thanh toán khi nhận hàng';
    case 'cash':
      return 'Thanh toán khi nhận hàng'; // Legacy support  
    case 'momo':
      return 'Ví MoMo';
    case 'bank_transfer':
      return 'Chuyển khoản ngân hàng';
    case 'credit_card':
      return 'Thẻ tín dụng';
    case 'zalopay':
      return 'ZaloPay';
    case 'vnpay':
      return 'VNPay';
    case 'shopeepay':
      return 'ShopeePay';
    default:
      return method || 'Không xác định';
  }
};

export const getPaymentMethodColor = (method: string): string => {
  switch (method?.toLowerCase()) {
    case 'cod':
    case 'cash':
      return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
    case 'momo':
      return 'text-pink-600 bg-pink-100 dark:text-pink-400 dark:bg-pink-900/20';
    case 'bank_transfer':
      return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
    case 'credit_card':
      return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20';
    default:
      return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
  }
};
