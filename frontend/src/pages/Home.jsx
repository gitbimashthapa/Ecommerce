import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { toast } from 'react-hot-toast';

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  // Diagnostic log for homepage product data
  useEffect(() => {
    if (products && products.length > 0) {
      console.log('Homepage products:', products.map(p => ({
        name: p.productName,
        imageUrl: p.productImageUrl
      })));
    }
  }, [products]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    fetchProducts();
    fetchCategories();
    loadCartFromStorage();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/product/getAll');
      setProducts(response.data.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/category');
      setCategories(response.data.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const loadCartFromStorage = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCartToStorage = (cartData) => {
    localStorage.setItem('cart', JSON.stringify(cartData));
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item._id === product._id);
    let updatedCart;

    if (existingItem) {
      updatedCart = cart.map(item =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [...cart, { ...product, quantity: 1 }];
    }

    setCart(updatedCart);
    saveCartToStorage(updatedCart);
    // Show toast notification
    const itemName = product.productName.length > 20 
      ? product.productName.substring(0, 20) + '...' 
      : product.productName;
    toast.success(`${itemName} added to cart successfully!`);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const addToWishlist = async (productId) => {
    if (!isLoggedIn) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:3000/api/wishlist/',
        { productId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      toast.success('Product added to wishlist successfully!');
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      const errorMessage = err.response?.data?.message || 'Failed to add product to wishlist';
      toast.error(errorMessage);
    }
  };

  // Filter products by search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      {/* Integrated Navbar Component */}
  <Navbar cartItemCount={getCartItemCount()} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />

  {/* ...existing code... */}

  {/* ...existing code... */}
      <div className="offer-banner bg-gradient-to-r from-red-400 to-red-500 text-white text-center py-3 font-medium relative overflow-hidden">
        <style jsx>{`
          .offer-banner::before {
            content: "";
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            animation: shine 3s infinite;
          }
          @keyframes shine {
            100% { left: 100%; }
          }
          @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeInUp {
            animation: fadeInUp 0.8s forwards;
          }
          .coupon-box::before {
            content: "10% OFF";
            position: absolute;
            top: -10px;
            right: -10px;
            background-color: #ff6b6b;
            color: white;
            padding: 5px 10px;
            border-radius: 50px;
            font-size: 0.8rem;
            transform: rotate(15deg);
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
        `}</style>
        Special Offer: Free Shipping on all orders above $100
      </div>
      
      {/* Hero Banner */}
      <div className="relative h-96 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
             alt="Fashion Sale" 
             className="w-full h-full object-cover object-center"
             loading="lazy" />
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="text-center text-white px-4 animate-fadeInUp">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">SUMMER SALE</h1>
            <p className="text-xl mb-6">Up to 50% off on selected items</p>
            <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-medium transition-colors duration-300">
              SHOP NOW
            </button>
          </div>
        </div>
      </div>
      
      {/* Coupon Section */}
      <div className="coupon-section bg-white p-10 text-center mx-5 my-8 rounded-xl shadow-lg animate-fadeInUp">
        <h2 className="text-3xl font-bold mb-4">10% OFF Discount</h2>
        <div className="coupon-box bg-gradient-to-br from-gray-50 to-gray-200 p-6 rounded-lg inline-block my-5 relative overflow-hidden transition-transform duration-300 hover:-translate-y-1 shadow-md">
          <p className="text-lg font-medium">Use code: <span className="font-bold text-red-500">SALE10</span></p>
          <p className="text-gray-600 mt-2">Valid until December 31, 2025</p>
        </div>
        
        <p className="text-lg mb-6">Subscribe to get 10% OFF on all purchases</p>
        
        <div className="email-subscribe flex justify-center mt-5">
          <input type="email" placeholder="Enter your email" className="px-5 py-3 border border-gray-300 rounded-l-full w-80 focus:outline-none focus:border-red-500 transition-colors duration-300" />
          <button className="bg-red-500 text-white px-6 py-3 rounded-r-full font-medium hover:bg-red-600 transition-colors duration-300">
            EMAIL ME
          </button>
        </div>
      </div>
      
      {/* Featured Products Section */}
      <div className="featured-section px-5 py-16 text-center bg-gradient-to-br from-gray-50 via-white to-purple-100">
        <div className="section-header flex flex-col md:flex-row justify-between items-center mb-10 animate-fadeInUp">
          <h2 className="text-4xl font-extrabold text-purple-700 mb-4 md:mb-0 tracking-tight">Featured Products</h2>
          <span className="text-lg text-purple-500 font-semibold bg-purple-100 px-4 py-2 rounded-full shadow">{products.length} Products Available</span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-purple-500 text-lg">{error}</p>
            <button
              onClick={fetchProducts}
              className="mt-4 bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No products found for your search/filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden flex flex-col items-center mb-12 animate-fadeInUp transform hover:scale-105 border border-gray-100"
                style={{ minHeight: '420px' }}
              >
                <div className="w-full flex items-center justify-center bg-gradient-to-tr from-purple-100 to-blue-50 p-8" style={{ minHeight: '320px' }}>
                  <a href={`/product/${product._id}`} style={{ display: 'block', width: '100%' }}>
                    <img
                      src={product.productImageUrl && product.productImageUrl !== 'undefined' && product.productImageUrl !== ''
                        ? `http://localhost:3000/${product.productImageUrl}`
                        : 'https://via.placeholder.com/500x500?text=No+Image'}
                      alt={product.productName}
                      className="w-80 h-80 object-cover rounded-2xl shadow-lg border-4 border-purple-100 hover:scale-105 transition-transform duration-200"
                      style={{ maxWidth: '100%', maxHeight: '320px' }}
                      onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/500x500?text=No+Image'; }}
                    />
                  </a>
                </div>
                <div className="w-full flex flex-col justify-between px-8 pb-8 pt-4">
                  <h3 className="text-2xl font-bold text-purple-700 mb-2 tracking-tight text-left">{product.productName}</h3>
                  <p className="text-gray-600 text-base mb-4 italic line-clamp-2 text-left">{product.productDescription}</p>
                  <div className="flex flex-wrap gap-3 mb-4 items-center justify-center">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-semibold text-xs">Category: {product.category}</span>
                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full font-semibold text-xs">Stock: {product.productTotalStockQuantity}</span>
                    <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full font-semibold text-xs flex items-center">Rating: {product.totalRating || 'N/A'} / 5</span>
                  </div>
                  <div className="flex items-center justify-center mb-6 gap-6">
                    <span className="text-2xl font-bold text-purple-600 text-center flex items-center justify-center">${product.productPrice}</span>
                    <button
                      className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-5 py-2 rounded-xl font-bold shadow-lg hover:from-purple-600 hover:to-blue-600 transition flex items-center justify-center"
                      onClick={() => addToCart(product)}
                      title="Add to Cart"
                    >
                      <i className="fas fa-shopping-cart text-xl"></i>
                    </button>
                    <button
                      className="bg-white border-2 border-purple-400 text-purple-500 px-5 py-2 rounded-xl font-bold shadow hover:bg-purple-50 transition flex items-center justify-center"
                      title="Add to Wishlist"
                      onClick={() => addToWishlist(product._id)}
                    >
                      <i className="fas fa-heart text-xl"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Newsletter Section */}
      <div className="newsletter bg-gray-100 py-16 px-5">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-lg mb-6">Subscribe to get special offers, new arrivals and exclusive deals</p>
          <div className="email-subscribe flex justify-center">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="px-5 py-3 border border-gray-300 rounded-l-full w-80 focus:outline-none focus:border-red-500 transition-colors duration-300" 
            />
            <button className="bg-red-500 text-white px-6 py-3 rounded-r-full font-medium hover:bg-red-600 transition-colors duration-300">
              SUBSCRIBE
            </button>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-5">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">🛒 Exommerce</h3>
            <p className="text-gray-300">Your one-stop destination for quality products at affordable prices.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Shipping Info</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-gray-300">
              {categories.slice(0, 4).map((category) => (
                <li key={category._id}>
                  <a href="#" className="hover:text-white transition-colors">{category.categoryName}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <i className="fab fa-facebook-f text-xl"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <i className="fab fa-twitter text-xl"></i>  
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <i className="fab fa-linkedin-in text-xl"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2025 Exommerce. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

export default Home;