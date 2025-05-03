
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGoalStore } from "../store/goalStore";
import { toast } from "@/components/ui/use-toast";

type AuthType = "login" | "register";

export const useAuth = (authType: AuthType) => {
  const { login, register } = useGoalStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state or default to '/'
  const from = (location.state as any)?.from?.pathname || '/';
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      if (authType === "login") {
        console.log('Login attempt with:', email);
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
        
        console.log('Registration attempt with:', email);
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
      
      // Show detailed error toast
      toast({
        title: `${authType === "login" ? "Login" : "Registration"} failed`,
        description: error instanceof Error 
          ? error.message 
          : "An unexpected error occurred. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    isLoading,
    handleSubmit
  };
};
