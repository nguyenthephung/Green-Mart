import cron from 'node-cron';
import FlashSale from '../models/FlashSale';

// Chạy mỗi phút để kiểm tra và cập nhật status
export const updateFlashSaleStatus = cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();

    // Cập nhật các flash sale đã hết hạn
    await FlashSale.updateMany(
      {
        endTime: { $lt: now },
        status: { $ne: 'ended' }
      },
      {
        status: 'ended'
      }
    );

    // Cập nhật các flash sale đang hoạt động
    await FlashSale.updateMany(
      {
        startTime: { $lte: now },
        endTime: { $gt: now },
        isActive: true,
        status: { $ne: 'active' }
      },
      {
        status: 'active'
      }
    );

  } catch (error) {
    // ...existing code (đã xóa log)...
  }
});

// Start the cron job
export const startFlashSaleStatusUpdater = () => {
  updateFlashSaleStatus.start();
  // ...existing code (đã xóa log)...
};

// Stop the cron job
export const stopFlashSaleStatusUpdater = () => {
  updateFlashSaleStatus.stop();
  // ...existing code (đã xóa log)...
};
