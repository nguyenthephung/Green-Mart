import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Category from './pages/Category';
import OrdersPage from './pages/OrdersPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import AccountDetails from './pages/AccountDetails';  // Import trang AccountDetails
import MyAddress from './pages/MyAddress'; // Import trang MyAddress
import MyPayment from './pages/MyPayment'; // Import trang MyPayment


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route path="category" element={<Category />} />
          <Route path="ordertracking/:orderId" element={<OrderTrackingPage />} />
          <Route path="account-details" element={<AccountDetails />} /> {/* Thêm route cho AccountDetails */}
          <Route path="my-address" element={<MyAddress />} /> {/* Them route cho MyAddress */}
          <Route path="my-payment" element={<MyPayment />} /> {/* them route cho MyPayment */}
        </Route>
        <Route path="myorders" element={<OrdersPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
