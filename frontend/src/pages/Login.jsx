import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Login = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/login', userData);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', response.data.data.role);
        localStorage.setItem('userName', response.data.data.username);
        window.dispatchEvent(new Event('authChange'));
        alert('Login successful!');
        navigate('/');
      } else {
        alert('Login failed - no token received');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.status === 404) {
        if (err.response.data.message === 'User not found') {
          alert('No account found with this email. Please register first.');
        } else if (err.response.data.message === 'Password not matched') {
          alert('Incorrect password. Please try again.');
        } else {
          alert('Login failed. Please check your credentials.');
        }
      } else {
        alert('Login failed. Please try again.');
      }
    }
  };

  return (
    <div>
      <Navbar />
      <section className="bg-blue-50 min-h-screen">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                Sign in to your account
              </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">Your email</label>
                <input 
                  type="email" 
                  name="email" 
                  id="email" 
                  value={userData.email}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-600 focus:border-teal-600 block w-full p-2.5" 
                  placeholder="name@company.com" 
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">Password</label>
                <input 
                  type="password" 
                  name="password" 
                  id="password" 
                  value={userData.password}
                  onChange={handleChange}
                  placeholder="••••••••" 
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-600 focus:border-teal-600 block w-full p-2.5" 
                  required
                />
              </div>
              <button 
                type="submit" 
                className="w-full text-white bg-teal-600 hover:bg-teal-700 focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Sign in
              </button>
              <p className="text-sm font-light text-gray-500">
                Don't have an account yet? <Link to="/register" className="font-medium text-teal-600 hover:underline">Sign up</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
    </div>
  );
};

export default Login;