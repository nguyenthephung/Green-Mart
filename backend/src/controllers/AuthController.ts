import { Request, Response } from 'express';
import { User, IUser } from '@/models';
import { generateToken, hashPassword, comparePassword } from '@/utils/auth';
import { AuthRequest } from '@/middlewares/auth';
import mongoose from 'mongoose';
import NotificationHelper from '../services/notificationHelper';

export class AuthController {
  // Cập nhật thông tin user hiện tại
  static updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Lấy user với password để có thể verify current password
      const user = await User.findById(req.user._id);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Người dùng không tồn tại'
        });
        return;
      }

  const { name, phone, avatar, currentPassword, newPassword, email } = req.body;
      // Kiểm tra email trùng nếu có yêu cầu cập nhật email
      if (email && email !== user.email) {
        const emailExists = await User.findOne({ email: email.toLowerCase().trim() });
        if (emailExists) {
          res.status(400).json({
            success: false,
            message: 'Email đã được sử dụng.',
            errors: { email: 'Email này đã có tài khoản' }
          });
          return;
        }
        user.email = email.toLowerCase().trim();
      }

      // If password change is requested, validate current password
      if (newPassword) {
        if (!currentPassword) {
          res.status(400).json({
            success: false,
            message: 'Vui lòng nhập mật khẩu hiện tại'
          });
          return;
        }

        // Verify current password
        const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
          res.status(400).json({
            success: false,
            message: 'Mật khẩu hiện tại không đúng'
          });
          return;
        }

        // Validate new password
        if (newPassword.length < 6) {
          res.status(400).json({
            success: false,
            message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
          });
          return;
        }

        // Hash and update password
        user.password = await hashPassword(newPassword);
        
        // Send notification about password change
        try {
          await NotificationHelper.notifyPasswordChanged((user._id as mongoose.Types.ObjectId).toString());
        } catch (notifError) {
          console.error('Failed to send password change notification:', notifError);
        }
      }

  // Update other profile fields
  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (avatar !== undefined) user.avatar = avatar;

      await user.save();

      const userData = {
        id: (user._id as mongoose.Types.ObjectId).toString(),
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

      const message = newPassword ? 
        'Cập nhật thông tin và mật khẩu thành công!' : 
        'Cập nhật thông tin thành công!';

      res.status(200).json({
        success: true,
        message,
        data: userData
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server. Vui lòng thử lại.'
      });
    }
  }
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

      // Create welcome notifications
      try {
        await NotificationHelper.notifyUserRegistered((user._id as mongoose.Types.ObjectId).toString(), user);
      } catch (notificationError) {
        console.error('Error creating registration notifications:', notificationError);
        // Don't fail registration if notification fails
      }

      // Generate token
      const token = generateToken((user._id as mongoose.Types.ObjectId).toString());

      // Return user data without password
      const userData = {
        id: (user._id as mongoose.Types.ObjectId).toString(),
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
      console.log('Login controller - Request body:', req.body);
      
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ 
        email: email.toLowerCase().trim() 
      });

      if (!user) {
        console.log('Login failed - User not found for email:', email);
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
        id: (user._id as mongoose.Types.ObjectId).toString(),
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

      // Populate voucher data properly
      await user.populate('vouchers.voucherId');

      const userData = {
        id: (user._id as mongoose.Types.ObjectId).toString(),
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
        totalSpent: user.totalSpent,
        vouchers: user.vouchers || []
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

  // Google OAuth
  static googleAuth = async (req: Request, res: Response): Promise<void> => {
    try {
      // Redirect to Google OAuth
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(process.env.GOOGLE_REDIRECT_URI || '')}&` +
        `response_type=code&` +
        `scope=email profile&` +
        `access_type=offline`;
      
      res.redirect(googleAuthUrl);
    } catch (error) {
      console.error('Google auth error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi xác thực Google'
      });
    }
  }

  // Google OAuth callback
  static googleCallback = async (req: Request, res: Response): Promise<void> => {
    try {
      const { code } = req.query;

      if (!code) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
      }

      // Exchange code for access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
          code: code as string,
          grant_type: 'authorization_code',
          redirect_uri: process.env.GOOGLE_REDIRECT_URI || '',
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenData.access_token) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_token_failed`);
      }

      // Get user info from Google
      const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenData.access_token}`);
      const googleUser = await userResponse.json();

      // Find or create user
      let user = await User.findOne({ email: googleUser.email });

      if (!user) {
        // Create new user
        user = new User({
          name: googleUser.name,
          email: googleUser.email,
          avatar: googleUser.picture,
          isVerified: true,
          authProvider: 'google',
          googleId: googleUser.id,
          role: 'user',
          status: 'active'
        });
        await user.save();
      } else if (!user.googleId) {
        // Link existing user with Google
        user.googleId = googleUser.id;
        user.authProvider = 'google';
        user.isVerified = true;
        if (!user.avatar) user.avatar = googleUser.picture;
        await user.save();
      }

      // Generate JWT token
      const token = generateToken(user._id as string);

      // Send success message to popup
      const successScript = `
        <script>
          window.opener.postMessage({
            type: 'SOCIAL_LOGIN_SUCCESS',
            token: '${token}',
            user: ${JSON.stringify({
              id: (user._id as mongoose.Types.ObjectId).toString(),
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
              joinDate: user.createdAt,
              lastLogin: user.lastLogin,
              totalOrders: 0,
              totalSpent: 0,
              vouchers: user.vouchers || {}
            })}
          }, '${process.env.FRONTEND_URL}');
          window.close();
        </script>
      `;

      res.send(successScript);
    } catch (error) {
      console.error('Google callback error:', error);
      const errorScript = `
        <script>
          window.opener.postMessage({
            type: 'SOCIAL_LOGIN_ERROR',
            message: 'Đăng nhập Google thất bại'
          }, '${process.env.FRONTEND_URL}');
          window.close();
        </script>
      `;
      res.send(errorScript);
    }
  }

  // Facebook OAuth
  static facebookAuth = async (req: Request, res: Response): Promise<void> => {
    try {
      // Redirect to Facebook OAuth
      const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
        `client_id=${process.env.FACEBOOK_APP_ID}&` +
        `redirect_uri=${encodeURIComponent(process.env.FACEBOOK_REDIRECT_URI || '')}&` +
        `scope=email,public_profile&` +
        `response_type=code`;
      
      res.redirect(facebookAuthUrl);
    } catch (error) {
      console.error('Facebook auth error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi xác thực Facebook'
      });
    }
  }

  // Facebook OAuth callback
  static facebookCallback = async (req: Request, res: Response): Promise<void> => {
    try {
      const { code } = req.query;

      if (!code) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=facebook_auth_failed`);
      }

      // Exchange code for access token
      const tokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?` +
        `client_id=${process.env.FACEBOOK_APP_ID}&` +
        `client_secret=${process.env.FACEBOOK_APP_SECRET}&` +
        `code=${code}&` +
        `redirect_uri=${encodeURIComponent(process.env.FACEBOOK_REDIRECT_URI || '')}`
      );

      const tokenData = await tokenResponse.json();

      if (!tokenData.access_token) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=facebook_token_failed`);
      }

      // Get user info from Facebook
      const userResponse = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${tokenData.access_token}`);
      const facebookUser = await userResponse.json();

      // Find or create user
      let user = await User.findOne({ 
        $or: [
          { email: facebookUser.email },
          { facebookId: facebookUser.id }
        ]
      });

      if (!user) {
        // Create new user
        user = new User({
          name: facebookUser.name,
          email: facebookUser.email || `fb_${facebookUser.id}@facebook.com`,
          avatar: facebookUser.picture?.data?.url,
          isVerified: true,
          authProvider: 'facebook',
          facebookId: facebookUser.id,
          role: 'user',
          status: 'active'
        });
        await user.save();
      } else if (!user.facebookId) {
        // Link existing user with Facebook
        user.facebookId = facebookUser.id;
        user.authProvider = 'facebook';
        user.isVerified = true;
        if (!user.avatar && facebookUser.picture?.data?.url) {
          user.avatar = facebookUser.picture.data.url;
        }
        await user.save();
      }

      // Generate JWT token
      const token = generateToken(user._id as string);

      // Send success message to popup
      const successScript = `
        <script>
          window.opener.postMessage({
            type: 'SOCIAL_LOGIN_SUCCESS',
            token: '${token}',
            user: ${JSON.stringify({
              id: (user._id as mongoose.Types.ObjectId).toString(),
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
              joinDate: user.createdAt,
              lastLogin: user.lastLogin,
              totalOrders: 0,
              totalSpent: 0,
              vouchers: user.vouchers || {}
            })}
          }, '${process.env.FRONTEND_URL}');
          window.close();
        </script>
      `;

      res.send(successScript);
    } catch (error) {
      console.error('Facebook callback error:', error);
      const errorScript = `
        <script>
          window.opener.postMessage({
            type: 'SOCIAL_LOGIN_ERROR',
            message: 'Đăng nhập Facebook thất bại'
          }, '${process.env.FRONTEND_URL}');
          window.close();
        </script>
      `;
      res.send(errorScript);
    }
  }
}
