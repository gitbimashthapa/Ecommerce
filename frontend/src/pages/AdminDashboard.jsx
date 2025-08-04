import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const [sidebarActive, setSidebarActive] = useState('dashboard');
  const [stats, setStats] = useState({
    revenue: 0,
    users: 0,
    orders: 0,
    products: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user info from localStorage
    const name = localStorage.getItem('userName') || 'Admin';
    const role = localStorage.getItem('userRole') || 'admin';
    setUserName(name);
    setUserRole(role);

    // Fetch dashboard data
    fetchDashboardData();

    // Initialize Chart.js when component mounts
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js';
    script.onload = () => {
      initializeChart();
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all data in parallel
      const [usersRes, productsRes, ordersRes] = await Promise.all([
        axios.get('http://localhost:3000/api/users/all', { headers }),
        axios.get('http://localhost:3000/api/products/all'),
        axios.get('http://localhost:3000/api/orders/all', { headers })
      ]);

      const users = usersRes.data.data || [];
      const products = productsRes.data.data || [];
      const orders = ordersRes.data.data || [];

      // Calculate statistics
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      setStats({
        revenue: totalRevenue,
        users: users.length,
        orders: orders.length,
        products: products.length
      });

      // Set recent orders (last 5)
      setRecentOrders(orders.slice(-5).reverse());
      
      // Set top products (first 4 products)
      setTopProducts(products.slice(0, 4));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set fallback data
      setStats({
        revenue: 0,
        users: 0,
        orders: 0,
        products: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeChart = () => {
    const ctx = document.getElementById('revenueChart');
    if (ctx && window.Chart) {
      new window.Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Revenue',
            data: [25000, 32000, 28000, 35000, 42000, 48000],
            borderColor: '#1e40af',
            backgroundColor: 'rgba(30, 64, 175, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#1e40af',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#6b7280'
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: '#f3f4f6'
              },
              ticks: {
                color: '#6b7280',
                callback: function(value) {
                  return '$' + value.toLocaleString();
                }
              }
            }
          },
          elements: {
            point: {
              hoverRadius: 8
            }
          }
        }
      });
    }
  };

  const sidebarItems = [
    { id: 'dashboard', icon: 'fas fa-home', label: 'Dashboard', active: true },
    { id: 'users', icon: 'fas fa-users', label: 'Users' },
    { id: 'analytics', icon: 'fas fa-chart-bar', label: 'Analytics' },
    { id: 'orders', icon: 'fas fa-shopping-cart', label: 'Orders' },
    { id: 'products', icon: 'fas fa-box', label: 'Products' },
    { id: 'settings', icon: 'fas fa-cog', label: 'Settings' }
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-slate-800 shadow-xl z-50">
        <div className="flex items-center justify-center h-16 bg-blue-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <i className="fas fa-cube text-blue-800 text-lg"></i>
            </div>
            <span className="text-white text-xl font-bold">Exommerce</span>
          </div>
        </div>
        
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSidebarActive(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors group ${
                  sidebarActive === item.id 
                    ? 'bg-gray-700 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <i className={`${item.icon} mr-3 ${
                  sidebarActive === item.id ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'
                }`}></i>
                {item.label}
              </button>
            ))}
          </div>
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <img src="https://cdn-icons-png.flaticon.com/512/17003/17003310.png" alt="Admin" className="w-10 h-10 rounded-full" />
              <div>
                <p className="text-white text-sm font-medium">John Admin</p>
                <p className="text-gray-400 text-xs">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-600 text-sm mt-1">Welcome back {userName}, here's what's happening today</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div className="relative">
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                    <i className="fas fa-bell text-xl"></i>
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Revenue Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">${stats.revenue.toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-green-600 text-sm font-medium flex items-center">
                      <i className="fas fa-arrow-up mr-1"></i>
                      12%
                    </span>
                    <span className="text-gray-500 text-sm ml-2">vs last month</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-dollar-sign text-blue-600 text-xl"></i>
                </div>
              </div>
            </div>

            {/* Users Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.users.toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-green-600 text-sm font-medium flex items-center">
                      <i className="fas fa-arrow-up mr-1"></i>
                      8%
                    </span>
                    <span className="text-gray-500 text-sm ml-2">vs last month</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-users text-green-600 text-xl"></i>
                </div>
              </div>
            </div>

            {/* Orders Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.orders.toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-green-600 text-sm font-medium flex items-center">
                      <i className="fas fa-arrow-up mr-1"></i>
                      15%
                    </span>
                    <span className="text-gray-500 text-sm ml-2">vs last month</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-shopping-cart text-orange-600 text-xl"></i>
                </div>
              </div>
            </div>

            {/* Products Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Products</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.products.toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-green-600 text-sm font-medium flex items-center">
                      <i className="fas fa-arrow-up mr-1"></i>
                      5%
                    </span>
                    <span className="text-gray-500 text-sm ml-2">vs last month</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-box text-purple-600 text-xl"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Revenue Analytics</h3>
                  <p className="text-gray-600 text-sm">Monthly revenue overview</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md">6M</button>
                  <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md">1Y</button>
                </div>
              </div>
              <div className="h-80">
                <canvas id="revenueChart"></canvas>
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View All</button>
              </div>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <img src={product.image} alt="Product" className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{product.price}</p>
                      <p className="text-sm text-green-600">{product.growth}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                  <p className="text-gray-600 text-sm">Latest customer orders and transactions</p>
                </div>
                <div className="flex space-x-3">
                  <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <i className="fas fa-download mr-2"></i>Export
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <i className="fas fa-plus mr-2"></i>Add Order
                  </button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{order.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img src={order.customer.avatar} alt="Customer" className="w-8 h-8 rounded-full mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{order.customer.name}</div>
                            <div className="text-sm text-gray-500">{order.customer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.product}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{order.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${order.statusColor}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <i className="fas fa-eye"></i>
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">New user registered</p>
                    <p className="text-xs text-gray-500">sarah.johnson@email.com • 2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Order completed</p>
                    <p className="text-xs text-gray-500">Order #15847 - $299.99 • 5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Product updated</p>
                    <p className="text-xs text-gray-500">iPhone 15 Pro - Stock: 25 • 8 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Payment received</p>
                    <p className="text-xs text-gray-500">$1,245.00 from client • 12 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-900">Server Status</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-900">Database</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-900">API Status</span>
                  </div>
                  <span className="text-sm text-yellow-600 font-medium">Warning</span>
                </div>
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Server Load</span>
                    <span>68%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '68%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
