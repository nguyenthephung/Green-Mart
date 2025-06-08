import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Category from './pages/Category'
// import các page khác...

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Category  />} />
          {/* <Route path="product/:id" element={<ProductDetail />} /> */}
          {/* ...other routes */}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App