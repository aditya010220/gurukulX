import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { isSignedIn, isLoaded } = useAuth();

  // Wait for authentication state to load
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated - redirect to auth page
  if (!isSignedIn) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Authenticated - render children
  return children;
};

export default ProtectedRoute;
