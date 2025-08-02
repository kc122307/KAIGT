
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
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Store last visited path in session storage
  useEffect(() => {
    // Only save paths that aren't login or non-existing routes for authenticated users
    if (location.pathname !== '/login' && location.pathname !== '*' && location.pathname !== '/' && isAuthenticated) {
      sessionStorage.setItem('lastVisitedPath', location.pathname);
    }
  }, [location.pathname, isAuthenticated]);

  useEffect(() => {
    // Initialize app data
    const init = async () => {
      try {
        await fetchUserData();
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
                  <LoginForm />
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
