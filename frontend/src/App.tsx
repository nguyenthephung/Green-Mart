import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './reduxSlice/CartContext';
import { UserProvider } from './reduxSlice/UserContext';
import MainLayout from './layouts/MainLayout';
import Category from './pages/Guest/SearchPage';
import OrdersPage from './pages/Guest/OrdersPage';
import OrderTrackingPage from './pages/Guest/OrderTrackingPage';
import AccountDetails from './pages/Guest/AccountDetailsPage';  // Import trang AccountDetails
import MyAddress from './pages/Guest/MyAddressPage'; // Import trang MyAddress
import MyPayment from './pages/Guest/MyPaymentPage'; // Import trang MyPayment
import Welcome from './pages/Guest/WelcomePage';
import Login from './pages/Guest/LoginPage';
import Register from './pages/Guest/RegisterPage';
import ForgotPassword from './pages/Guest/ForgotPasswordPage';
import OtpVerify from './pages/Guest/OtpVerifyPage';
import ResetPassword from './pages/Guest/ResetPasswordPage';
import PasswordChanged from './pages/Guest/PasswordChangedPage';
import CartPage from './pages/Guest/CartPage';
import Checkout from './pages/Guest/CheckoutPage';
import Home from './pages/Guest/HomePage';
import ProductDetailPage from './pages/Guest/ProductDetailPage';
import CategoryPage from './pages/Guest/CategoryPage';
function App() {
  return (
    <UserProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
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
              <Route path="myorder" element={<OrdersPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/otp-verify" element={<OtpVerify />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/password-changed" element={<PasswordChanged />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </UserProvider>
  );
}

export default App;
