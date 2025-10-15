
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    // If not authenticated, redirect to the login page
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute;
