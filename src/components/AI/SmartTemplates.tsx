
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Template, Clock, Target, Calendar, Lightbulb, TrendingUp } from "lucide-react";

interface SmartTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  prompt: string;
  tags: string[];
}

interface SmartTemplatesProps {
  onTemplateSelect: (template: SmartTemplate) => void;
}

export const SmartTemplates = ({ onTemplateSelect }: SmartTemplatesProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const templates: SmartTemplate[] = [
    {
      id: 'daily-planning',
      title: 'Daily Planning Assistant',
      description: 'Get help organizing your day with priorities and time blocks',
      category: 'planning',
      icon: <Calendar className="h-4 w-4" />,
      prompt: 'Help me plan my day effectively. Ask me about my priorities, available time, and energy levels, then suggest a structured daily schedule with time blocks and breaks.',
      tags: ['daily', 'schedule', 'priorities']
    },
    {
      id: 'goal-breakdown',
      title: 'Goal Breakdown & Action Plan',
      description: 'Break down large goals into manageable steps and milestones',
      category: 'goals',
      icon: <Target className="h-4 w-4" />,
      prompt: 'I need help breaking down a large goal into smaller, actionable steps. Ask me about my goal, timeline, and resources, then create a detailed action plan with milestones.',
      tags: ['goals', 'planning', 'milestones']
    },
    {
      id: 'time-audit',
      title: 'Time Management Audit',
      description: 'Analyze your time usage and identify improvement opportunities',
      category: 'productivity',
      icon: <Clock className="h-4 w-4" />,
      prompt: 'Conduct a time management audit for me. Ask about my current schedule, biggest time wasters, and productivity challenges, then provide specific recommendations for improvement.',
      tags: ['time', 'audit', 'optimization']
    },
    {
      id: 'habit-builder',
      title: 'Habit Formation Strategy',
      description: 'Create a personalized plan for building positive habits',
      category: 'habits',
      icon: <TrendingUp className="h-4 w-4" />,
      prompt: 'Help me build a new positive habit. Ask about the habit I want to develop, my current routine, and potential obstacles, then create a step-by-step habit formation plan.',
      tags: ['habits', 'routine', 'consistency']
    },
    {
      id: 'productivity-boost',
      title: 'Productivity Boost Session',
      description: 'Get personalized tips to overcome productivity blocks',
      category: 'productivity',
      icon: <Lightbulb className="h-4 w-4" />,
      prompt: 'I need a productivity boost. Ask me about my current challenges, work environment, and what\'s blocking my progress, then provide specific, actionable advice to improve my productivity.',
      tags: ['productivity', 'focus', 'motivation']
    },
    {
      id: 'weekly-review',
      title: 'Weekly Review & Planning',
      description: 'Reflect on the past week and plan for the next',
      category: 'planning',
      icon: <Calendar className="h-4 w-4" />,
      prompt: 'Guide me through a weekly review and planning session. Ask about my achievements, challenges, and lessons learned this week, then help me plan priorities for the upcoming week.',
      tags: ['review', 'reflection', 'planning']
    }
  ];

  const categories = [
    { id: 'all', name: 'All Templates', count: templates.length },
    { id: 'planning', name: 'Planning', count: templates.filter(t => t.category === 'planning').length },
    { id: 'goals', name: 'Goals', count: templates.filter(t => t.category === 'goals').length },
    { id: 'productivity', name: 'Productivity', count: templates.filter(t => t.category === 'productivity').length },
    { id: 'habits', name: 'Habits', count: templates.filter(t => t.category === 'habits').length }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(template => template.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'goals': return 'bg-green-100 text-green-800';
      case 'productivity': return 'bg-purple-100 text-purple-800';
      case 'habits': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Template className="h-5 w-5" />
          Smart Templates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="text-xs"
              >
                {category.name} ({category.count})
              </Button>
            ))}
          </div>

          {/* Templates List */}
          <ScrollArea className="h-80">
            <div className="space-y-3">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => onTemplateSelect(template)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getCategoryColor(template.category)}`}>
                      {template.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{template.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {template.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};
