import { Request, Response, NextFunction } from 'express';

export const validateRegister = (req: Request, res: Response, next: NextFunction): void => {
  const { name, email, phone, password } = req.body;
  
  // Check if all fields are provided
  if (!name || !email || !phone || !password) {
    res.status(400).json({
      success: false,
      message: 'Vui lòng điền đầy đủ thông tin.',
      errors: {
        name: !name ? 'Tên là bắt buộc' : null,
        email: !email ? 'Email là bắt buộc' : null,
        phone: !phone ? 'Số điện thoại là bắt buộc' : null,
        password: !password ? 'Mật khẩu là bắt buộc' : null
      }
    });
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({
      success: false,
      message: 'Email không hợp lệ.',
      errors: { email: 'Định dạng email không đúng' }
    });
    return;
  }

  // Validate phone format (Vietnamese phone numbers)
  const phoneRegex = /^(0|\+84)[3-9][0-9]{8}$/;
  if (!phoneRegex.test(phone)) {
    res.status(400).json({
      success: false,
      message: 'Số điện thoại không hợp lệ.',
      errors: { phone: 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0' }
    });
    return;
  }

  // Validate password strength
  if (password.length < 6) {
    res.status(400).json({
      success: false,
      message: 'Mật khẩu quá ngắn.',
      errors: { password: 'Mật khẩu phải có ít nhất 6 ký tự' }
    });
    return;
  }

  // Validate name
  if (name.trim().length < 2) {
    res.status(400).json({
      success: false,
      message: 'Tên quá ngắn.',
      errors: { name: 'Tên phải có ít nhất 2 ký tự' }
    });
    return;
  }

  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  console.log('Login validation - Request body:', req.body);
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    console.log('Login validation failed - Missing fields');
    res.status(400).json({
      success: false,
      message: 'Vui lòng điền email và mật khẩu.',
      errors: {
        email: !email ? 'Email là bắt buộc' : null,
        password: !password ? 'Mật khẩu là bắt buộc' : null
      }
    });
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log('Login validation failed - Invalid email format');
    res.status(400).json({
      success: false,
      message: 'Email không hợp lệ.',
      errors: { email: 'Định dạng email không đúng' }
    });
    return;
  }

  console.log('Login validation passed');
  next();
};
