import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Plus, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGoalStore } from "@/store/goalStore";
import { GoalCategory } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { callOpenRouterDirectly } from "@/services/openrouterService";

interface GoalSuggestion {
  title: string;
  description: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export const GoalSuggestions = () => {
  const [suggestions, setSuggestions] = useState<GoalSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const { toast } = useToast();
  const { addGoal, currentUser } = useGoalStore();

  const generateSuggestions = async () => {
    console.log('✨ GoalSuggestions: generateSuggestions called');
    setIsLoading(true);
    
    try {
      // Get the current session for authentication
      console.log('🔐 GoalSuggestions: Getting user session...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('❌ GoalSuggestions: No session found');
        toast({
          title: "Authentication Required",
          description: "Please log in to use goal suggestions.",
          variant: "destructive",
        });
        setSuggestions(sampleSuggestions);
        setIsLoading(false);
        return;
      }
      
      console.log('🚀 GoalSuggestions: Using OpenRouter fallback...');
      
      const baseContext = customInput.trim() 
        ? `focused on "${customInput.trim()}"` 
        : 'focused on productivity and personal development';
      
      const prompt = `Generate exactly 3 personalized goal suggestions for a user ${baseContext}. 
      
      ${customInput.trim() ? `The user is specifically interested in: "${customInput.trim()}"` : ''}
      
      Return ONLY a JSON array with this exact format (no additional text or formatting):
      [
        {
          "title": "Goal Title",
          "description": "Brief description of the goal",
          "category": "Personal", 
          "difficulty": "Easy"
        }
      ]
      
      Categories must be one of: Personal, Work, Health, Education, Finance, Social
      Difficulty must be one of: Easy, Medium, Hard
      
      Make the suggestions relevant to the user's interest and provide actionable, specific goals.`;
      
      const response = await callOpenRouterDirectly({
        message: prompt,
        userContext: { goals: [] },
        history: []
      });
      
      console.log('📊 GoalSuggestions: AI responded with:', response.response);
      
      // Try to parse the AI response as JSON
      try {
        const parsedSuggestions = JSON.parse(response.response);
        if (Array.isArray(parsedSuggestions) && parsedSuggestions.length > 0) {
          setSuggestions(parsedSuggestions);
          console.log('✅ GoalSuggestions: Successfully parsed AI suggestions:', parsedSuggestions);
        } else {
          console.log('⚠️ GoalSuggestions: AI response not a valid array, using sample data');
          setSuggestions(sampleSuggestions);
        }
      } catch (parseError) {
        console.log('⚠️ GoalSuggestions: Failed to parse AI response, using sample data:', parseError);
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
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        category: suggestion.category as GoalCategory,
        status: 'Pending',
        progress: 0,
        is_public: true
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
      category: "Personal",
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      generateSuggestions();
    }
  };

  return (
    <div className="space-y-6">
      {/* Custom Input Section */}
      <Card className="border-dashed border-2">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <Label htmlFor="goal-input" className="text-sm font-medium">
                What would you like to achieve? (Optional)
              </Label>
            </div>
            <Input
              id="goal-input"
              type="text"
              placeholder="e.g., Learn dancing, Improve fitness, Start a business, Learn programming..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground">
              💡 Leave blank for general productivity suggestions, or specify your interest for personalized goals
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Generate Button */}
      <div className="text-center">
        <Button 
          onClick={generateSuggestions} 
          disabled={isLoading}
          size="lg"
          className="gradient-primary gap-2 hover:scale-105 transition-all duration-300"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating Suggestions...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate {customInput.trim() ? 'Personalized' : 'General'} Goals
            </>
          )}
        </Button>
        
        {customInput.trim() && (
          <p className="text-xs text-muted-foreground mt-2">
            🎯 Creating goals for: <span className="font-medium">"{customInput.trim()}"</span>
          </p>
        )}
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
