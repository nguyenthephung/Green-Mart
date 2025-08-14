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
    console.error('Error updating flash sale status:', error);
  }
});

// Start the cron job
export const startFlashSaleStatusUpdater = () => {
  updateFlashSaleStatus.start();
  console.log('Flash sale status updater started');
};

// Stop the cron job
export const stopFlashSaleStatusUpdater = () => {
  updateFlashSaleStatus.stop();
  console.log('Flash sale status updater stopped');
};
