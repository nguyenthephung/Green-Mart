import { Navigate } from 'react-router-dom';
import { useUserStore } from '../stores/useUserStore';

const RedirectToHome: React.FC = () => {
  const user = useUserStore(state => state.user);
  const isLoading = useUserStore(state => state.isLoading);

  // Nếu đang loading, hiển thị loading
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/90">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    );
  }

  // Nếu đã đăng nhập -> redirect to home
  if (user) {
    return <Navigate to="/home" replace />;
  }

  // Nếu chưa đăng nhập -> cũng redirect to home (không cần đăng nhập)
  return <Navigate to="/home" replace />;
};

export default RedirectToHome;
