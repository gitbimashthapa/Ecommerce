import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import CartPage from './pages/CartPage';
import Wishlist from './pages/Wishlist';

import ProductPage from './pages/ProductPage';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} toastOptions={{ duration: 2000 }} />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path='/admin' element={<AdminDashboard />} />
        <Route path='/cart' element={<CartPage />} />
        <Route path='/wishlist' element={<Wishlist />} />
        <Route path='/product/:id' element={<ProductPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;