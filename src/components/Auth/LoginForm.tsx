
import { useEffect } from 'react';
import { LoginFormFields } from './LoginFormFields';
import { AuthContainer } from './AuthContainer';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useGoalStore } from '../../store/goalStore';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RegisterFormFields } from './RegisterFormFields';
import { SocialLogin } from './SocialLogin';

export const LoginForm = () => {
  const loginAuth = useAuth('login');
  const registerAuth = useAuth('register');
  const { isAuthenticated } = useGoalStore();
  const navigate = useNavigate();
  
  // Handle redirection when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Get the last visited path from storage, or default to '/dashboard'
      const lastPath = sessionStorage.getItem('lastVisitedPath') || '/dashboard';
      navigate(lastPath, { replace: true });
    }
  }, [isAuthenticated, navigate]);
  
  // If already authenticated, show loading while redirecting
  if (isAuthenticated) {
    return (
      <AuthContainer>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Redirecting...</p>
          </div>
        </div>
      </AuthContainer>
    );
  }
  
  return (
    <AuthContainer>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome to GoalTracker
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your account or create a new one
          </p>
        </div>

        <Card>
          <CardContent className="pt-4">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="mt-4">
                <LoginFormFields
                  email={loginAuth.email}
                  setEmail={loginAuth.setEmail}
                  password={loginAuth.password}
                  setPassword={loginAuth.setPassword}
                  handleSubmit={loginAuth.handleSubmit}
                  isLoading={loginAuth.isLoading}
                />
              </TabsContent>
              <TabsContent value="register" className="mt-4">
                <RegisterFormFields
                  name={registerAuth.name}
                  setName={registerAuth.setName} 
                  email={registerAuth.email}
                  setEmail={registerAuth.setEmail}
                  password={registerAuth.password}
                  setPassword={registerAuth.setPassword}
                  handleSubmit={registerAuth.handleSubmit}
                  isLoading={registerAuth.isLoading}
                />
              </TabsContent>
            </Tabs>
            
            <SocialLogin />
          </CardContent>
        </Card>
      </div>
    </AuthContainer>
  );
};
