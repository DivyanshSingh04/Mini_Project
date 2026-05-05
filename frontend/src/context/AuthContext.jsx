import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          if (response.data.success) {
            setUser(response.data.user);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return response.data;
      }
      throw new Error(response.data.message || 'Login failed');
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(message);
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.success) {
        // Do not log in user here. They need to verify OTP first.
        return response.data;
      }
      throw new Error(response.data.message || 'Registration failed');
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      throw new Error(message);
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return response.data;
      }
      throw new Error(response.data.message || 'Verification failed');
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Verification failed';
      throw new Error(message);
    }
  };

  const resendOtp = async (email) => {
    try {
      const response = await api.post('/auth/resend-otp', { email });
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to resend OTP');
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to resend OTP';
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    register,
    verifyOtp,
    resendOtp,
    logout,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
