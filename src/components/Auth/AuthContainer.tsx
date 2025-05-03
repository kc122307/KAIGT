
import { ReactNode } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

interface AuthContainerProps {
  children: ReactNode;
  footerText: string;
}

export const AuthContainer = ({ children, footerText }: AuthContainerProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">GoalTracker</h1>
          <p className="text-muted-foreground">Track, manage, and achieve your goals</p>
        </div>
        
        <Card>
          {children}
          
          <CardFooter className="text-center text-xs text-muted-foreground pt-0">
            <p>{footerText}</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
