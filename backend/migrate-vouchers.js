const mongoose = require('mongoose');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/greenmart'); // Update with your database URL
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Migration function
const migrateVouchers = async () => {
  try {
    console.log('Starting voucher migration...');

    // Get the User collection directly
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Find all users who have vouchers in the old format
    const usersWithOldVouchers = await usersCollection.find({
      vouchers: { 
        $exists: true, 
        $not: { $size: 0 },
        $elemMatch: { $type: "objectId" } // Old format: vouchers are ObjectIds
      }
    }).toArray();

    console.log(`Found ${usersWithOldVouchers.length} users with old voucher format`);

    if (usersWithOldVouchers.length === 0) {
      console.log('No users found with old voucher format');
      return;
    }

    // Process each user
    for (const user of usersWithOldVouchers) {
      const oldVouchers = user.vouchers || [];
      const newVouchers = [];

      // Count occurrences of each voucher ID
      const voucherCounts = {};
      for (const voucherId of oldVouchers) {
        if (mongoose.Types.ObjectId.isValid(voucherId)) {
          const voucherIdStr = voucherId.toString();
          voucherCounts[voucherIdStr] = (voucherCounts[voucherIdStr] || 0) + 1;
        }
      }

      // Convert to new format
      for (const [voucherIdStr, quantity] of Object.entries(voucherCounts)) {
        newVouchers.push({
          voucherId: new mongoose.Types.ObjectId(voucherIdStr),
          quantity: quantity
        });
      }

      // Update the user
      const result = await usersCollection.updateOne(
        { _id: user._id },
        { $set: { vouchers: newVouchers } }
      );

      console.log(`Updated user ${user.email || user._id}: ${oldVouchers.length} old vouchers -> ${newVouchers.length} new vouchers`);
    }

    console.log('Voucher migration completed successfully!');

  } catch (error) {
    console.error('Migration error:', error);
  }
};

// Also handle users who have empty voucher arrays with invalid structure
const cleanupInvalidVouchers = async () => {
  try {
    console.log('Cleaning up invalid vouchers...');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Find users with vouchers that have null/undefined voucherId
    const result = await usersCollection.updateMany(
      {
        vouchers: {
          $elemMatch: {
            $or: [
              { voucherId: { $exists: false } },
              { voucherId: null },
              { voucherId: undefined }
            ]
          }
        }
      },
      {
        $set: { vouchers: [] }
      }
    );

    console.log(`Cleaned up ${result.modifiedCount} users with invalid vouchers`);

  } catch (error) {
    console.error('Cleanup error:', error);
  }
};

// Run migration
const runMigration = async () => {
  await connectDB();
  await migrateVouchers();
  await cleanupInvalidVouchers();
  await mongoose.connection.close();
  console.log('Migration completed and database connection closed');
  process.exit(0);
};

runMigration();
