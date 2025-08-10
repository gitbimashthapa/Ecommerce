import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, failed
  const [paymentMethod, setPaymentMethod] = useState('khalti');
  const [orderData, setOrderData] = useState(null);
  const [shippingAddress, setShippingAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showShippingForm, setShowShippingForm] = useState(false);

  useEffect(() => {
    loadCartFromStorage();
  }, []);

  const loadCartFromStorage = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCartToStorage = (cartData) => {
    localStorage.setItem('cart', JSON.stringify(cartData));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const updatedCart = cart.map(item =>
      item._id === productId
        ? { ...item, quantity: newQuantity }
        : item
    );
    setCart(updatedCart);
    saveCartToStorage(updatedCart);
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter(item => item._id !== productId);
    setCart(updatedCart);
    saveCartToStorage(updatedCart);
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.productPrice * item.quantity), 0).toFixed(2);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handlePayment = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to place an order');
      navigate('/login');
      return;
    }

    // Show shipping form if not filled
    if (!shippingAddress || !phoneNumber) {
      setShowShippingForm(true);
      return;
    }

    setPaymentStatus('processing');

    try {
      // Prepare order data
      const orderPayload = {
        products: cart.map(item => ({
          productId: item._id,
          quantity: item.quantity,
          price: item.productPrice
        })),
        shippingAddress: shippingAddress,
        phoneNumber: phoneNumber,
        totalAmount: parseFloat(getTotalPrice()) + parseFloat(getTotalPrice()) * 0.1, // Including tax
        paymentMethod: paymentMethod === 'cash' ? 'cod' : 'khalti',
        orderStatus: 'pending'
      };

      console.log('Creating order with payload:', orderPayload);

      // Create order
      const response = await axios.post('http://localhost:3000/api/order/', orderPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Order response:', response.data);

      if (paymentMethod === 'cash') {
        // COD - Order created successfully
        setPaymentStatus('success');
        setOrderData(response.data.order);
        clearCart();
        
        setTimeout(() => {
          setPaymentStatus('idle');
          setOrderData(null);
        }, 5000);
      } else {
        // Khalti payment - redirect to payment URL
        if (response.data.url) {
          window.open(response.data.url, '_blank');
          setPaymentStatus('success');
          setOrderData(response.data.order);
          
          // Simulate payment verification (in real app, this would be handled by Khalti callback)
          setTimeout(async () => {
            try {
              // You would verify payment here with the pidx
              setPaymentStatus('success');
              clearCart();
              
              setTimeout(() => {
                setPaymentStatus('idle');
                setOrderData(null);
              }, 5000);
            } catch (err) {
              console.error('Payment verification failed:', err);
              setPaymentStatus('failed');
              setTimeout(() => setPaymentStatus('idle'), 3000);
            }
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Order creation failed:', error);
      setPaymentStatus('failed');
      
      const errorMessage = error.response?.data?.message || 'Failed to process order';
      alert(errorMessage);
      
      setTimeout(() => {
        setPaymentStatus('idle');
      }, 3000);
    }
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartItemCount={getCartItemCount()} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
          <button
            onClick={() => navigate('/')}
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            ← Continue Shopping
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-16">
            <i className="fas fa-shopping-cart text-6xl text-gray-300 mb-6"></i>
            <h2 className="text-2xl font-bold text-gray-600 mb-4">Your Cart is Empty</h2>
            <p className="text-gray-500 mb-8">Add some products to see them here!</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Cart Items ({getTotalItems()})</h2>
                
                {cart.map((item) => (
                  <div key={item._id} className="flex items-center border-b border-gray-200 pb-6 mb-6 last:border-b-0 last:mb-0">
                    <img
                      src={item.productImageUrl ? `http://localhost:3000/uploads/${item.productImageUrl}` : 'https://via.placeholder.com/100x100?text=No+Image'}
                      alt={item.productName}
                      className="w-24 h-24 object-cover rounded-md mr-6"
                    />
                    
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.productName}</h3>
                      <p className="text-gray-600 mb-2">{item.productDescription}</p>
                      <p className="text-green-600 font-semibold">${item.productPrice}</p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full hover:bg-gray-300 transition duration-200 flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full hover:bg-gray-300 transition duration-200 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                      
                      {/* Subtotal */}
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-800">
                          ${(item.productPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-500 hover:text-red-700 transition duration-200 p-2"
                        title="Remove item"
                      >
                        <i className="fas fa-trash text-lg"></i>
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <button
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-700 font-medium"
                  >
                    Clear All Items
                  </button>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Items: {getTotalItems()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary & Payment */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">${getTotalPrice()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">${(getTotalPrice() * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-green-600">${(parseFloat(getTotalPrice()) + parseFloat(getTotalPrice()) * 0.1).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Shipping Information</h3>
                  {!showShippingForm && shippingAddress && phoneNumber ? (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Address:</p>
                      <p className="font-medium mb-2">{shippingAddress}</p>
                      <p className="text-sm text-gray-600 mb-1">Phone:</p>
                      <p className="font-medium mb-2">{phoneNumber}</p>
                      <button
                        onClick={() => setShowShippingForm(true)}
                        className="text-blue-500 text-sm hover:text-blue-700"
                      >
                        Edit Information
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Shipping Address *
                        </label>
                        <textarea
                          value={shippingAddress}
                          onChange={(e) => setShippingAddress(e.target.value)}
                          placeholder="Enter your complete address"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows="3"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="Enter your phone number"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      {shippingAddress && phoneNumber && (
                        <button
                          onClick={() => setShowShippingForm(false)}
                          className="text-green-500 text-sm hover:text-green-700"
                        >
                          ✓ Information Saved
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="khalti"
                        checked={paymentMethod === 'khalti'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-2"
                      />
                      <i className="fas fa-wallet mr-2 text-purple-500"></i>
                      Khalti Payment
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-2"
                      />
                      <i className="fas fa-money-bill mr-2 text-green-500"></i>
                      Cash on Delivery
                    </label>
                  </div>
                </div>

                {/* Payment Status */}
                {paymentStatus !== 'idle' && (
                  <div className="mb-4">
                    {paymentStatus === 'processing' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500 mr-3"></div>
                          <span className="text-yellow-700">Processing payment...</span>
                        </div>
                      </div>
                    )}
                    
                    {paymentStatus === 'success' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <i className="fas fa-check-circle text-green-500 mr-3"></i>
                          <div>
                            <p className="text-green-700 font-medium">
                              {paymentMethod === 'cash' ? 'Order Placed Successfully!' : 'Payment Successful!'}
                            </p>
                            <p className="text-green-600 text-sm">
                              {orderData && `Order ID: ${orderData._id}`}
                            </p>
                            <p className="text-green-600 text-sm">
                              {paymentMethod === 'cash' 
                                ? 'Your order will be delivered with Cash on Delivery.' 
                                : 'Your payment has been processed.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {paymentStatus === 'failed' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <i className="fas fa-times-circle text-red-500 mr-3"></i>
                          <div>
                            <p className="text-red-700 font-medium">Payment Failed!</p>
                            <p className="text-red-600 text-sm">Please try again.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Payment Button */}
                <button
                  onClick={handlePayment}
                  disabled={paymentStatus === 'processing' || cart.length === 0}
                  className={`w-full py-3 rounded-lg font-medium transition duration-200 ${
                    paymentStatus === 'processing' || cart.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {paymentStatus === 'processing' ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {paymentMethod === 'cash' ? 'Placing Order...' : 'Processing Payment...'}
                    </span>
                  ) : (
                    <>
                      {paymentMethod === 'cash' 
                        ? `Place Order - $${(parseFloat(getTotalPrice()) + parseFloat(getTotalPrice()) * 0.1).toFixed(2)} (COD)`
                        : `Pay with Khalti - $${(parseFloat(getTotalPrice()) + parseFloat(getTotalPrice()) * 0.1).toFixed(2)}`
                      }
                    </>
                  )}
                </button>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    <i className="fas fa-lock mr-1"></i>
                    Secure payment processing
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
