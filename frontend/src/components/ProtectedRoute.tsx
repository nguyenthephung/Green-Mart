import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../stores/useUserStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole = 'user',
  redirectTo = '/login' 
}) => {
  const { user, isLoading } = useUserStore();
  const location = useLocation();

  // Hiển thị loading khi đang check auth
  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập -> chuyển về login
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Kiểm tra role (nếu có yêu cầu)
  if (requiredRole && user.role !== requiredRole) {
    // Admin có thể truy cập mọi trang user
    if (user.role === 'admin' && requiredRole === 'user') {
      // Admin được phép truy cập trang user
      return <>{children}</>;
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
