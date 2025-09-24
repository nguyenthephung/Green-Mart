import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../stores/useUserStore';
import { LoadingSpinner } from './Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = 'user',
  redirectTo = '/login',
}) => {
  const { user, isLoading } = useUserStore();
  const location = useLocation();

  // Hiển thị loading khi đang check auth
  if (isLoading) {
    return <LoadingSpinner size="lg" text="Đang kiểm tra quyền truy cập..." fullScreen={true} />;
  }

  // Chưa đăng nhập -> chuyển về login
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Kiểm tra role (nếu có yêu cầu)
  if (requiredRole && user.role !== requiredRole) {
    // Nếu là admin nhưng truy cập route user/guest thì chuyển về admin dashboard
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    // Nếu không phải admin nhưng cố truy cập admin -> về home
    if (requiredRole === 'admin') {
      return <Navigate to="/home" replace />;
    }
    // Các trường hợp khác
    return <Navigate to="/unauthorized" replace />;
  }

  // Đã đăng nhập và có quyền -> render children
  return <>{children}</>;
};

export default ProtectedRoute;
