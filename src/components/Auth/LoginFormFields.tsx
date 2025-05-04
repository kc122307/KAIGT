
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface LoginFormFieldsProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  isLoading: boolean;
}

export const LoginFormFields = ({
  email,
  setEmail,
  password,
  setPassword,
  isLoading
}: LoginFormFieldsProps) => {
  const [resendingEmail, setResendingEmail] = useState(false);
  
  const handleResendVerification = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address to resend verification",
        variant: "destructive",
      });
      return;
    }
    
    setResendingEmail(true);
    
    try {
      // Try to resend the verification email
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Verification email sent",
        description: "Please check your inbox (and spam folder) and click the verification link. This may take a few minutes to arrive.",
        duration: 8000,
      });
    } catch (error) {
      console.error("Error resending verification email:", error);
      
      let errorMessage = error instanceof Error 
        ? error.message 
        : "An unexpected error occurred";
        
      // If the error is about the user not being found, give a helpful message
      if (errorMessage.includes("User not found")) {
        errorMessage = "No account found with this email. Please register first.";
      }
      
      toast({
        title: "Failed to resend verification email",
        description: errorMessage,
        variant: "destructive",
        duration: 6000,
      });
    } finally {
      setResendingEmail(false);
    }
  };
  
  return (
    <>
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
          <a href="#" className="text-xs text-muted-foreground hover:text-primary">
            Forgot password?
          </a>
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
      
      <div className="flex flex-col space-y-2">
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleResendVerification}
          disabled={resendingEmail || !email}
          className="text-xs self-center mt-1"
        >
          {resendingEmail ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Resending...
            </>
          ) : (
            "Resend verification email"
          )}
        </Button>
      </div>
    </>
  );
};
