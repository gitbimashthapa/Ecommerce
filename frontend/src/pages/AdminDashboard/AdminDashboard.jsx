import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ListProduct from './product/list/ListProduct';
import AddProduct from './product/add/AddProduct';
import ListCategory from './category/list/ListCategory';
import AddCategory from './category/add/AddCategory';
import ListOrder from './order/list/ListOrder';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const [sidebarActive, setSidebarActive] = useState('dashboard');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);

  // Admin-only CRUD States
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'edit', 'delete'
  const [modalData, setModalData] = useState({});
  const [formData, setFormData] = useState({});

  useEffect(() => {
    // Get user info from localStorage
    const name = localStorage.getItem('userName') || 'Admin';
    const role = localStorage.getItem('userRole') || 'admin';
    setUserName(name);  
    setUserRole(role);

    // Verify admin role
    if (role !== 'admin') {
      toast.error('Access denied. Admin privileges required!', { duration: 2000 });
      window.location.href = '/';
      return;
    }

    // Fetch admin dashboard data
    fetchAdminDashboardData();
  }, []);

  // Fetch admin-specific dashboard data
  const fetchAdminDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      console.log('Fetching admin dashboard data...');

      // Admin-only API calls
      const requests = [
        axios.get('http://localhost:3000/api/getAll', { headers }).catch(err => {
          console.error('Users fetch error:', err);
          return { data: { data: [] } };
        }),
        axios.get('http://localhost:3000/api/product/getAll').catch(err => {
          console.error('Products fetch error:', err);
          return { data: { data: [] } };
        }),
        axios.get('http://localhost:3000/api/order', { headers }).catch(err => {
          console.error('Orders fetch error:', err);
          return { data: { data: [] } };
        }),
        axios.get('http://localhost:3000/api/category').catch(err => {
          console.error('Categories fetch error:', err);
          return { data: { data: [] } };
        })
      ];

      const [usersRes, productsRes, ordersRes, categoriesRes] = await Promise.all(requests);

      const users = usersRes.data.data || [];
      const products = productsRes.data.data || [];
      const orders = ordersRes.data.data || [];

      console.log('Admin data fetched:', {
        users: users.length,
        products: products.length,
        orders: orders.length
      });

      // Set admin data
      setUsers(users);

      // Calculate admin statistics
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      setStats({
        totalRevenue: totalRevenue,
        totalUsers: users.length,
        totalOrders: orders.length,
        totalProducts: products.length
      });

      // Set recent orders for admin review
      setRecentOrders(orders.slice(-5).reverse());

    } catch (error) {
  console.error('Error fetching admin dashboard data:', error);
  toast.error('Failed to load admin dashboard data. Please check your admin privileges.', { duration: 2000 });
    } finally {
      setLoading(false);
    }
  };

  // Admin-only user management operations
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/getAll', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.data || []);
    } catch (error) {
  console.error('Error fetching users:', error);
  toast.error('Failed to fetch users', { duration: 2000 });
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/delete/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
      toast.success('User deleted successfully', { duration: 2000 });
    } catch (error) {  
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user', { duration: 2000 });
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:3000/api/updateUser/${userId}`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
      setShowModal(false);
      toast.success('User updated successfully', { duration: 2000 });
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user', { duration: 2000 });
    }
  };

  // Modal handlers for user management
  const handleEditUser = (user) => {
    setModalType('edit');
    setModalData(user);
    setFormData(user);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (modalType === 'edit') {
      await updateUser(modalData._id, formData);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const adminSidebarItems = [
    { id: 'dashboard', icon: 'fas fa-home', label: 'Dashboard' },
    { id: 'users', icon: 'fas fa-users', label: 'User Management' },
    { id: 'products', icon: 'fas fa-box', label: 'Products' },
    { id: 'add-product', icon: 'fas fa-plus', label: 'Add Product' },
    { id: 'categories', icon: 'fas fa-tags', label: 'Categories' },
    { id: 'add-category', icon: 'fas fa-plus', label: 'Add Category' },
    { id: 'orders', icon: 'fas fa-shopping-cart', label: 'Orders' },
    { id: 'database', icon: 'fas fa-database', label: 'Database Status' }
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

  // Render admin-specific sections
  const renderContent = () => {
    switch (sidebarActive) {
      case 'users':
        return renderUsersSection();
      case 'categories':
        return <ListCategory />;
      case 'add-category':
        return <AddCategory />;
      case 'orders':
        return <ListOrder />;
      case 'products':
        return <ListProduct />;
      case 'add-product':
        return <AddProduct />;
      case 'database':
        return renderDatabaseSection();
      default:
        return renderAdminDashboard();
    }
  };

  // Admin User Management Section
  const renderUsersSection = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage all users in your system (Admin only)</p>
        </div>
        <button
          onClick={() => fetchUsers()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <i className="fas fa-sync-alt mr-2"></i>Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Users ({users.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                        <i className="fas fa-user text-gray-600"></i>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit User"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        onClick={() => deleteUser(user._id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete User"
                      >
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
    </div>
  );

  // Admin Main Dashboard Section
  const renderAdminDashboard = () => (
    <>
      {/* Admin Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Revenue Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">${stats.totalRevenue.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <span className="text-green-600 text-sm font-medium flex items-center">
                  <i className="fas fa-arrow-up mr-1"></i>
                  Admin View
                </span>
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
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <span className="text-blue-600 text-sm font-medium">
                  User Management
                </span>
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
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <span className="text-orange-600 text-sm font-medium">
                  Order Management
                </span>
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
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProducts.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <span className="text-purple-600 text-sm font-medium">
                  Product Management
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-box text-purple-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Orders for Admin Review */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              <p className="text-gray-600 text-sm">Orders requiring admin attention</p>
            </div>
            <button 
              onClick={() => setSidebarActive('orders')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <i className="fas fa-eye mr-2"></i>Manage All
            </button>
          </div>
          <div className="space-y-4">
            {recentOrders.slice(0, 4).map((order, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    #{order._id?.slice(-6).toUpperCase() || `ORD${index + 1}`}
                  </p>
                  <p className="text-xs text-gray-500">{order.userId?.username || 'Customer'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">${order.totalAmount || 0}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus || 'pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSidebarActive('add-product')}
              className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
            >
              <i className="fas fa-plus text-blue-600 text-2xl mb-2"></i>
              <p className="text-sm font-medium text-gray-900">Add Product</p>
            </button>
            <button
              onClick={() => setSidebarActive('add-category')}
              className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center"
            >
              <i className="fas fa-tags text-green-600 text-2xl mb-2"></i>
              <p className="text-sm font-medium text-gray-900">Add Category</p>
            </button>
            <button
              onClick={() => setSidebarActive('users')}
              className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center"
            >
              <i className="fas fa-users text-purple-600 text-2xl mb-2"></i>
              <p className="text-sm font-medium text-gray-900">Manage Users</p>
            </button>
            <button
              onClick={() => setSidebarActive('database')}
              className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-center"
            >
              <i className="fas fa-database text-orange-600 text-2xl mb-2"></i>
              <p className="text-sm font-medium text-gray-900">DB Status</p>
            </button>
          </div>
        </div>
      </div>
    </>
  );

  // Database Status Section - simplified for admin
  const renderDatabaseSection = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Database Status</h2>
          <p className="text-gray-600">MongoDB connection and API status (Admin only)</p>
        </div>
        <button
          onClick={() => fetchAdminDashboardData()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <i className="fas fa-sync-alt mr-2"></i>Test Connection
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Server Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Backend Server</h3>
              <p className="text-sm mt-1 text-green-600">
                <i className="fas fa-check-circle mr-2"></i>
                Connected
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-server text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>

        {/* Users Collection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Users Collection</h3>
              <p className="text-sm mt-1 text-green-600">
                <i className="fas fa-check-circle mr-2"></i>
                {stats.totalUsers} users
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-users text-green-600 text-xl"></i>
            </div>
          </div>
        </div>

        {/* Orders Collection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Orders Collection</h3>
              <p className="text-sm mt-1 text-green-600">
                <i className="fas fa-check-circle mr-2"></i>
                {stats.totalOrders} orders
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-shopping-cart text-orange-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Connection Information</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Backend URL:</span>
            <span className="font-mono text-sm">http://localhost:3000</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Database:</span>
            <span className="font-mono text-sm">MongoDB Atlas</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Authentication:</span>
            <span className="font-mono text-sm">JWT Bearer Token</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Admin User:</span>
            <span className="font-mono text-sm">{userName} ({userRole})</span>
          </div>
        </div>
      </div>
    </div>
  );

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
            {adminSidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSidebarActive(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors group ${
                  sidebarActive === item.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <i className={`${item.icon} mr-3 ${
                  sidebarActive === item.id ? 'text-white' : 'text-gray-400 group-hover:text-white'
                }`}></i>
                {item.label}
              </button>
            ))}
          </div>
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="https://cdn-icons-png.flaticon.com/512/17003/17003310.png" alt="Admin" className="w-10 h-10 rounded-full" />
              <div>
                <p className="text-white text-sm font-medium">{userName}</p>
                <p className="text-gray-400 text-xs">{userRole}</p>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
                localStorage.removeItem('userName');
                window.dispatchEvent(new Event('authChange'));
                toast.success('Logged out successfully!', { duration: 2000 });
                window.location.href = '/';
              }}
              className="ml-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs hover:bg-red-600 transition duration-200 flex items-center"
              style={{ minWidth: 'auto', height: '28px' }}
              title="Logout"
            >
              <i className="fas fa-sign-out-alt mr-1"></i>
            </button>
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
                <h1 className="text-2xl font-semibold text-gray-900">
                  {sidebarActive === 'dashboard' ? 'Admin Dashboard' : 
                   sidebarActive === 'users' ? 'User Management' :
                   sidebarActive === 'categories' ? 'Category Management' :
                   sidebarActive === 'add-category' ? 'Add New Category' :
                   sidebarActive === 'orders' ? 'Order Management' :
                   sidebarActive === 'products' ? 'Product Management' : 
                   sidebarActive === 'add-product' ? 'Add New Product' :
                   sidebarActive === 'database' ? 'Database Status' : 'Admin Panel'}
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  {sidebarActive === 'dashboard' ? `Welcome back ${userName}, admin control center` :
                   sidebarActive === 'users' ? 'Manage users and their permissions (Admin only)' :
                   sidebarActive === 'categories' ? 'Manage product categories (Admin only)' :
                   sidebarActive === 'add-category' ? 'Create new product category (Admin only)' :
                   sidebarActive === 'orders' ? 'Manage customer orders and fulfillment (Admin only)' :
                   sidebarActive === 'products' ? 'Manage products, inventory, and pricing (Admin only)' : 
                   sidebarActive === 'add-product' ? 'Add new products to inventory (Admin only)' :
                   sidebarActive === 'database' ? 'Monitor database connections and status' : 'Administrative functions'}
                </p>
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
          {renderContent()}
        </main>
      </div>

      {/* Admin User Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit User (Admin Only)
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
