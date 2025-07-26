
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Lightbulb, Plus, Sparkles } from 'lucide-react';
import { useGoalStore } from '../../store/goalStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { GoalCategory } from '../../types';

interface SuggestedGoal {
  title: string;
  description: string;
  category: GoalCategory;
  suggestedTimeline: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  reasoning: string;
}

export const GoalSuggestions = () => {
  const [suggestions, setSuggestions] = useState<SuggestedGoal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { goals, currentUser, activities, addGoal } = useGoalStore();

  const generateSuggestions = async () => {
    if (!currentUser) return;

    setIsGenerating(true);
    try {
      // Analyze user's goal patterns
      const goalCategories = goals.map(g => g.category);
      const completedGoals = goals.filter(g => g.status === 'Completed');
      const recentActivities = activities.slice(0, 20);

      const analysisPrompt = `Based on my goal history and patterns, suggest 4-5 new SMART goals for me. 

My Current Goals: ${goals.map(g => `${g.title} (${g.category}, ${g.status})`).join(', ')}
Completed Goals: ${completedGoals.length}
Most Used Categories: ${[...new Set(goalCategories)].join(', ')}

Please suggest goals that:
1. Build on my existing interests but explore new areas
2. Are challenging but achievable
3. Cover different categories
4. Have clear timelines

Format your response as a JSON array with this structure:
[{
  "title": "Goal title",
  "description": "Detailed description",
  "category": "Personal Development|Health & Fitness|Career|Learning|Creative|Social|Financial|Travel|Other",
  "suggestedTimeline": "X months/weeks",
  "difficulty": "Easy|Medium|Hard",
  "reasoning": "Why this goal fits the user's pattern"
}]`;

      const response = await supabase.functions.invoke('ai-coach', {
        body: {
          message: analysisPrompt,
          context: {
            goals: goals,
            userProfile: currentUser,
            recentActivity: recentActivities,
          },
          type: 'goal_suggestion',
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Try to parse JSON from the response
      let parsedSuggestions: SuggestedGoal[] = [];
      try {
        const jsonMatch = response.data.response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsedSuggestions = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: create simple suggestions from text
          parsedSuggestions = [{
            title: "AI-Suggested Goal",
            description: response.data.response.substring(0, 200) + "...",
            category: "Personal Development" as GoalCategory,
            suggestedTimeline: "1-2 months",
            difficulty: "Medium" as const,
            reasoning: "Based on your activity patterns"
          }];
        }
      } catch (parseError) {
        console.error('Failed to parse suggestions:', parseError);
        // Create a fallback suggestion
        parsedSuggestions = [{
          title: "Personalized Goal Recommendation",
          description: response.data.response,
          category: "Personal Development" as GoalCategory,
          suggestedTimeline: "1-2 months",
          difficulty: "Medium" as const,
          reasoning: "AI-generated based on your profile"
        }];
      }

      setSuggestions(parsedSuggestions);
      
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        title: "Failed to generate suggestions",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const acceptSuggestion = async (suggestion: SuggestedGoal) => {
    setIsLoading(true);
    try {
      // Parse timeline to create a deadline
      const timelineMatch = suggestion.suggestedTimeline.match(/(\d+)\s*(month|week|day)s?/i);
      let deadline = new Date();
      
      if (timelineMatch) {
        const amount = parseInt(timelineMatch[1]);
        const unit = timelineMatch[2].toLowerCase();
        
        if (unit.includes('month')) {
          deadline.setMonth(deadline.getMonth() + amount);
        } else if (unit.includes('week')) {
          deadline.setDate(deadline.getDate() + (amount * 7));
        } else if (unit.includes('day')) {
          deadline.setDate(deadline.getDate() + amount);
        }
      } else {
        // Default to 2 months if parsing fails
        deadline.setMonth(deadline.getMonth() + 2);
      }

      await addGoal({
        title: suggestion.title,
        description: suggestion.description,
        category: suggestion.category,
        status: 'Pending',
        progress: 0,
        deadline: deadline,
        is_public: true,
      });

      // Remove accepted suggestion from list
      setSuggestions(prev => prev.filter(s => s.title !== suggestion.title));

      toast({
        title: "Goal added successfully!",
        description: `"${suggestion.title}" has been added to your goals.`,
      });

    } catch (error) {
      console.error('Error accepting suggestion:', error);
      toast({
        title: "Failed to add goal",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-generate suggestions when component mounts
  useEffect(() => {
    if (currentUser && goals.length > 0) {
      generateSuggestions();
    }
  }, [currentUser]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            AI Goal Suggestions
          </CardTitle>
          <Button
            onClick={generateSuggestions}
            disabled={isGenerating}
            variant="outline"
            size="sm"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {isGenerating ? 'Generating...' : 'New Suggestions'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {suggestions.length === 0 && !isGenerating && (
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No suggestions yet. Click "New Suggestions" to get personalized goal recommendations!
            </p>
          </div>
        )}

        {isGenerating && (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">
              AI is analyzing your patterns to suggest personalized goals...
            </p>
          </div>
        )}

        {suggestions.map((suggestion, index) => (
          <Card key={index} className="border-l-4 border-l-primary">
            <CardContent className="pt-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{suggestion.title}</h3>
                <div className="flex gap-2">
                  <Badge variant="outline">{suggestion.category}</Badge>
                  <Badge 
                    variant={
                      suggestion.difficulty === 'Easy' ? 'default' :
                      suggestion.difficulty === 'Medium' ? 'secondary' : 'destructive'
                    }
                  >
                    {suggestion.difficulty}
                  </Badge>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-3">{suggestion.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <span>📅 Timeline: {suggestion.suggestedTimeline}</span>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-lg mb-3">
                <p className="text-sm">
                  <strong>Why this goal?</strong> {suggestion.reasoning}
                </p>
              </div>
              
              <Button
                onClick={() => acceptSuggestion(suggestion)}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add This Goal
              </Button>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};
