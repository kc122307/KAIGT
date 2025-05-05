
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useGoalStore } from '../../store/goalStore';
import { supabase } from '@/integrations/supabase/client';

interface AuthRouteProps {
  children: React.ReactNode;
}

export const AuthRoute = ({ children }: AuthRouteProps) => {
  const { isAuthenticated, currentUser, fetchUserData } = useGoalStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && !currentUser) {
          await fetchUserData();
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAuth();
  }, [currentUser, fetchUserData]);

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Check if user is authenticated
  if (!isAuthenticated || !currentUser) {
    // Store current path for redirect after login
    const returnPath = location.pathname && location.pathname !== '/' ? location.pathname : null;
    if (returnPath) {
      sessionStorage.setItem('lastVisitedPath', returnPath);
    }
    
    // Redirect to login page with the return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
