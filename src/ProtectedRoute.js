import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './config/firebase-config';

const ProtectedRoute = ({ element }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Check if the element is a React component or an element
  const Component = typeof element === 'function' ? element : () => element;

  return user ? <Component /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
