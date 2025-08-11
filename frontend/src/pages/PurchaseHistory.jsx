import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const PurchaseHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [productsMap, setProductsMap] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/order/myOrders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const ordersData = response.data.data || [];
        setOrders(ordersData);

        // Fetch product details for each productId in all orders
        const productIds = Array.from(new Set(ordersData.flatMap(order => order.products.map(p => p.productId))));
        const productsMapTemp = {};
        await Promise.all(productIds.map(async (id) => {
          try {
            const res = await axios.get(`http://localhost:3000/api/product/singleProduct/${id}`);
            productsMapTemp[id] = res.data.data;
          } catch (err) {
            productsMapTemp[id] = null;
          }
        }));
        setProductsMap(productsMapTemp);
      } catch (err) {
        setError('Failed to load purchase history');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">My Purchase History</h2>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 font-semibold">{error}</div>
          ) : orders.length === 0 ? (
            <div className="text-center text-gray-500">No purchases found.</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-100">
                  <th className="py-3 px-4 text-left">Order ID</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Total</th>
                  <th className="py-3 px-4 text-left">Items</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} className="border-b hover:bg-blue-50 transition-colors">
                    <td className="py-2 px-4 font-mono text-xs">{order._id}</td>
                    <td className="py-2 px-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{order.status}</span>
                    </td>
                    <td className="py-2 px-4 font-bold text-blue-700">${order.totalAmount}</td>
                    <td className="py-2 px-4">
                      {order.products && order.products.length > 0 ? (
                        <ul className="list-disc ml-4 text-sm">
                          {order.products.map(item => (
                            <li key={item.productId}>
                              {productsMap[item.productId]?.productName || 'Product'} x {item.quantity}
                            </li>
                          ))}
                        </ul>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default PurchaseHistory;
