
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { AppLayout } from "./components/Layout/AppLayout";
import { AuthRoute } from "./components/Auth/AuthRoute";
import { LoginForm } from "./components/Auth/LoginForm";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ActivityPage from "./pages/ActivityPage";
import NotificationsPage from "./pages/NotificationsPage";
import LeaderboardPage from "./pages/LeaderboardPage";

// Set up QueryClient
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginForm />} />
            
            {/* Protected Routes */}
            <Route element={<AuthRoute><AppLayout /></AuthRoute>}>
              <Route path="/" element={<Index />} />
              <Route path="/activity" element={<ActivityPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              
              {/* Placeholder routes - redirect to root for now */}
              <Route path="/goals" element={<Navigate to="/" replace />} />
              <Route path="/tasks" element={<Navigate to="/" replace />} />
              <Route path="/progress" element={<Navigate to="/" replace />} />
              <Route path="/teams" element={<Navigate to="/" replace />} />
              <Route path="/settings" element={<Navigate to="/" replace />} />
            </Route>
            
            {/* Catch-all NotFound route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
