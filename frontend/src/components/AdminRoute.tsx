import React from 'react';
import ProtectedRoute from './ProtectedRoute';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  return (
    <ProtectedRoute requiredRole="admin" redirectTo="/login">
      {children}
    </ProtectedRoute>
  );
};

export default AdminRoute;
