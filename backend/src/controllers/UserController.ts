import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Voucher from '../models/Voucher';
import bcrypt from 'bcryptjs';

// Admin: Get all users with filtering and pagination
const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const role = req.query.role as string;
    const status = req.query.status as string;

    // Build filter query
    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) filter.role = role;
    if (status) filter.status = status;

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách người dùng'
    });
  }
};

// Admin: Get user by ID
const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin người dùng'
    });
  }
};

// Admin: Update user
const updateUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Don't allow password updates through this endpoint
    delete updates.password;

    const user = await User.findByIdAndUpdate(
      userId,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      data: user,
      message: 'Cập nhật thông tin người dùng thành công'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật thông tin người dùng'
    });
  }
};

// Admin: Delete user
const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      message: 'Xóa người dùng thành công'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa người dùng'
    });
  }
};

// Admin: Change user status
const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { status, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      data: user,
      message: `Cập nhật trạng thái người dùng thành ${status} thành công`
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái người dùng'
    });
  }
};

// Admin: Reset user password
const resetUserPassword = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const user = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công'
    });
  } catch (error) {
    console.error('Reset user password error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đặt lại mật khẩu'
    });
  }
};

// Admin: Create new user
const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, role = 'user', status = 'active', address } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email hoặc số điện thoại đã được sử dụng'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      status,
      address,
      isVerified: true, // Admin created users are verified by default
      joinDate: new Date(),
      lastLogin: new Date(),
      totalOrders: 0,
      totalSpent: 0
    });

    await newUser.save();

    // Return user without password
    const userResponse = await User.findById(newUser._id).select('-password');

    res.status(201).json({
      success: true,
      data: userResponse,
      message: 'Tạo người dùng thành công'
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo người dùng'
    });
  }
};

// Admin: Get user statistics
const getUserStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const inactiveUsers = await User.countDocuments({ status: 'inactive' });
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    
    // Users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // New users this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const newUsersThisMonth = await User.countDocuments({
      joinDate: { $gte: thisMonth }
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        suspendedUsers,
        verifiedUsers,
        newUsersThisMonth,
        usersByRole
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê người dùng'
    });
  }
};

// Thêm voucher vào user
const addVoucherToUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { voucherId } = req.body;
    if (!voucherId) {
      return res.status(400).json({ message: 'voucherId is required' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Initialize vouchers as empty object if not exists
    if (!user.vouchers) {
      user.vouchers = {};
    }
    
    // Get current quantity for this voucher (default to 0)
    const currentQuantity = user.vouchers[voucherId] || 0;
    
    // Increase quantity by 1
    user.vouchers[voucherId] = currentQuantity + 1;
    
    // IMPORTANT: Mark vouchers field as modified for Mongoose Mixed type
    user.markModified('vouchers');
    
    console.log('addVoucherToUser:', {
      userId,
      voucherId,
      oldQuantity: currentQuantity,
      newQuantity: currentQuantity + 1,
      allVouchers: user.vouchers
    });
    
    await user.save();
    return res.json({ success: true, vouchers: user.vouchers });
  } catch (err) {
    next(err);
  }
};


// Lấy danh sách voucher của user
const getUserVouchers = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    console.log('getUserVouchers - userId:', userId);
    
    const user = await User.findById(userId);
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    console.log('getUserVouchers - user found:', !!user);
    console.log('getUserVouchers - user.vouchers:', user.vouchers);

    // Convert vouchers object to array format for frontend compatibility
    const userVouchersArray = [];
    if (user.vouchers && typeof user.vouchers === 'object') {
      for (const [voucherId, quantity] of Object.entries(user.vouchers)) {
        if (quantity && quantity > 0) {
          userVouchersArray.push({
            voucherId,
            quantity: Number(quantity)
          });
        }
      }
    }

    console.log('getUserVouchers - returning vouchers:', userVouchersArray);

    res.json({ vouchers: userVouchersArray });
  } catch (err) {
    console.error('getUserVouchers error:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export default {
  getUserVouchers,
  addVoucherToUser,
  // Admin methods
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserStatus,
  resetUserPassword,
  getUserStats,
};
