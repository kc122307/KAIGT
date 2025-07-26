
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot, Lightbulb, TrendingUp, Brain } from 'lucide-react';
import { AICoach } from '../components/AI/AICoach';
import { GoalSuggestions } from '../components/AI/GoalSuggestions';

const AIPage = () => {
  const [activeTab, setActiveTab] = useState("coach");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI-Powered Goal Assistant</h1>
        <p className="text-muted-foreground">
          Leverage artificial intelligence to achieve your goals smarter and faster
        </p>
      </div>

      <Tabs defaultValue="coach" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="coach" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI Coach
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Suggestions
          </TabsTrigger>
          <TabsTrigger value="prediction" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="coach" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 h-[calc(100vh-300px)]">
            <AICoach />
          </div>
        </TabsContent>

        <TabsContent value="suggestions" className="mt-6">
          <GoalSuggestions />
        </TabsContent>

        <TabsContent value="prediction" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Progress Prediction (Coming Soon)
              </CardTitle>
              <CardDescription>
                AI-powered predictions about your goal completion likelihood
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                This feature will use machine learning to predict whether you'll complete your goals on time
                and provide early warnings when you're likely to fall behind.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Insights (Coming Soon)
              </CardTitle>
              <CardDescription>
                Behavioral pattern analysis and personalized recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                This feature will analyze your goal patterns, identify behavioral trends,
                and provide insights about your productivity cycles and success factors.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIPage;
