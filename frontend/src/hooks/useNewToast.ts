import { useNewToastStore } from '../stores/useNewToastStore';
import type { ToastData } from '../components/ui/Toast/NewToast';

export const useToast = () => {
  const { showSuccess, showError, showWarning, showInfo, clearToasts, removeToast } =
    useNewToastStore();

  return {
    // Basic methods
    success: (title: string, message?: string, duration?: number) =>
      showSuccess(title, message, duration),

    error: (title: string, message?: string, duration?: number) =>
      showError(title, message, duration),

    warning: (title: string, message?: string, duration?: number) =>
      showWarning(title, message, duration),

    info: (title: string, message?: string, duration?: number) =>
      showInfo(title, message, duration),

    // Advanced methods with actions
    successWithAction: (
      title: string,
      message?: string,
      actions?: ToastData['actions'],
      duration?: number
    ) => showSuccess(title, message, duration, actions),

    errorWithAction: (
      title: string,
      message?: string,
      actions?: ToastData['actions'],
      duration?: number
    ) => showError(title, message, duration, actions),

    warningWithAction: (
      title: string,
      message?: string,
      actions?: ToastData['actions'],
      duration?: number
    ) => showWarning(title, message, duration, actions),

    infoWithAction: (
      title: string,
      message?: string,
      actions?: ToastData['actions'],
      duration?: number
    ) => showInfo(title, message, duration, actions),

    // Utility methods
    dismiss: (id: string) => removeToast(id),
    clear: () => clearToasts(),

    // Preset toasts for common scenarios
    saveSuccess: () => showSuccess('Đã lưu!', 'Thông tin đã được lưu thành công.'),
    deleteSuccess: () => showSuccess('Đã xóa!', 'Mục đã được xóa thành công.'),
    updateSuccess: () => showSuccess('Đã cập nhật!', 'Thông tin đã được cập nhật thành công.'),

    saveError: () => showError('Lỗi lưu dữ liệu', 'Không thể lưu thông tin. Vui lòng thử lại.'),
    deleteError: () => showError('Lỗi xóa', 'Không thể xóa mục này. Vui lòng thử lại.'),
    updateError: () => showError('Lỗi cập nhật', 'Không thể cập nhật thông tin. Vui lòng thử lại.'),

    networkError: () => showError('Lỗi kết nối', 'Kiểm tra kết nối mạng và thử lại.'),
    permissionError: () =>
      showError('Không có quyền', 'Bạn không có quyền thực hiện hành động này.'),

    loginSuccess: () => showSuccess('Chào mừng!', 'Đăng nhập thành công.'),
    logoutSuccess: () => showInfo('Tạm biệt!', 'Đã đăng xuất thành công.'),

    // Loading toast (manual control)
    loading: (title: string, message?: string) => showInfo(title, message, 0), // Duration 0 means no auto close
  };
};
