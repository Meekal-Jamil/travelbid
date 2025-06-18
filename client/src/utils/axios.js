import axios from 'axios';

// Create axios instance with default config
const instance = axios.create({
  //baseURL: 'http://localhost:5000',
  baseURL: 'https://travelbid-server.onrender.com',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include auth token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      // Instead of redirecting, throw an error that can be handled by the component
      throw new Error('Unauthorized access. Please login again.');
    }
    return Promise.reject(error);
  }
);

export default instance; 