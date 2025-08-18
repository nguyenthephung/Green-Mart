import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';
import RedirectToHome from '../components/RedirectToHome';

// Direct imports instead of lazy loading
import Category from '../pages/Guest/SearchPage';
import OrdersPage from '../pages/Guest/OrdersPage';
import OrderTrackingPage from '../pages/Guest/OrderTrackingPage';
import AccountDetails from '../pages/Guest/AccountDetailsPage';
import MyAddress from '../pages/Guest/MyAddressPage';
import MyPayment from '../pages/Guest/MyPaymentPage';
import Welcome from '../pages/Guest/WelcomePage';
import Login from '../pages/Guest/LoginPage';
import Register from '../pages/Guest/RegisterPage';
import ForgotPassword from '../pages/Guest/ForgotPasswordPage';
import OtpVerify from '../pages/Guest/OtpVerifyPage';
import ResetPassword from '../pages/Guest/ResetPasswordPage';
import PasswordChanged from '../pages/Guest/PasswordChangedPage';
import ChangePasswordPage from '../pages/Guest/ChangePasswordPage';
import CartPage from '../pages/Guest/CartPage';
import Checkout from '../pages/Guest/CheckoutPage';
import GuestCheckoutPage from '../pages/Guest/GuestCheckoutPage';
import GuestOrderSuccessPage from '../pages/Guest/GuestOrderSuccessPage';
import GuestFlashSalePage from '../pages/Guest/GuestFlashSalePage';
import Home from '../pages/Guest/HomePage';
import ProductDetailPage from '../pages/Guest/ProductDetailPage';
import CategoryPage from '../pages/Guest/CategoryPage';
import MyVoucher from '../pages/Guest/MyVoucherPage';
import AboutPage from '../pages/Guest/AboutPage';
import PolicyPage from '../pages/Guest/PolicyPage';
import NotificationSettingsPage from '../pages/Guest/NotificationSettingsPage';
import NotificationPage from '../pages/Guest/NotificationPage';
import WishlistPage from '../pages/Guest/WishlistPage';
import OrderSuccessPage from '../pages/Guest/OrderSuccessPage';
import PaymentResultPage from '../pages/Guest/PaymentResultPage';
import PaymentTestPage from '../pages/Guest/PaymentTestPage';
import UnauthorizedPage from '../pages/Guest/UnauthorizedPage';

// Admin pages
import AdminDashboard from '../pages/Admin/AdminDashboardPage';
import AnalyticsDashboard from '../components/Admin/Analytics/AnalyticsDashboard';
import AdminProducts from '../pages/Admin/AdminProductsPage';
import AdminCategories from '../pages/Admin/AdminCategoriesPage';
import AdminUsers from '../pages/Admin/AdminUsersPage';
import AdminOrders from '../pages/Admin/AdminOrdersPage';
import AdminBanners from '../pages/Admin/AdminBannersPage';
import AdminVouchersPage from '../pages/Admin/AdminVouchersPage';
import AdminFlashSalePage from '../pages/Admin/AdminFlashSalePage';

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
          {/* Guest/User routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<RedirectToHome />} />
            <Route path="welcome" element={<Welcome />} />
            <Route path="home" element={<Home />} />
            <Route path="search" element={<Category />} />
            <Route path="ordertracking/:orderId" element={<OrderTrackingPage />} />
            <Route path="productdetail/:id" element={<ProductDetailPage />} />
            <Route path="category/:category?" element={<CategoryPage />} />
            <Route path="mycart" element={<CartPage />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="guest-checkout" element={<GuestCheckoutPage />} />
            <Route path="order-success" element={<OrderSuccessPage />} />
            <Route path="guest-order-success" element={<GuestOrderSuccessPage />} />
            <Route path="payment-result" element={<PaymentResultPage />} />
            <Route path="payment-test" element={<PaymentTestPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="policy/:section" element={<PolicyPage />} />
            <Route path="flash-sale" element={<GuestFlashSalePage />} />
          </Route>
          <Route path="accountdetail" element={
            <ProtectedRoute>
              <AccountDetails />
            </ProtectedRoute>
          } />
          <Route path="myaddress" element={
            <ProtectedRoute>
              <MyAddress />
            </ProtectedRoute>
          } />
          <Route path="mypayment" element={
            <ProtectedRoute>
              <MyPayment />
            </ProtectedRoute>
          } />
          <Route path="myvoucher" element={
            <ProtectedRoute>
              <MyVoucher />
            </ProtectedRoute>
          } />
          <Route path="myorder" element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          } />
          <Route path="notification-settings" element={
            <ProtectedRoute>
              <NotificationSettingsPage />
            </ProtectedRoute>
          } />
          <Route path="change-password" element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          } />
          <Route path="notifications" element={
            <ProtectedRoute>
              <NotificationPage />
            </ProtectedRoute>
          } />

          <Route path="wishlist" element={
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          } />
          
          <Route path="unauthorized" element={<UnauthorizedPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/otp-verify" element={<OtpVerify />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/password-changed" element={<PasswordChanged />} />
          {/* Admin routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="vouchers" element={<AdminVouchersPage />} />
            <Route path="flash-sales" element={<AdminFlashSalePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    );

export default AppRouter;
