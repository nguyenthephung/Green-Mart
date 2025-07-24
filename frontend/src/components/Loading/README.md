# Loading Components System

Hệ thống loading components thống nhất cho toàn bộ GreenMart app.

## Components Available

### 1. LoadingSpinner
Component loading chính với spinner xoay.

```tsx
import { LoadingSpinner } from '../components/Loading';

// Basic usage
<LoadingSpinner />

// With custom props
<LoadingSpinner
  size="xl"                    // 'sm' | 'md' | 'lg' | 'xl'
  text="Đang tải..."          // Custom text
  subText="Vui lòng đợi"      // Sub text
  fullScreen={true}           // Full screen overlay
  variant="primary"           // 'primary' | 'secondary' | 'white'
/>
```

### 2. PageLoading
Component loading toàn trang với branding.

```tsx
import { PageLoading } from '../components/Loading';

<PageLoading
  text="Đang khởi tạo GreenMart..."
  subText="Siêu thị tươi ngon mỗi ngày!"
/>
```

### 3. LoadingDots
Component loading với dots animation cho buttons/inline.

```tsx
import { LoadingDots } from '../components/Loading';

// In button
<button disabled={loading}>
  {loading ? <LoadingDots text="Đang xử lý" color="white" /> : 'Submit'}
</button>
```

## Hooks Available

### 1. useLoading
Hook quản lý loading state.

```tsx
import { useLoading } from '../components/Loading';

const { isLoading, startLoading, stopLoading } = useLoading();

// Usage
const handleSubmit = async () => {
  startLoading();
  try {
    await submitData();
  } finally {
    stopLoading();
  }
};
```

### 2. usePageLoading
Hook tạo loading với delay tự động.

```tsx
import { usePageLoading } from '../components/Loading';

// No delay (instant)
const loading = usePageLoading(0);

// With 500ms delay
const loading = usePageLoading(500);
```

## CSS Classes Available

### Loading Animations
```css
.animate-spin-slow        /* Slow spin (3s) */
.animate-pulse-green      /* Green pulse effect */
.loading-dots             /* Dots container */
```

### Usage in components
```tsx
<div className="animate-pulse-green">
  <div className="w-4 h-4 bg-brand-green rounded-full" />
</div>
```

## Best Practices

1. **Full Screen Loading**: Dùng `PageLoading` hoặc `LoadingSpinner` với `fullScreen={true}`
2. **Button Loading**: Dùng `LoadingDots` cho button states
3. **Section Loading**: Dùng `LoadingSpinner` với size phù hợp
4. **Consistent Colors**: Dùng variant phù hợp với theme

## Migration từ old loading

### Thay thế old spinner
```tsx
// Old
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500">

// New
<LoadingSpinner size="md" />
```

### Thay thế old full screen
```tsx
// Old
<div className="fixed inset-0 z-[9999] flex items-center justify-center">
  <div className="animate-spin...">

// New
<LoadingSpinner fullScreen={true} />
```
