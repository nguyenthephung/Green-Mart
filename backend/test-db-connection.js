const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  console.log('🔄 Testing MongoDB connection...');
  console.log('📝 Connection string:', process.env.MONGODB_URI?.replace(/\/\/.*:.*@/, '//***:***@'));
  
  try {
    // Test với cấu hình cơ bản
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log('✅ Connection successful!');
    console.log(`📊 Host: ${mongoose.connection.host}`);
    console.log(`🗄️ Database: ${mongoose.connection.name}`);
    console.log(`🔗 Ready state: ${mongoose.connection.readyState}`);
    
    // Test basic operation
    const admin = mongoose.connection.db.admin();
    const serverStatus = await admin.serverStatus();
    console.log(`🖥️ MongoDB version: ${serverStatus.version}`);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📁 Collections: ${collections.map(c => c.name).join(', ') || 'None'}`);
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.log('\n🔧 SSL Error Solutions:');
      console.log('1. Check if your IP is whitelisted in MongoDB Atlas');
      console.log('2. Try different connection string format');
      console.log('3. Update Node.js and npm to latest versions');
      console.log('4. Try connecting from different network');
    }
    
    if (error.message.includes('authentication')) {
      console.log('\n🔐 Authentication Error Solutions:');
      console.log('1. Check username and password');
      console.log('2. Ensure user has proper permissions');
      console.log('3. Check database name in connection string');
    }
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
  }
};

testConnection();
