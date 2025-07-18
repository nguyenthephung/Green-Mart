import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from '../reduxSlice/CartContext';
import { UserProvider } from '../reduxSlice/UserContext';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import { Suspense, lazy } from 'react';

const Category = lazy(() => import('../pages/Guest/SearchPage'));
const OrdersPage = lazy(() => import('../pages/Guest/OrdersPage'));
const OrderTrackingPage = lazy(() => import('../pages/Guest/OrderTrackingPage'));
const AccountDetails = lazy(() => import('../pages/Guest/AccountDetailsPage'));
const MyAddress = lazy(() => import('../pages/Guest/MyAddressPage'));
const MyPayment = lazy(() => import('../pages/Guest/MyPaymentPage'));
const Welcome = lazy(() => import('../pages/Guest/WelcomePage'));
const Login = lazy(() => import('../pages/Guest/LoginPage'));
const Register = lazy(() => import('../pages/Guest/RegisterPage'));
const ForgotPassword = lazy(() => import('../pages/Guest/ForgotPasswordPage'));
const OtpVerify = lazy(() => import('../pages/Guest/OtpVerifyPage'));
const ResetPassword = lazy(() => import('../pages/Guest/ResetPasswordPage'));
const PasswordChanged = lazy(() => import('../pages/Guest/PasswordChangedPage'));
const CartPage = lazy(() => import('../pages/Guest/CartPage'));
const Checkout = lazy(() => import('../pages/Guest/CheckoutPage'));
const Home = lazy(() => import('../pages/Guest/HomePage'));
const ProductDetailPage = lazy(() => import('../pages/Guest/ProductDetailPage'));
const CategoryPage = lazy(() => import('../pages/Guest/CategoryPage'));
const MyVoucher = lazy(() => import('../pages/Guest/MyVoucherPage'));
const NotificationSettingsPage = lazy(() => import('../pages/Guest/NotificationSettingsPage'));
const NotificationListPage = lazy(() => import('../pages/Guest/NotificationListPage'));

// Admin pages
const AdminDashboard = lazy(() => import('../pages/Admin/AdminDashboardPage'));
const AdminProducts = lazy(() => import('../pages/Admin/AdminProductsPage'));
const AdminCategories = lazy(() => import('../pages/Admin/AdminCategoriesPage'));
const AdminUsers = lazy(() => import('../pages/Admin/AdminUsersPage'));
const AdminOrders = lazy(() => import('../pages/Admin/AdminOrdersPage'));
const AdminBanners = lazy(() => import('../pages/Admin/AdminBannersPage'));

const AppRouter = () => (
  <UserProvider>
    <CartProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="w-full min-h-screen flex items-center justify-center text-lg">Đang tải trang...</div>}>
          <Routes>
            {/* Guest/User routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Welcome />} />
              <Route path="home" element={<Home />} />
              <Route path="search" element={<Category />} />
              <Route path="ordertracking/:orderId" element={<OrderTrackingPage />} />
              <Route path="productdetail/:id" element={<ProductDetailPage />} />
              <Route path="mycart" element={<CartPage />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="/category/:category?" element={<CategoryPage />} />
            </Route>
            <Route path="accountdetail" element={<AccountDetails />} />
            <Route path="myaddress" element={<MyAddress />} />
            <Route path="mypayment" element={<MyPayment />} />
            <Route path="myvoucher" element={<MyVoucher />} />
            <Route path="myorder" element={<OrdersPage />} />
            <Route path="notification-settings" element={<NotificationSettingsPage />} />
            <Route path="notifications" element={<NotificationListPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/otp-verify" element={<OtpVerify />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/password-changed" element={<PasswordChanged />} />
            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="banners" element={<AdminBanners />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </CartProvider>
  </UserProvider>
);

export default AppRouter;
