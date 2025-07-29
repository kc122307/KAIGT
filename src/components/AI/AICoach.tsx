import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Volume2, Copy, ThumbsUp, ThumbsDown, Target, Bot, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGoalStore } from "@/store/goalStore";

interface AICoachProps {
  conversation?: any;
  onGoalSuggestion?: (suggestion: any) => void;
  onModeRecommendation?: (mode: any) => void;
  onTemplateRecommendation?: (template: any) => void;
}

export const AICoach = ({ conversation, onGoalSuggestion, onModeRecommendation, onTemplateRecommendation }: AICoachProps) => {
  const [message, setMessage] = useState("");
  const [conversationHistory, setConversationHistory] = useState<Array<{role: 'user' | 'ai', content: string, timestamp: Date, suggestions?: any}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { goals, currentUser } = useGoalStore();

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setMessage("");
    
    const newUserMessage = {
      role: 'user' as const,
      content: userMessage,
      timestamp: new Date()
    };
    
    setConversationHistory(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Prepare context about user's goals
      const userContext = {
        goals: goals.map(g => ({
          title: g.title,
          category: g.category,
          status: g.status,
          progress: g.progress
        })),
        recentConversation: conversationHistory.slice(-5)
      };

      const response = await fetch('/functions/v1/ai-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          userContext,
          history: conversationHistory.slice(-10),
          requestSuggestions: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const aiResponse = {
        role: 'ai' as const,
        content: data.response,
        timestamp: new Date(),
        suggestions: data.suggestions || {}
      };
      
      setConversationHistory(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('AI Coach error:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
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

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
    });
  };

  const speakMessage = (content: string) => {
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSuggestionClick = (type: string, suggestion: any) => {
    switch (type) {
      case 'goal':
        onGoalSuggestion?.(suggestion);
        break;
      case 'mode':
        onModeRecommendation?.(suggestion);
        break;
      case 'template':
        onTemplateRecommendation?.(suggestion);
        break;
    }
  };

  return (
    <div className="space-y-4">
      {/* Conversation Area */}
      <div className="h-96 overflow-y-auto space-y-3 p-4 border rounded-lg bg-muted/50">
        {conversationHistory.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>Hello! I'm your AI productivity coach. I'll analyze your goals and conversation to provide personalized suggestions for new goals, coaching modes, and helpful templates!</p>
          </div>
        ) : (
          conversationHistory.map((msg, index) => (
            <div key={index} className="space-y-3">
              <Card className={`p-3 ${msg.role === 'user' ? 'ml-8 bg-primary/10' : 'mr-8 bg-secondary/50'}`}>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={msg.role === 'user' ? 'default' : 'secondary'} className="text-xs">
                    {msg.role === 'user' ? 'You' : 'AI Coach'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                
                {msg.role === 'ai' && (
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyMessage(msg.content)}
                      className="text-xs"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => speakMessage(msg.content)}
                      className="text-xs"
                    >
                      <Volume2 className="h-3 w-3 mr-1" />
                      Speak
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      Like
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                    >
                      <ThumbsDown className="h-3 w-3 mr-1" />
                      Dislike
                    </Button>
                  </div>
                )}
              </Card>

              {/* Contextual Suggestions */}
              {msg.role === 'ai' && msg.suggestions && (
                <div className="mr-8 space-y-2">
                  {msg.suggestions.goals && msg.suggestions.goals.length > 0 && (
                    <Card className="p-3 bg-blue-50 border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Suggested Goals</span>
                      </div>
                      <div className="space-y-1">
                        {msg.suggestions.goals.map((goal: any, goalIndex: number) => (
                          <Button
                            key={goalIndex}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-xs h-auto p-2"
                            onClick={() => handleSuggestionClick('goal', goal)}
                          >
                            <div className="text-left">
                              <div className="font-medium">{goal.title}</div>
                              <div className="text-muted-foreground">{goal.category}</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </Card>
                  )}

                  {msg.suggestions.mode && (
                    <Card className="p-3 bg-purple-50 border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">Recommended Mode</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs h-auto p-2"
                        onClick={() => handleSuggestionClick('mode', msg.suggestions.mode)}
                      >
                        <div className="text-left">
                          <div className="font-medium">{msg.suggestions.mode.name}</div>
                          <div className="text-muted-foreground">{msg.suggestions.mode.description}</div>
                        </div>
                      </Button>
                    </Card>
                  )}

                  {msg.suggestions.template && (
                    <Card className="p-3 bg-green-50 border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Helpful Template</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs h-auto p-2"
                        onClick={() => handleSuggestionClick('template', msg.suggestions.template)}
                      >
                        <div className="text-left">
                          <div className="font-medium">{msg.suggestions.template.title}</div>
                          <div className="text-muted-foreground">{msg.suggestions.template.description}</div>
                        </div>
                      </Button>
                    </Card>
                  )}
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <Card className="mr-8 bg-secondary/50 p-3">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p className="text-sm text-muted-foreground">AI is analyzing your context and preparing suggestions...</p>
            </div>
          </Card>
        )}
      </div>
      
      {/* Message Input */}
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask your AI coach for productivity advice, goal suggestions, or help with planning..."
          className="resize-none"
          rows={2}
        />
        <Button onClick={sendMessage} disabled={isLoading || !message.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
