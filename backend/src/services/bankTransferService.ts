export interface BankTransferConfig {
  bankName: string;
  accountNumber: string;
  accountName: string;
  branch: string;
}

export interface BankTransferRequest {
  orderId: string;
  amount: number;
  orderInfo?: string;
}

export interface BankTransferResponse {
  orderId: string;
  amount: number;
  bankInfo: BankTransferConfig;
  transferContent: string;
  transactionId: string;
  instructions: string;
  status: 'pending';
  message: string;
}

export class BankTransferService {
  private config: BankTransferConfig;

  constructor() {
    this.config = {
      bankName: process.env.BANK_NAME || 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)',
      accountNumber: process.env.BANK_ACCOUNT_NUMBER || '12345678901',
      accountName: process.env.BANK_ACCOUNT_NAME || 'CONG TY GREENMART',
      branch: process.env.BANK_BRANCH || 'Chi nhánh Hà Nội'
    };

    console.log('=== Bank Transfer Config Loaded ===');
    console.log('Bank Name:', this.config.bankName);
    console.log('Account Number:', this.config.accountNumber);
    console.log('Account Name:', this.config.accountName);
    console.log('Branch:', this.config.branch);
  }

  async createPayment(request: BankTransferRequest): Promise<BankTransferResponse> {
    const { orderId, amount, orderInfo } = request;
    
    // Tạo nội dung chuyển khoản
    const transferContent = `GREENMART ${orderId}`;

    const response: BankTransferResponse = {
      orderId,
      amount,
      bankInfo: this.config,
      transferContent,
      transactionId: `BT_${orderId}_${Date.now()}`,
      instructions: `Vui lòng chuyển khoản ${amount.toLocaleString('vi-VN')}đ vào tài khoản trên với nội dung: ${transferContent}`,
      status: 'pending',
      message: 'Vui lòng chuyển khoản theo thông tin bên dưới và giữ lại biên lai để xác nhận.'
    };

    console.log('=== Bank Transfer Payment Created ===');
    console.log('Order ID:', orderId);
    console.log('Amount:', amount.toLocaleString('vi-VN'), 'VND');
    console.log('Transfer Content:', transferContent);
    console.log('Bank Info:', this.config);

    return response;
  }

  /**
   * Verify bank transfer (manual process)
   * This would typically be done by admin through a management interface
   */
  async verifyPayment(orderId: string, transactionId?: string): Promise<boolean> {
    // In a real application, this would check against bank statements
    // or require manual admin confirmation
    console.log(`=== Manual Bank Transfer Verification Required ===`);
    console.log(`Order ID: ${orderId}`);
    console.log(`Transaction ID: ${transactionId || 'N/A'}`);
    console.log(`Status: Pending manual verification`);
    
    return false; // Always requires manual verification
  }

  /**
   * Get bank transfer information for display
   */
  getBankInfo(): BankTransferConfig {
    return this.config;
  }
}
