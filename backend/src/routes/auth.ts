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

export default router;
