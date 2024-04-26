// src/utils/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase-config';

const ProtectedRoute = () => {
  const [user, loading, error] = useAuthState(auth);
  const location = useLocation(); // Use the useLocation hook here

  if (loading) return <div>Loading...</div>;
  if (!user || error) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
