import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@/utils/auth';
import { User } from '@/models';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
      return;
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid token. User not found.' 
      });
      return;
    }

    if (user.status !== 'active') {
      res.status(401).json({ 
        success: false, 
        message: 'Account is suspended or inactive.' 
      });
      return;
    }

    // Đảm bảo luôn có trường _id và userId trên req.user
    req.user = user;
    req.user._id = user._id;
    req.user.userId = user._id;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

// Optional authentication - allows both authenticated and unauthenticated users
export const optionalAuthenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // No token provided, continue without user info
      req.user = null;
      next();
      return;
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || user.status !== 'active') {
      // Invalid token or inactive user, continue without user info
      req.user = null;
      next();
      return;
    }

    // Đảm bảo luôn có trường _id và userId trên req.user
    req.user = user;
    req.user._id = user._id;
    req.user.userId = user._id;
    next();
  } catch (error) {
    // Token verification failed, continue without user info
    req.user = null;
    next();
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        success: false, 
        message: 'Access denied.' 
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        message: 'Permission denied.' 
      });
      return;
    }

    next();
  };
};

// Admin only middleware
export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ 
      success: false, 
      message: 'Access denied.' 
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ 
      success: false, 
      message: 'Admin access required.' 
    });
    return;
  }

  next();
};
