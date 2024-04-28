// src/utils/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase-config';

const ProtectedRoute = () => {
    const [user, loading, error] = useAuthState(auth);
    const location = useLocation();
  
    if (loading) return <div>Loading...</div>;
    if (error) {
      console.error('Authentication error:', error);
      return <div>Error during authentication. Please try again later.</div>;
    }
    if (!user) {
      return <Navigate to="/login" replace state={{ from: location }} />;
    }
  
    return <Outlet />;
  };
export default ProtectedRoute;
