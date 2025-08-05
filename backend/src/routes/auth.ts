import { Router } from 'express';
import { AuthController } from '@/controllers/AuthController';
import { validateRegister, validateLogin } from '@/middlewares/validation';
import { authenticate } from '@/middlewares/auth';

const router = Router();

// POST /api/auth/register - Đăng ký
router.post('/register', validateRegister, AuthController.register);

// POST /api/auth/login - Đăng nhập
router.post('/login', validateLogin, AuthController.login);

// GET /api/auth/profile - Lấy thông tin profile (cần auth)
router.get('/profile', authenticate, AuthController.getProfile);

// PATCH /api/auth/profile - Chỉnh sửa thông tin profile (cần auth)
router.patch('/profile', authenticate, AuthController.updateProfile);

// POST /api/auth/logout - Đăng xuất (cần auth)
router.post('/logout', authenticate, AuthController.logout);

// Social login routes
// GET /api/auth/google - Google OAuth
router.get('/google', AuthController.googleAuth);

// GET /api/auth/google/callback - Google callback
router.get('/google/callback', AuthController.googleCallback);

// GET /api/auth/facebook - Facebook OAuth
router.get('/facebook', AuthController.facebookAuth);

// GET /api/auth/facebook/callback - Facebook callback
router.get('/facebook/callback', AuthController.facebookCallback);

export default router;
