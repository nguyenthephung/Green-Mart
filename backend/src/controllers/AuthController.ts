import { Request, Response } from 'express';
import { User, IUser } from '@/models';
import { generateToken, hashPassword, comparePassword } from '@/utils/auth';
import { AuthRequest } from '@/middlewares/auth';
import mongoose from 'mongoose';

export class AuthController {
  // Đăng ký
  static register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, phone, password, address, dateOfBirth, gender } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [{ email }, { phone }] 
      });

      if (existingUser) {
        if (existingUser.email === email) {
          res.status(400).json({
            success: false,
            message: 'Email đã được sử dụng.',
            errors: { email: 'Email này đã có tài khoản' }
          });
          return;
        }
        if (existingUser.phone === phone) {
          res.status(400).json({
            success: false,
            message: 'Số điện thoại đã được sử dụng.',
            errors: { phone: 'Số điện thoại này đã có tài khoản' }
          });
          return;
        }
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create new user
      const user = new User({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password: hashedPassword,
        address: address?.trim(),
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        isVerified: false, // In production, implement email verification
        role: 'user'
      });

      await user.save();

      // Generate token
      const token = generateToken((user._id as mongoose.Types.ObjectId).toString());

      // Return user data without password
      const userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        isVerified: user.isVerified,
        avatar: user.avatar,
        address: user.address,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        joinDate: user.joinDate,
        totalOrders: user.totalOrders,
        totalSpent: user.totalSpent
      };

      res.status(201).json({
        success: true,
        message: 'Đăng ký thành công!',
        data: {
          user: userData,
          token
        }
      });

    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server. Vui lòng thử lại.',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Đăng nhập
  static login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ 
        email: email.toLowerCase().trim() 
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Email hoặc mật khẩu không đúng.',
          errors: { email: 'Email không tồn tại' }
        });
        return;
      }

      // Check password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Email hoặc mật khẩu không đúng.',
          errors: { password: 'Mật khẩu không đúng' }
        });
        return;
      }

      // Check account status
      if (user.status !== 'active') {
        res.status(401).json({
          success: false,
          message: 'Tài khoản đã bị khóa hoặc tạm ngưng.',
          errors: { account: 'Tài khoản không hoạt động' }
        });
        return;
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = generateToken((user._id as mongoose.Types.ObjectId).toString());

      // Return user data without password
      const userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        isVerified: user.isVerified,
        avatar: user.avatar,
        address: user.address,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        joinDate: user.joinDate,
        lastLogin: user.lastLogin,
        totalOrders: user.totalOrders,
        totalSpent: user.totalSpent
      };

      res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công!',
        data: {
          user: userData,
          token
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server. Vui lòng thử lại.',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Lấy thông tin user hiện tại
  static getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = req.user;

      const userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        isVerified: user.isVerified,
        avatar: user.avatar,
        address: user.address,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        joinDate: user.joinDate,
        lastLogin: user.lastLogin,
        totalOrders: user.totalOrders,
        totalSpent: user.totalSpent
      };

      res.status(200).json({
        success: true,
        message: 'Lấy thông tin thành công!',
        data: userData
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server. Vui lòng thử lại.'
      });
    }
  }

  // Đăng xuất (Client side sẽ xóa token)
  static logout = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      res.status(200).json({
        success: true,
        message: 'Đăng xuất thành công!'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server. Vui lòng thử lại.'
      });
    }
  }
}
