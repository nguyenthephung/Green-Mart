import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    // Tắt các warning mongoose
    mongoose.set('strictQuery', false);
    
    // Cấu hình connection với retry logic
    const conn = await mongoose.connect(process.env.MONGODB_URI as string, {
      // Tối ưu hóa connection
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // Tăng timeout
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      bufferCommands: false,
      
      // SSL configuration để tránh lỗi SSL
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
      
      // Retry configuration
      retryWrites: true,
      retryReads: true,
      maxConnecting: 2,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Log connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
  } catch (error: any) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    // Retry với cấu hình khác nếu lỗi SSL
    if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.log('🔄 Retrying with different SSL configuration...');
      
      try {
        const conn = await mongoose.connect(process.env.MONGODB_URI as string, {
          maxPoolSize: 5,
          serverSelectionTimeoutMS: 15000,
          socketTimeoutMS: 45000,
          connectTimeoutMS: 15000,
          bufferCommands: false,
          
          // Đơn giản hóa SSL config
          ssl: true,
          
          retryWrites: true,
        });
        
        console.log(`✅ MongoDB Connected (retry): ${conn.connection.host}`);
        return;
        
      } catch (retryError: any) {
        console.error('❌ Retry failed:', retryError.message);
      }
    }
    
    // Nếu vẫn fail, log chi tiết và tiếp tục chạy server
    console.error('⚠️ Starting server without database connection');
    console.error('📝 Please check your MongoDB Atlas configuration:');
    console.error('   1. Cluster is running');
    console.error('   2. IP address is whitelisted');
    console.error('   3. Username/password is correct');
    console.error('   4. Network connectivity is stable');
    
    // Không exit process, để server vẫn chạy
    // process.exit(1);
  }
};

export default connectDB;
