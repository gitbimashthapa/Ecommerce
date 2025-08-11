import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const MyOrder = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3000/api/order/myOrders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(response.data.data || []);
      } catch (err) {
        setError("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = filter
    ? orders.filter((o) => o.orderStatus?.toLowerCase() === filter)
    : orders;

  return (
    <>
      <Navbar />
      <div className="pt-20 px-4 md:px-8 max-w-screen-xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-900 mb-8 mt-4">My Orders</h2>
        <div className="flex gap-2 mb-6">
          <div className="relative">
            <select
              className="appearance-none h-full rounded-full border border-gray-400 bg-white text-gray-700 py-2 px-4 pr-8 leading-tight focus:outline-none focus:border-blue-500 shadow"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              <i className="fas fa-filter"></i>
            </span>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No orders found.</div>
        ) : (
          <div className="overflow-x-auto bg-white shadow-xl rounded-xl p-4">
            <table className="min-w-full text-sm text-gray-800">
              <thead className="bg-gray-100 rounded-t-lg">
                <tr className="text-left">
                  <th className="px-6 py-3 font-semibold tracking-wide">Items</th>
                  <th className="px-6 py-3 font-semibold tracking-wide">Total Amt</th>
                  <th className="px-6 py-3 font-semibold tracking-wide">Order Status</th>
                  <th className="px-6 py-3 font-semibold tracking-wide">Ordered At</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const orderedAt = new Date(order.createdAt).toLocaleString();
                  return (
                    <tr key={order._id} className="border-b hover:bg-gray-30 transition duration-200">
                      <td className="px-6 py-4">
                        <div className="space-y-3">
                          {order.products.map((item, index) => (
                            <div key={index} className="flex items-center gap-4">
                              <img
                                src={`http://localhost:3000/${item.productId?.productImageUrl}`}
                                alt={item.productId?.productName || 'Product'}
                                className="w-14 h-20 object-cover rounded-lg shadow-sm"
                              />
                              <div>
                                <p className="text-sm font-medium">{item.productId?.productName}</p>
                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">Rs. {order.totalAmount}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            order.orderStatus?.toLowerCase() === "delivered"
                              ? "bg-green-100 text-green-700"
                              : order.orderStatus?.toLowerCase() === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{orderedAt}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default MyOrder;
