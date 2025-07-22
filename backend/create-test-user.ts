import mongoose from 'mongoose';
import { User } from './src/models';
import { hashPassword } from './src/utils/auth';
import dotenv from 'dotenv';

dotenv.config();

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Check if test user exists
    const existingUser = await User.findOne({ email: 'test@greenmart.com' });
    
    if (existingUser) {
      console.log('Test user already exists:', existingUser.email);
      return;
    }

    // Create test user
    const hashedPassword = await hashPassword('123456');
    
    const testUser = new User({
      name: 'Test User',
      email: 'test@greenmart.com',
      phone: '0123456789',
      password: hashedPassword,
      role: 'user',
      status: 'active',
      isVerified: true
    });

    await testUser.save();
    console.log('Test user created successfully!');
    console.log('Email: test@greenmart.com');
    console.log('Password: 123456');

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    mongoose.connection.close();
  }
};

createTestUser();
