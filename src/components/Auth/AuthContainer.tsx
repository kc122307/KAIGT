
import { ReactNode } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Target, Sparkles } from "lucide-react";

interface AuthContainerProps {
  children: ReactNode;
  footerText?: string;
}

export const AuthContainer = ({ children, footerText = "KAIGT 2025 - Your AI-Powered Goal Companion" }: AuthContainerProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Target className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
              <Sparkles className="h-5 w-5 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">KAIGT</h1>
              <p className="text-sm text-muted-foreground">AI Goal Companion</p>
            </div>
          </div>
          <p className="text-muted-foreground">Your AI-Powered Goal Companion</p>
        </div>
        
        <Card className="shadow-2xl border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur">
          {children}
          
          <CardFooter className="text-center text-xs text-muted-foreground pt-0">
            <p>{footerText}</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
