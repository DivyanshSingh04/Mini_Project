import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // Uses env var in production or fallback for local dev
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests and add the authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercept responses to handle global errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: Clear token and redirect to login if token is expired/invalid
      // This is usually best handled in the UI Layer or Context
      localStorage.removeItem('token');
      // window.location.href = '/login'; // Alternatively, trigger context logout
    }
    return Promise.reject(error);
  }
);

export default api;
