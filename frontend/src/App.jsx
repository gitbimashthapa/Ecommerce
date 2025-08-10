import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import CartPage from './pages/CartPage';
import Wishlist from './pages/Wishlist';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path='/admin' element={<AdminDashboard />} />
        <Route path='/cart' element={<CartPage />} />
        <Route path='/wishlist' element={<Wishlist />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;