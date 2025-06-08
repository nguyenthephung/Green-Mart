import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import OtpVerify from './pages/OtpVerify';
import ResetPassword from './pages/ResetPassword';
import PasswordChanged from './pages/PasswordChanged';

import MainLayout from './layouts/MainLayout';
import Category from './pages/Category';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang chào mừng mặc định */}
        <Route path="/" element={<Welcome />} />

        {/* Các trang xác thực - không dùng layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp-verify" element={<OtpVerify />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/password-changed" element={<PasswordChanged />} />

        {/* Trang chính sau đăng nhập - dùng layout */}
        <Route path="/home" element={<MainLayout />}>
          <Route index element={<Category />} />
          {/* Thêm các route khác bên trong layout nếu cần */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
