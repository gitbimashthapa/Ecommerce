import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { toast } from 'react-hot-toast';

const ProductPage = () => {
  // Cart logic (copied from Home.jsx for consistency)
  const [cart, setCart] = useState([]);
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

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
    const itemName = product.productName.length > 20 
      ? product.productName.substring(0, 20) + '...' 
      : product.productName;
    toast.success(`${itemName} added to cart successfully!`);
  };
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/product/singleProduct/${id}`);
        setProduct(response.data.data);
      } catch (err) {
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);


  if (loading) return <div className="flex items-center justify-center min-h-[60vh] bg-gradient-to-br from-blue-50 to-purple-100 animate-pulse">Loading product...</div>;
  if (error) return <div className="flex items-center justify-center min-h-[60vh] text-purple-600 font-bold text-xl">{error}</div>;
  if (!product) return <div className="flex items-center justify-center min-h-[60vh] text-gray-500">Product not found.</div>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 py-16 px-4">
        <div className="max-w-3xl mx-auto rounded-3xl shadow-2xl bg-white p-0 overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/2 flex items-center justify-center bg-gradient-to-tr from-purple-200 to-blue-100 p-8">
            <img
              src={product.productImageUrl && product.productImageUrl !== 'undefined' && product.productImageUrl !== ''
                ? `http://localhost:3000/${product.productImageUrl}`
                : 'https://via.placeholder.com/350x350?text=No+Image'}
              alt={product.productName}
              className="w-72 h-72 object-cover rounded-2xl shadow-lg border-4 border-purple-200"
              onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/350x350?text=No+Image'; }}
            />
          </div>
          <div className="md:w-1/2 flex flex-col justify-between p-8">
            <div>
              <h2 className="text-4xl font-extrabold text-purple-700 mb-3 tracking-tight">{product.productName}</h2>
              <p className="text-gray-700 text-lg mb-6 italic">{product.productDescription}</p>
              <div className="flex flex-wrap gap-4 mb-6">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold text-sm">Category: {product.category}</span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold text-sm">Stock: {product.productTotalStockQuantity}</span>
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold text-sm">Rating: {product.totalRating || 'N/A'} / 5</span>
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-8">${product.productPrice}</div>
            </div>
            <div className="flex gap-4">
              <button
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-xl font-bold shadow-lg hover:from-purple-600 hover:to-blue-600 transition"
                onClick={() => addToCart(product)}
              >
                Add to Cart
              </button>
              <button className="flex-1 bg-white border-2 border-purple-400 text-purple-700 py-3 rounded-xl font-bold shadow hover:bg-purple-50 transition">Buy Now</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductPage;
