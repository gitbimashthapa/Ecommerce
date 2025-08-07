import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ cartItemCount = 0 }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("userRole");
      setIsLoggedIn(!!token);
      setUserRole(role || '');
    };

    checkAuthStatus();
    window.addEventListener('storage', checkAuthStatus);
    window.addEventListener('authChange', checkAuthStatus);

    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      window.removeEventListener('authChange', checkAuthStatus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    window.dispatchEvent(new Event('authChange'));
    alert('Logged out successfully!');
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-gray-800">🛒 Exommerce</h1>
            </Link>
            
            <div className="ml-8 flex items-center space-x-8">
              <Link
                to="/"
                className="text-gray-800 font-medium hover:text-red-500 transition-colors duration-300"
              >
                Home
              </Link>
              <a href="#" className="text-gray-800 font-medium hover:text-red-500 transition-colors duration-300">Men</a>
              <a href="#" className="text-gray-800 font-medium hover:text-red-500 transition-colors duration-300">Women</a>
              <a href="#" className="text-gray-800 font-medium hover:text-red-500 transition-colors duration-300">Shop</a>
              <a href="#" className="text-gray-800 font-medium hover:text-red-500 transition-colors duration-300">Sale</a>
              {isLoggedIn && (userRole === 'admin' || userRole === 'superAdmin') && (
                <Link
                  to="/admin"
                  className="text-gray-800 font-medium hover:text-red-500 transition-colors duration-300"
                >
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4 mr-4">
              <a href="#" className="text-gray-800 hover:text-red-500 transition-all duration-300 hover:-translate-y-1">
                <i className="fas fa-search text-xl"></i>
              </a>
              <a href="#" className="text-gray-800 hover:text-red-500 transition-all duration-300 hover:-translate-y-1 relative">
                <i className="fas fa-shopping-cart text-xl"></i>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </a>
            </div>
            
            {isLoggedIn ? (
              <>
                <span className="text-gray-600 text-sm">Welcome back!</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600 transition duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-800 hover:text-red-500 px-3 py-2 rounded-md text-sm transition duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600 transition duration-200"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;