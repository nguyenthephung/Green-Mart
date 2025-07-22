# Error Handling Components

Dự án này bao gồm 2 error message components được thiết kế đẹp mắt và user-friendly cho trang Home và Cart.

## Components

### 1. HomeError Component

Component hiển thị lỗi cho trang chủ với các loại lỗi khác nhau:

- `network`: Lỗi mất kết nối mạng
- `server`: Lỗi máy chủ/bảo trì
- `general`: Lỗi chung

#### Props:
```typescript
interface HomeErrorProps {
  errorType?: 'network' | 'server' | 'general';
  message?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
}
```

#### Sử dụng:
```tsx
import HomeError from './components/Error/HomeError';

<HomeError
  errorType="network"
  message="Tùy chỉnh message"
  onRetry={() => window.location.reload()}
  onGoHome={() => navigate('/home')}
/>
```

### 2. CartError Component

Component hiển thị lỗi cho trang giỏ hàng với các tình huống:

- `empty`: Giỏ hàng trống
- `loading_failed`: Lỗi tải dữ liệu
- `network`: Lỗi mạng
- `sync_failed`: Lỗi đồng bộ dữ liệu

#### Props:
```typescript
interface CartErrorProps {
  errorType?: 'empty' | 'loading_failed' | 'network' | 'sync_failed';
  message?: string;
  onRetry?: () => void;
  onContinueShopping?: () => void;
  onClearCart?: () => void;
}
```

#### Sử dụng:
```tsx
import CartError from './components/Error/CartError';

<CartError
  errorType="empty"
  onContinueShopping={() => navigate('/home')}
  onRetry={() => fetchCartData()}
/>
```

## Hooks để xử lý lỗi

### useHomeErrorHandling
Hook cung cấp các method để handle lỗi cho trang Home:

```tsx
const {
  error,
  handleNetworkError,
  handleServerError,
  handleGeneralError,
  ErrorComponent
} = useHomeErrorHandling();

// Trong try-catch
try {
  await fetchData();
} catch (err) {
  handleNetworkError('Không thể tải dữ liệu');
}

// Render
if (error) {
  return ErrorComponent;
}
```

### useCartErrorHandling
Hook cung cấp các method để handle lỗi cho trang Cart:

```tsx
const {
  error,
  handleEmptyCart,
  handleLoadingFailed,
  handleNetworkError,
  handleSyncFailed,
  ErrorComponent
} = useCartErrorHandling();

// Kiểm tra giỏ hàng trống
if (cartItems.length === 0) {
  handleEmptyCart();
}
```

## Tính năng chính

### ✨ Animations
- Bounce animation cho icons
- Fade in effects
- Smooth transitions
- Decorative spinning rings

### 🎨 UI/UX
- Gradient backgrounds theo loại lỗi
- Icons phù hợp với từng loại lỗi
- Color coding (đỏ, xanh, vàng, cam)
- Responsive design

### 🔧 Functionality
- Retry actions
- Navigation buttons
- Clear cart functionality
- Customizable messages

## Demo

Truy cập `/demo/error-messages` để xem demo interactive với tất cả các loại lỗi.

## Best Practices

1. **Luôn cung cấp retry action** cho lỗi network và server
2. **Sử dụng message phù hợp** với context của ứng dụng
3. **Cho phép user navigate** về trang chủ hoặc tiếp tục shopping
4. **Hiển thị loading state** trước khi show error
5. **Log errors** để debug và monitoring

## Styling

Các components sử dụng Tailwind CSS với:
- Custom animations trong `index.css`
- Responsive breakpoints
- Consistent color scheme
- Accessible focus states

## Accessibility

- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly
- High contrast colors
- Clear error messaging
