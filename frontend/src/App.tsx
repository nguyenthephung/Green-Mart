import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Category from './pages/Category';
import OrdersPage from './pages/OrdersPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import AccountDetails from './pages/AccountDetails';  // Import trang AccountDetails
import MyAddress from './pages/MyAddress'; // Import trang MyAddress
import MyPayment from './pages/MyPayment'; // Import trang MyPayment
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import OtpVerify from './pages/OtpVerify';
import ResetPassword from './pages/ResetPassword';
import PasswordChanged from './pages/PasswordChanged';
import CartPage from './pages/Cart';
import Checkout from './pages/Checkout';
import Home from './pages/Home';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/ordertracking/:orderId" element={<OrderTrackingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp-verify" element={<OtpVerify />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/password-changed" element={<PasswordChanged />} />
         <Route path="/" element={<MainLayout />}>
          <Route path="home" element={<Home />} />
          <Route path="category" element={<Category />} />
          <Route path="ordertracking/:orderId" element={<OrderTrackingPage />} />
          
        </Route>
         <Route path="accountdetail" element={<AccountDetails />} /> {/* Thêm route cho AccountDetails */}
         <Route path="myaddress" element={<MyAddress />} /> {/* Them route cho MyAddress */}
          <Route path="mypayment" element={<MyPayment />} /> {/* them route cho MyPayment */}
        <Route path="myorder" element={<OrdersPage />} />
        <Route path="mycart" element={<CartPage />} />
        <Route path="checkout" element={<Checkout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
