
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useGoalStore } from '../../store/goalStore';

interface AuthRouteProps {
  children: React.ReactNode;
}

export const AuthRoute = ({ children }: AuthRouteProps) => {
  const { isAuthenticated, currentUser } = useGoalStore();
  const location = useLocation();

  // Check if user is authenticated
  if (!isAuthenticated || !currentUser) {
    // Redirect to login page with the return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
