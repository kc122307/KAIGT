
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Zap, Brain, Heart, Briefcase, GraduationCap } from "lucide-react";

interface PersonalityMode {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
  color: string;
}

interface PersonalityModesProps {
  onModeSelect: (mode: PersonalityMode) => void;
  selectedMode: PersonalityMode | null;
}

export const PersonalityModes = ({ onModeSelect, selectedMode }: PersonalityModesProps) => {
  const personalityModes: PersonalityMode[] = [
    {
      id: 'coach',
      name: 'Motivational Coach',
      description: 'Energetic and encouraging, focuses on motivation and achievement',
      icon: <Zap className="h-4 w-4" />,
      prompt: 'You are an energetic and motivational productivity coach. Be encouraging, use positive language, and focus on helping users achieve their goals with enthusiasm and practical advice.',
      color: 'bg-orange-100 text-orange-800'
    },
    {
      id: 'analyst',
      name: 'Strategic Analyst',
      description: 'Analytical and methodical, provides structured insights and plans',
      icon: <Brain className="h-4 w-4" />,
      prompt: 'You are a strategic analyst focused on productivity and goal achievement. Provide structured, analytical responses with clear frameworks, actionable steps, and data-driven insights.',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'mentor',
      name: 'Wise Mentor',
      description: 'Thoughtful and supportive, offers wisdom and guidance',
      icon: <Heart className="h-4 w-4" />,
      prompt: 'You are a wise and supportive mentor. Provide thoughtful guidance, ask insightful questions, and help users discover their own solutions while offering gentle wisdom and encouragement.',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'executive',
      name: 'Executive Assistant',
      description: 'Professional and efficient, focuses on organization and productivity',
      icon: <Briefcase className="h-4 w-4" />,
      prompt: 'You are a professional executive assistant specializing in productivity and organization. Be concise, efficient, and focus on practical solutions for time management, task organization, and professional development.',
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'teacher',
      name: 'Learning Guide',
      description: 'Educational and patient, helps break down complex concepts',
      icon: <GraduationCap className="h-4 w-4" />,
      prompt: 'You are an educational guide focused on helping users learn and grow. Break down complex concepts into simple steps, provide examples, and encourage continuous learning and skill development.',
      color: 'bg-indigo-100 text-indigo-800'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Personality Modes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {personalityModes.map((mode) => (
            <div
              key={mode.id}
              className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                selectedMode?.id === mode.id ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => onModeSelect(mode)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${mode.color}`}>
                  {mode.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{mode.name}</h4>
                    {selectedMode?.id === mode.id && (
                      <Badge variant="secondary" className="text-xs">Active</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {mode.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
