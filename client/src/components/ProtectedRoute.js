import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner'; // Optional: you can just return <p>Loading...</p>

const ProtectedRoute = ({ children, role }) => {
  const { user, role: currentRole, token, loading } = useAuth();

  if (loading) return <Spinner />; // 🔁 Wait until auth is loaded

  if (!user || !token || (role && currentRole !== role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
