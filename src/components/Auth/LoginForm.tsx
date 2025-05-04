
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardHeader, CardContent } from "@/components/ui/card";
import { AuthContainer } from "./AuthContainer";
import { LoginFormFields } from "./LoginFormFields";
import { RegisterFormFields } from "./RegisterFormFields";
import { SocialLogin } from "./SocialLogin";
import { useAuth } from "@/hooks/useAuth";

export const LoginForm = () => {
  const [authType, setAuthType] = useState<"login" | "register">("login");
  
  const loginAuth = useAuth("login");
  const registerAuth = useAuth("register");
  
  // Use the appropriate auth object based on current tab
  const currentAuth = authType === "login" ? loginAuth : registerAuth;
  
  return (
    <AuthContainer 
      footerText={
        authType === "login" 
          ? "Don't have an account? Click the Register tab to create one." 
          : "Already have an account? Click the Login tab to sign in."
      }
    >
      <CardHeader>
        <Tabs defaultValue="login" onValueChange={(value) => setAuthType(value as "login" | "register")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <form onSubmit={currentAuth.handleSubmit}>
            <CardContent className="space-y-4 mt-4">
              <TabsContent value="login" className="space-y-4">
                <LoginFormFields 
                  email={loginAuth.email}
                  setEmail={loginAuth.setEmail}
                  password={loginAuth.password}
                  setPassword={loginAuth.setPassword}
                  isLoading={loginAuth.isLoading}
                />
              </TabsContent>
              
              <TabsContent value="register" className="space-y-4">
                <RegisterFormFields 
                  name={registerAuth.name}
                  setName={registerAuth.setName}
                  email={registerAuth.email}
                  setEmail={registerAuth.setEmail}
                  password={registerAuth.password}
                  setPassword={registerAuth.setPassword}
                  isLoading={registerAuth.isLoading}
                />
              </TabsContent>
              
              <SocialLogin />
            </CardContent>
          </form>
        </Tabs>
      </CardHeader>
    </AuthContainer>
  );
};
