import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Category from './pages/Category'
import OrdersPage from "./pages/OrdersPage";
import OrderTrackingPage from './pages/OrderTrackingPage';
// import các page khác...

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route path="category" element={<Category />} />
         <Route path="/ordertracking/:orderId" element={<OrderTrackingPage />} />
       
        </Route>
            <Route path="myorder" element={<OrdersPage/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
