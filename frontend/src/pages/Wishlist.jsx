import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchWishlist();
    loadCartFromStorage();
  }, []);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view your wishlist');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:3000/api/wishlist/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Backend returns wishlist with products array
      const wishlistData = response.data.data;
      if (wishlistData && wishlistData.products) {
        // Transform the data to match expected format
        const transformedItems = wishlistData.products.map(product => ({
          _id: `${wishlistData.userId}_${product._id}`,
          productId: product,
          userId: wishlistData.userId
        }));
        setWishlistItems(transformedItems);
      } else {
        setWishlistItems([]);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError('Failed to load wishlist items');
    } finally {
      setLoading(false);
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

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const removeFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch('http://localhost:3000/api/wishlist/', 
        { productId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setWishlistItems(wishlistItems.filter(item => item.productId._id !== productId));
      alert('Product removed from wishlist successfully!');
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      alert('Failed to remove product from wishlist');
    }
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
    
    const itemName = product.productName.length > 20 
      ? product.productName.substring(0, 20) + '...' 
      : product.productName;
    alert(`${itemName} added to cart successfully!`);
  };

  const moveToCart = (wishlistItem) => {
    addToCart(wishlistItem.productId);
    removeFromWishlist(wishlistItem.productId._id);
  };

  if (loading) {
    return (
      <>
        <Navbar cartItemCount={getCartItemCount()} />
        <div className="min-h-screen bg-gray-50 flex justify-center items-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar cartItemCount={getCartItemCount()} />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
                <p className="text-gray-600 mt-2">
                  {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
                </p>
              </div>
              <Link
                to="/"
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300"
              >
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="text-red-500 mb-4">
                <i className="fas fa-exclamation-triangle text-4xl"></i>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Oops!</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              {error.includes('login') && (
                <Link
                  to="/login"
                  className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300"
                >
                  Login Now
                </Link>
              )}
            </div>
          )}

          {/* Empty State */}
          {!error && wishlistItems.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-gray-400 mb-6">
                <i className="fas fa-heart text-6xl"></i>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your wishlist is empty</h2>
              <p className="text-gray-600 mb-8">Save items you love to your wishlist and shop them later!</p>
              <Link
                to="/"
                className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 transition-colors duration-300 font-medium"
              >
                Start Shopping
              </Link>
            </div>
          )}

          {/* Wishlist Items */}
          {!error && wishlistItems.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-200">
                {wishlistItems.map((item) => (
                  <div key={item._id} className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={
                            item.productId.productImageUrl 
                              ? `http://localhost:3000/uploads/${item.productId.productImageUrl}` 
                              : 'https://via.placeholder.com/150x150?text=No+Image'
                          }
                          alt={item.productId.productName}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {item.productId.productName}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {item.productId.productDescription}
                        </p>
                        <div className="flex items-center space-x-4">
                          <span className="text-2xl font-bold text-red-500">
                            ${item.productId.productPrice}
                          </span>
                          <span className="text-sm text-gray-500">
                            Category: {item.productId.category}
                          </span>
                          {item.productId.totalRating && (
                            <div className="flex items-center">
                              <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <i
                                    key={i}
                                    className={`fas fa-star text-xs ${
                                      i < Math.floor(item.productId.totalRating) ? '' : 'text-gray-300'
                                    }`}
                                  ></i>
                                ))}
                              </div>
                              <span className="text-gray-500 text-xs ml-1">
                                ({item.productId.totalRating})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => moveToCart(item)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300 text-sm font-medium"
                        >
                          <i className="fas fa-shopping-cart mr-2"></i>
                          Add to Cart
                        </button>
                        <button
                          onClick={() => removeFromWishlist(item.productId._id)}
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-300 text-sm font-medium"
                        >
                          <i className="fas fa-trash mr-2"></i>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {!error && wishlistItems.length > 0 && (
            <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => {
                    wishlistItems.forEach(item => addToCart(item.productId));
                    alert('All items added to cart!');
                  }}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors duration-300 font-medium"
                >
                  <i className="fas fa-shopping-cart mr-2"></i>
                  Add All to Cart
                </button>
                <button
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
                      try {
                        const token = localStorage.getItem('token');
                        await Promise.all(
                          wishlistItems.map(item =>
                            axios.patch('http://localhost:3000/api/wishlist/', 
                              { productId: item.productId._id },
                              {
                                headers: { Authorization: `Bearer ${token}` }
                              }
                            )
                          )
                        );
                        setWishlistItems([]);
                        alert('Wishlist cleared successfully!');
                      } catch (err) {
                        alert('Failed to clear wishlist');
                      }
                    }
                  }}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-300 font-medium"
                >
                  <i className="fas fa-trash mr-2"></i>
                  Clear Wishlist
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Wishlist;
