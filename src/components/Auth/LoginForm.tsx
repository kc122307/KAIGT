
import { useState } from "react";
import { useGoalStore } from "../../store/goalStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, Github, Facebook, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

export const LoginForm = () => {
  const { login, register } = useGoalStore();
  const [email, setEmail] = useState("john@example.com");
  const [password, setPassword] = useState("password");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authType, setAuthType] = useState<"login" | "register">("login");
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state or default to '/'
  const from = (location.state as any)?.from?.pathname || '/';
  
  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      if (authType === "login") {
        await login(email, password);
        
        // Show success toast
        toast({
          title: "Login successful!",
          description: "Welcome back to GoalTracker.",
          duration: 3000,
        });
      } else {
        if (!name.trim()) {
          throw new Error("Please enter your name");
        }
        
        await register(name, email, password);
        
        // Show success toast
        toast({
          title: "Registration successful!",
          description: "Welcome to GoalTracker! Your account has been created.",
          duration: 3000,
        });
      }
      
      // Navigate to the previous page or home
      navigate(from, { replace: true });
    } catch (error) {
      console.error(`${authType} failed:`, error);
      
      // Show error toast
      toast({
        title: `${authType === "login" ? "Login" : "Registration"} failed`,
        description: error instanceof Error ? error.message : "Please check your credentials and try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">GoalTracker</h1>
          <p className="text-muted-foreground">Track, manage, and achieve your goals</p>
        </div>
        
        <Card>
          <CardHeader>
            <Tabs defaultValue="login" onValueChange={(value) => setAuthType(value as "login" | "register")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          
          <form onSubmit={handleAuth}>
            <CardContent className="space-y-4">
              {authType === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {authType === "login" && (
                    <a href="#" className="text-xs text-muted-foreground hover:text-primary">
                      Forgot password?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {authType === "login" ? "Signing In..." : "Creating Account..."}
                  </>
                ) : (
                  authType === "login" ? "Sign In" : "Create Account"
                )}
              </Button>
              
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="gap-2" type="button">
                  <svg viewBox="0 0 24 24" className="h-5 w-5">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>
                <Button variant="outline" className="gap-2" type="button">
                  <Github className="h-5 w-5" />
                  GitHub
                </Button>
              </div>
            </CardContent>
          </form>
          
          <CardFooter className="text-center text-xs text-muted-foreground pt-0">
            <p>
              {authType === "login" 
                ? "Don't have an account? Click the Register tab to create one." 
                : "Already have an account? Click the Login tab to sign in."}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
