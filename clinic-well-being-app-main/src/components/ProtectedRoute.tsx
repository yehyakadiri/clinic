import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('doctor' | 'secretary')[];
}

const ProtectedRoute = ({ 
  children, 
  allowedRoles = ['doctor', 'secretary'] 
}: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user doesn't have required role, redirect to dashboard
  if (user && !allowedRoles.includes(user.role as 'doctor' | 'secretary')) {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
