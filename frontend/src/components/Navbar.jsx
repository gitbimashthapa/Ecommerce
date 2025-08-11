import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ cartItemCount = 0 }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  useEffect(() => {
    // Fetch categories for filter
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/category');
        setCategories(response.data.data || []);
      } catch (err) {
        // fail silently
      }
    };
    fetchCategories();
  }, []);

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
            
            <div className="ml-8 flex items-center space-x-8">
              <Link
                to="/"
                className="text-gray-800 font-medium hover:text-red-500 transition-colors duration-300"
              >
               <h1 className="text-2xl font-bold text-gray-800">🛒 Ecommerce</h1>
              </Link>
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
            <div className="flex items-center gap-3 mr-4">
              {/* Modern Search Bar */}
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 rounded-full border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition w-48 bg-gray-50 text-gray-800"
                />
                <span className="absolute left-3 text-gray-400">
                  <i className="fas fa-search"></i>
                </span>
              </div>
              {/* Category Filter Button */}
              <button
                onClick={() => setShowCategoryPopup(true)}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full font-medium border border-gray-300 hover:bg-gray-200 transition"
              >
                {selectedCategory ? `Category: ${selectedCategory}` : "Category"}
              </button>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory("")}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-full text-xs ml-1 border border-gray-300"
                >
                  Clear
                </button>
              )}
      {/* Category Popup Modal */}
      {showCategoryPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-5 min-w-[260px] border border-gray-200">
            <h3 className="text-base font-semibold mb-3 text-gray-700">Select Category</h3>
            <ul className="space-y-1">
              {categories.map(cat => (
                <li key={cat._id}>
                  <button
                    className={`w-full text-left px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-100 ${selectedCategory === cat.categoryName ? "bg-gray-200 font-bold" : ""}`}
                    onClick={() => { setSelectedCategory(cat.categoryName); setShowCategoryPopup(false); }}
                  >
                    {cat.categoryName}
                  </button>
                </li>
              ))}
            </ul>
            <button
              className="mt-5 w-full bg-gray-100 text-gray-700 py-2 rounded-full border border-gray-300"
              onClick={() => setShowCategoryPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
              {/* Wishlist and Cart */}
              <Link to="/wishlist" className="text-gray-800 hover:text-red-500 transition-all duration-300 hover:-translate-y-1">
                <i className="fas fa-heart text-xl"></i>
              </Link>
              <Link to="/cart" className="text-gray-800 hover:text-red-500 transition-all duration-300 hover:-translate-y-1 relative">
                <i className="fas fa-shopping-cart text-xl"></i>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </div>
  {/* ...existing code... */}
            
            {isLoggedIn ? (
              <>
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