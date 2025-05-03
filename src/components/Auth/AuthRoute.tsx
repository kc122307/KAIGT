
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useGoalStore } from '../../store/goalStore';

interface AuthRouteProps {
  children: React.ReactNode;
}

export const AuthRoute = ({ children }: AuthRouteProps) => {
  const { isAuthenticated, currentUser, fetchUserData } = useGoalStore();
  const location = useLocation();

  useEffect(() => {
    // Ensure user data is loaded if authenticated
    if (isAuthenticated && !currentUser) {
      fetchUserData().catch(console.error);
    }
  }, [isAuthenticated, currentUser, fetchUserData]);

  // Check if user is authenticated
  if (!isAuthenticated || !currentUser) {
    // Redirect to login page with the return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
