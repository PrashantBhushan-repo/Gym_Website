import React, { createContext, useContext, useState, useEffect } from 'react';
import API_BASE_URL, { apiUrl } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on app load and after OAuth redirect
  useEffect(() => {
    checkAuthStatus();

    // Check if coming back from OAuth callback
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'success') {
      // Remove the auth param from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Re-check auth status after a short delay to ensure session is set
      setTimeout(checkAuthStatus, 500);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(apiUrl('/auth/user'), {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    // Redirect to backend OAuth endpoint
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const logout = async () => {
    try {
      await fetch(apiUrl('/auth/logout'), {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      // Redirect to login page after logout
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
