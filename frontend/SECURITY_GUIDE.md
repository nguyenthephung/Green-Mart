# 🛡️ Hệ thống Bảo mật Admin Routes - GreenMart

## 📁 Files đã tạo

### 1. **ProtectedRoute Component**
**File:** `frontend/src/components/ProtectedRoute.tsx`
- Kiểm tra authentication và authorization
- Hỗ trợ nhiều loại roles
- Hiển thị loading state khi kiểm tra quyền
- Redirect về login nếu chưa đăng nhập

### 2. **AdminRoute Component** 
**File:** `frontend/src/components/AdminRoute.tsx`
- Wrapper đặc biệt cho admin routes
- Chỉ cho phép role 'admin' truy cập
- Sử dụng ProtectedRoute với requiredRole='admin'

### 3. **UnauthorizedPage**
**File:** `frontend/src/pages/Guest/UnauthorizedPage.tsx`
- Trang thông báo không có quyền truy cập
- UI thân thiện với user
- Có link về trang chủ và đăng nhập lại

### 4. **UserContext** 
**File:** `frontend/src/reduxSlice/UserContext.tsx`
- Quản lý state đăng nhập của user
- Cung cấp các function: login, register, logout
- Export hook useUser để components sử dụng

### 5. **CartContext**
**File:** `frontend/src/reduxSlice/CartContext.tsx`
- Quản lý giỏ hàng theo user
- Lưu cart riêng biệt cho từng user trong localStorage
- Tự động sync cart khi user thay đổi

## 🔒 Cách hoạt động

### Logic bảo vệ routes:
1. **Chưa đăng nhập** → Redirect đến `/login`
2. **Đăng nhập + Role user** → Truy cập được user routes
3. **Đăng nhập + Role admin** → Truy cập được tất cả routes
4. **Role không phù hợp** → Redirect đến `/unauthorized`

### Routes được bảo vệ:
```
Protected User Routes:
- /accountdetail - Thông tin tài khoản
- /myaddress - Địa chỉ của tôi  
- /mypayment - Thanh toán
- /myvoucher - Voucher của tôi
- /myorder - Đơn hàng của tôi
- /notification-settings - Cài đặt thông báo
- /notifications - Danh sách thông báo

Admin Only Routes:
- /admin/* - Tất cả trang admin
```

## 🧪 Test hệ thống

### 1. Test với user thường:
```typescript
// Mock user trong UserContext
const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'user@test.com',
  role: 'user' // ← Role user
};
```

### 2. Test với admin:
```typescript  
// Mock admin trong UserContext
const mockUser = {
  id: '1',
  name: 'Admin',
  email: 'admin@test.com', 
  role: 'admin' // ← Role admin
};
```

### 3. Test các scenarios:
- ✅ User chưa đăng nhập truy cập `/admin` → Chuyển về `/login`
- ✅ User đã đăng nhập (role: user) truy cập `/admin` → Chuyển về `/home`
- ✅ Admin truy cập `/admin` → Thành công
- ✅ User truy cập `/accountdetail` → Thành công
- ✅ Guest truy cập `/accountdetail` → Chuyển về `/login`

## 🔧 Sử dụng trong Components

### Cách sử dụng ProtectedRoute:
```typescript
import ProtectedRoute from '../components/ProtectedRoute';

// Route cần đăng nhập
<Route path="/protected" element={
  <ProtectedRoute>
    <SomeComponent />
  </ProtectedRoute>
} />

// Route chỉ admin
<Route path="/admin-only" element={
  <ProtectedRoute requiredRole="admin">
    <AdminComponent />
  </ProtectedRoute>
} />
```

### Cách sử dụng AdminRoute:
```typescript
import AdminRoute from '../components/AdminRoute';

<Route path="/admin" element={
  <AdminRoute>
    <AdminLayout />
  </AdminRoute>
}>
  <Route path="dashboard" element={<AdminDashboard />} />
</Route>
```

### Cách sử dụng UserContext:
```typescript
import { useUser } from '../reduxSlice/UserContext';

function SomeComponent() {
  const { user, login, logout, isLoading } = useUser();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {user ? (
        <div>
          <p>Xin chào {user.name}</p>
          {user.role === 'admin' && (
            <Link to="/admin">Admin Panel</Link>
          )}
          <button onClick={logout}>Đăng xuất</button>
        </div>
      ) : (
        <Link to="/login">Đăng nhập</Link>
      )}
    </div>
  );
}
```

## 🔄 Tích hợp với Backend

Khi có backend thật, cần cập nhật UserContext:

```typescript
// Trong UserContext.tsx
const login = async (credentials) => {
  try {
    const response = await authService.login(credentials);
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
```

## 📝 Checklist hoàn thành

- [x] ProtectedRoute component
- [x] AdminRoute component  
- [x] UnauthorizedPage
- [x] UserContext với mock data
- [x] CartContext theo user
- [x] AppRouter đã cập nhật với bảo mật
- [x] Tài liệu hướng dẫn

## 🚀 Bước tiếp theo

1. **Tích hợp Backend API** - Thay thế mock data bằng API thật
2. **Test Security** - Kiểm tra kỹ các edge cases
3. **UI Enhancement** - Cải thiện loading states và error handling
4. **Role Management** - Mở rộng hệ thống role nếu cần (moderator, etc.)

---

**Hệ thống bảo mật đã sẵn sàng! 🎉**
