import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ element }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#1a1a1a'
      }}>
        <div style={{ color: '#fff', fontSize: '1.2rem' }}>Loading...</div>
      </div>
    );
  }

  return user ? element : <Navigate to="/login" replace />;
};

export default ProtectedRoute;