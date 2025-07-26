
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { AppLayout } from './components/Layout/AppLayout';
import { AuthRoute } from './components/Auth/AuthRoute';

// Pages
import Index from './pages/Index';
import GoalsPage from './pages/GoalsPage';
import TasksPage from './pages/TasksPage';
import ProgressPage from './pages/ProgressPage';
import ActivityPage from './pages/ActivityPage';
import LeaderboardPage from './pages/LeaderboardPage';
import TeamPage from './pages/TeamPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import AIPage from './pages/AIPage';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Index />} />
            <Route path="/register" element={<Index />} />
            <Route
              path="/dashboard"
              element={
                <AuthRoute>
                  <AppLayout>
                    <GoalsPage />
                  </AppLayout>
                </AuthRoute>
              }
            />
            <Route
              path="/goals"
              element={
                <AuthRoute>
                  <AppLayout>
                    <GoalsPage />
                  </AppLayout>
                </AuthRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <AuthRoute>
                  <AppLayout>
                    <TasksPage />
                  </AppLayout>
                </AuthRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <AuthRoute>
                  <AppLayout>
                    <ProgressPage />
                  </AppLayout>
                </AuthRoute>
              }
            />
            <Route
              path="/activity"
              element={
                <AuthRoute>
                  <AppLayout>
                    <ActivityPage />
                  </AppLayout>
                </AuthRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <AuthRoute>
                  <AppLayout>
                    <LeaderboardPage />
                  </AppLayout>
                </AuthRoute>
              }
            />
            <Route
              path="/team"
              element={
                <AuthRoute>
                  <AppLayout>
                    <TeamPage />
                  </AppLayout>
                </AuthRoute>
              }
            />
            <Route
              path="/ai"
              element={
                <AuthRoute>
                  <AppLayout>
                    <AIPage />
                  </AppLayout>
                </AuthRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <AuthRoute>
                  <AppLayout>
                    <NotificationsPage />
                  </AppLayout>
                </AuthRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <AuthRoute>
                  <AppLayout>
                    <SettingsPage />
                  </AppLayout>
                </AuthRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
