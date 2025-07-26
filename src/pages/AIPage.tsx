
import { AICoach } from "@/components/AI/AICoach";
import { GoalSuggestions } from "@/components/AI/GoalSuggestions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Target } from "lucide-react";

const AIPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">AI Assistant</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Productivity Coach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AICoach />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Goal Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GoalSuggestions />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIPage;
