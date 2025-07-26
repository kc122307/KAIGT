
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Bot, User, Lightbulb, Target, Zap, Brain } from 'lucide-react';
import { useGoalStore } from '../../store/goalStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  type?: string;
  timestamp: Date;
}

export const AICoach = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm your AI productivity coach. I can help you break down goals, overcome procrastination, suggest new goals, or provide motivation. What would you like to work on today?",
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<'general' | 'goal_breakdown' | 'motivation' | 'procrastination' | 'goal_suggestion'>('general');

  const { goals, currentUser, activities } = useGoalStore();

  const coachTypes = [
    { id: 'general' as const, label: 'General Chat', icon: Bot },
    { id: 'goal_breakdown' as const, label: 'Break Down Goals', icon: Target },
    { id: 'motivation' as const, label: 'Motivation', icon: Zap },
    { id: 'procrastination' as const, label: 'Beat Procrastination', icon: Brain },
    { id: 'goal_suggestion' as const, label: 'Suggest Goals', icon: Lightbulb },
  ];

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const context = {
        goals: goals.slice(0, 5), // Send recent goals for context
        userProfile: currentUser,
        recentActivity: activities.slice(0, 10), // Send recent activity
      };

      const response = await supabase.functions.invoke('ai-coach', {
        body: {
          message: inputMessage,
          context: context,
          type: selectedType,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to get AI response');
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.data.response || 'Sorry, I encountered an issue. Please try again.',
        sender: 'ai',
        type: response.data.type,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error sending message to AI coach:', error);
      toast({
        title: "AI Coach Error",
        description: error instanceof Error ? error.message : "Failed to get response from AI coach",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          AI Productivity Coach
        </CardTitle>
        <div className="flex flex-wrap gap-2">
          {coachTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Badge
                key={type.id}
                variant={selectedType === type.id ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/10"
                onClick={() => setSelectedType(type.id)}
              >
                <Icon className="h-3 w-3 mr-1" />
                {type.label}
              </Badge>
            );
          })}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    {message.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-lg p-3 bg-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="flex gap-2">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask for ${coachTypes.find(t => t.id === selectedType)?.label.toLowerCase()} help...`}
            className="flex-1 min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="self-end"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Send'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
