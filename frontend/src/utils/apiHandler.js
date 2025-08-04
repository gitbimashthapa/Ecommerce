import axios from 'axios';

// API Handler utility 
class ApiHandler {
  static baseURL = 'http://localhost:3000/api';

  // axios instance with interceptors
  static api = axios.create({
    baseURL: this.baseURL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  // Request interceptor to add token automatically
  static {
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = token;
      }
      return config;
    }, (error) => Promise.reject(error));

    // Response interceptor for automatic error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          alert('Session expired. Please login again.');
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Utility methods using the interceptor-configured axios instance
  static async get(endpoint) {
    return this.api.get(endpoint);
  }

  static async post(endpoint, data) {
    return this.api.post(endpoint, data);
  }

  static async patch(endpoint, data) {
    return this.api.patch(endpoint, data);
  }

  static async delete(endpoint) {
    return this.api.delete(endpoint);
  }

  // Check if user is authenticated
  static isAuthenticated() {
    return !!localStorage.getItem('token');
  }
}

export default ApiHandler;