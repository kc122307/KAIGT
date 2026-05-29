
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { AppLayout } from "./components/Layout/AppLayout";
import { LoginForm } from "./components/Auth/LoginForm";
import { useEffect, useState } from "react";
import { useGoalStore } from "./store/goalStore";
import { toast } from "@/components/ui/use-toast";

// Pages
import LandingPage from "./pages/LandingPage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ActivityPage from "./pages/ActivityPage";
import NotificationsPage from "./pages/NotificationsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import GoalsPage from "./pages/GoalsPage";
import TasksPage from "./pages/TasksPage";
import ProgressPage from "./pages/ProgressPage";
import SettingsPage from "./pages/SettingsPage";
import TeamPage from "./pages/TeamPage";
import AIPage from "./pages/AIPage";
import InvitationsPage from "./pages/InvitationsPage";

// Set up QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useGoalStore(state => state.isAuthenticated);
  const location = useLocation();
  
  if (!isAuthenticated) {
    // Save the attempted route to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

// Public Route Component - redirects to dashboard if already authenticated
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useGoalStore(state => state.isAuthenticated);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// AppInitializer component to fetch initial data
const AppInitializer = ({ children }: { children: React.ReactNode }) => {
  const fetchUserData = useGoalStore(state => state.fetchUserData);
  const isAuthenticated = useGoalStore(state => state.isAuthenticated);
  const currentUser = useGoalStore(state => state.currentUser);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Store last visited path in session storage
  useEffect(() => {
    // Only save paths that aren't login or non-existing routes for authenticated users
    if (location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '*' && location.pathname !== '/' && isAuthenticated) {
      sessionStorage.setItem('lastVisitedPath', location.pathname);
    }
  }, [location.pathname, isAuthenticated]);

  // Handle invitation token processing on auth or load
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const params = new URLSearchParams(location.search);
      const token = params.get('invitation_token');
      if (token) {
        const processToken = async () => {
          try {
            console.log('Processing invitation token:', token);
            const { processInvitationToken } = await import('./services/api/invitationService');
            const result = await processInvitationToken(token, currentUser.id);
            if (result.success) {
              toast({
                title: "Invitation Linked!",
                description: "You have been successfully linked to the team. Accept it from your notifications or team page.",
              });
              // Refresh user data (goals, teams, notifications)
              fetchUserData();
            } else {
              toast({
                title: "Invitation failed",
                description: result.error || "Could not link invitation.",
                variant: "destructive"
              });
            }
          } catch (e) {
            console.error('Failed to process invitation:', e);
          } finally {
            // Remove invitation_token from the URL query params so it doesn't process again
            params.delete('invitation_token');
            navigate(location.pathname + (params.toString() ? `?${params.toString()}` : ''), { replace: true });
          }
        };
        processToken();
      }
    }
  }, [isAuthenticated, currentUser, location.search, navigate, fetchUserData, location.pathname]);

  useEffect(() => {
    // Initialize app data with a timeout so the app doesn't hang
    // if Supabase is unreachable
    const init = async () => {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Supabase connection timed out')), 10000)
        );
        await Promise.race([fetchUserData(), timeoutPromise]);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    init();
  }, [fetchUserData]);

  // Don't redirect during the auth check to prevent flashes
  if (isCheckingAuth) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppInitializer>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={
                <PublicRoute>
                  <LandingPage />
                </PublicRoute>
              } />
              <Route path="/login" element={
                <PublicRoute>
                  <LoginForm defaultTab="login" />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <LoginForm defaultTab="register" />
                </PublicRoute>
              } />
              
              {/* Protected Routes */}
              <Route element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route path="/dashboard" element={<Index />} />
                <Route path="/goals" element={<GoalsPage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/progress" element={<ProgressPage />} />
                <Route path="/activity" element={<ActivityPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/invitations" element={<InvitationsPage />} />
                <Route path="/ai" element={<AIPage />} />
              </Route>
              
              {/* Catch-all NotFound route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppInitializer>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
