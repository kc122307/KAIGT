
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGoalStore } from "@/store/goalStore";

interface GoalSuggestion {
  title: string;
  description: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export const GoalSuggestions = () => {
  const [suggestions, setSuggestions] = useState<GoalSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addGoal, currentUser } = useGoalStore();

  const generateSuggestions = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/functions/v1/ai-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: "Generate 3 personalized goal suggestions for a user focused on productivity and personal development. Format as JSON array with title, description, category, and difficulty fields." 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate suggestions');
      }

      const data = await response.json();
      
      // Try to parse the AI response as JSON, fallback to sample data if parsing fails
      try {
        const parsedSuggestions = JSON.parse(data.response);
        setSuggestions(Array.isArray(parsedSuggestions) ? parsedSuggestions : sampleSuggestions);
      } catch {
        setSuggestions(sampleSuggestions);
      }
      
    } catch (error) {
      console.error('Goal suggestions error:', error);
      setSuggestions(sampleSuggestions);
      toast({
        title: "Info",
        description: "Showing sample suggestions. Connect your OpenAI API key for personalized recommendations.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSuggestedGoal = async (suggestion: GoalSuggestion) => {
    if (!currentUser) return;
    
    try {
      await addGoal({
        title: suggestion.title,
        description: suggestion.description,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        category: suggestion.category,
        priority: suggestion.difficulty === 'Hard' ? 'high' : suggestion.difficulty === 'Medium' ? 'medium' : 'low',
        status: 'active'
      });
      
      toast({
        title: "Goal Added",
        description: `"${suggestion.title}" has been added to your goals!`,
      });
    } catch (error) {
      console.error('Error adding goal:', error);
      toast({
        title: "Error",
        description: "Failed to add goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const sampleSuggestions: GoalSuggestion[] = [
    {
      title: "Read 12 Books This Year",
      description: "Expand your knowledge by reading one book per month across various topics",
      category: "Personal Development",
      difficulty: "Medium"
    },
    {
      title: "Learn a New Skill",
      description: "Dedicate 30 minutes daily to learning a new skill like coding, language, or instrument",
      category: "Education",
      difficulty: "Medium"
    },
    {
      title: "Exercise 3 Times Per Week",
      description: "Build a consistent fitness routine with regular workouts",
      category: "Health",
      difficulty: "Easy"
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <Button 
          onClick={generateSuggestions} 
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Get Goal Suggestions
            </>
          )}
        </Button>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{suggestion.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">{suggestion.category}</Badge>
                    <Badge className={`text-xs ${getDifficultyColor(suggestion.difficulty)}`}>
                      {suggestion.difficulty}
                    </Badge>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => addSuggestedGoal(suggestion)}
                  className="shrink-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
