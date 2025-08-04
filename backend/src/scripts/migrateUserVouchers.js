const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/greenmart');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Migration script
const migrateUserVouchers = async () => {
  try {
    await connectDB();
    
    // Get all users
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log(`Found ${users.length} users to migrate`);
    
    for (const user of users) {
      console.log(`\nMigrating user: ${user.name} (${user._id})`);
      console.log('Current vouchers:', user.vouchers);
      
      let newVouchers = {};
      
      if (user.vouchers) {
        if (Array.isArray(user.vouchers)) {
          // Convert from old array format to new object format
          for (const voucher of user.vouchers) {
            if (typeof voucher === 'string') {
              // Old format: vouchers = ['voucherId1', 'voucherId2', ...]
              newVouchers[voucher] = (newVouchers[voucher] || 0) + 1;
            } else if (voucher.voucherId) {
              // Current format: vouchers = [{voucherId: ObjectId, quantity: number}, ...]
              const voucherId = voucher.voucherId.toString();
              newVouchers[voucherId] = voucher.quantity || 1;
            }
          }
        } else if (typeof user.vouchers === 'object') {
          // Already in new format, just ensure it's clean
          newVouchers = user.vouchers;
        }
      }
      
      console.log('New vouchers:', newVouchers);
      
      // Update user with new format
      await mongoose.connection.db.collection('users').updateOne(
        { _id: user._id },
        { $set: { vouchers: newVouchers } }
      );
      
      console.log(`✅ Updated user ${user.name}`);
    }
    
    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// Run migration
migrateUserVouchers();
