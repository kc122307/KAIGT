import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Volume2, Copy, ThumbsUp, ThumbsDown, Target, Bot, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGoalStore } from "@/store/goalStore";
import { supabase, supabaseUrl, supabaseAnonKey } from "@/integrations/supabase/client";
import { callOpenRouterDirectly } from "@/services/openrouterService";

interface AICoachProps {
  conversation?: any;
  selectedPersonality?: any;
  onGoalSuggestion?: (suggestion: any) => void;
  onModeRecommendation?: (mode: any) => void;
  onConversationSave?: (title: string, preview: string, category: string) => void;
}

export const AICoach = ({ conversation, selectedPersonality, onGoalSuggestion, onModeRecommendation, onConversationSave }: AICoachProps) => {
  const [message, setMessage] = useState("");
  const [conversationHistory, setConversationHistory] = useState<Array<{role: 'user' | 'ai', content: string, timestamp: Date, suggestions?: any}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { goals, currentUser } = useGoalStore();

  const sendMessage = async () => {
    console.log('🚀 AICoach: sendMessage called');
    
    if (!message.trim()) {
      console.log('❌ AICoach: Empty message, returning');
      return;
    }

    const userMessage = message;
    console.log('💬 AICoach: User message:', {
      length: userMessage.length,
      preview: userMessage.substring(0, 50) + (userMessage.length > 50 ? '...' : '')
    });
    
    setMessage("");
    
    const newUserMessage = {
      role: 'user' as const,
      content: userMessage,
      timestamp: new Date()
    };
    
    setConversationHistory(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    
    console.log('🔄 AICoach: State updated, starting API call...');

    try {
      // Get the current session for authentication
      console.log('🔐 AICoach: Getting user session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ AICoach: Session error:', sessionError);
        toast({
          title: "Authentication Error",
          description: "Unable to verify authentication. Please try logging out and back in.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      if (!session || !session.access_token) {
        console.error('❌ AICoach: No valid session found');
        toast({
          title: "Authentication Required",
          description: "Please log in to use the AI coach.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      console.log('✅ AICoach: Using session for AI request:', { 
        userId: session.user?.id,
        tokenExists: !!session.access_token,
        tokenPreview: session.access_token.substring(0, 20) + '...' 
      });
      
      // Prepare context about user's goals
      console.log('📊 AICoach: Preparing user context...');
      const userContext = {
        goals: goals.map(g => ({
          title: g.title,
          category: g.category,
          status: g.status,
          progress: g.progress
        })),
        recentConversation: conversationHistory.slice(-5),
        personality: selectedPersonality?.prompt || null
      };
      
      console.log('📋 AICoach: User context prepared:', {
        goalsCount: userContext.goals.length,
        recentConversationCount: userContext.recentConversation.length
      });
      
      const requestBody = {
        message: userMessage,
        userContext,
        history: conversationHistory.slice(-10),
        requestSuggestions: true
      };
      
      console.log('🚀 AICoach: Making API request to Edge Function...', {
        url: `${supabaseUrl}/functions/v1/ai-coach`,
        method: 'POST',
        hasAuth: !!session.access_token,
        bodyKeys: Object.keys(requestBody)
      });

      const response = await fetch(`${supabaseUrl}/functions/v1/ai-coach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('📊 AICoach: Edge Function response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI Coach API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        if (response.status === 401) {
          toast({
            title: "Authentication Failed",
            description: "Your session may have expired. Please refresh the page and try again.",
            variant: "destructive",
          });
          return;
        }
        
        throw new Error(`AI API Error (${response.status}): ${errorText}`);
      }

      const responseText = await response.text();
      console.log('📄 AICoach: Raw response text:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('📊 AICoach: Parsed response data:', data);
      } catch (parseError) {
        console.error('❌ AICoach: Failed to parse JSON response:', parseError);
        console.log('📄 AICoach: Raw response that failed to parse:', responseText);
        throw new Error('Invalid JSON response from AI service');
      }
      
      console.log('🔍 AICoach: Checking response structure:', {
        hasResponse: !!data.response,
        responseType: typeof data.response,
        responseLength: data.response?.length || 0,
        responsePreview: data.response?.substring(0, 100) || 'No response content',
        hasSuggestions: !!data.suggestions,
        suggestionsKeys: data.suggestions ? Object.keys(data.suggestions) : []
      });
      
      // Check if Edge Function failed with API key error or generic response
      const shouldUseFallback = !data.response || 
                              data.response === 'Sorry, I could not generate a response.' ||
                              data.response.includes('OpenRouter API Error') ||
                              data.response.includes('User not found');
      
      if (shouldUseFallback) {
        console.warn('⚠️ AICoach: Edge Function error detected, using client fallback...', {
          response: data.response,
          debug: data.debug
        });
        
        // Fallback: Call OpenRouter directly
        try {
          console.log('🔄 AICoach: Attempting direct OpenRouter fallback...');
          // Apply personality context
          const contextualMessage = userMessage;
          
          const fallbackResponse = await callOpenRouterDirectly({
            message: contextualMessage,
            userContext: {
              ...userContext,
              personality: selectedPersonality?.prompt || null
            },
            history: conversationHistory.slice(-10)
          });
          
          console.log('✅ AICoach: Fallback successful:', fallbackResponse);
          
          const aiResponse = {
            role: 'ai' as const,
            content: fallbackResponse.response,
            timestamp: new Date(),
            suggestions: fallbackResponse.suggestions || {}
          };
          
          console.log('🎉 AICoach: Using fallback response:', {
            contentLength: aiResponse.content.length,
            hasSuggestions: Object.keys(aiResponse.suggestions).length > 0
          });
          
          setConversationHistory(prev => {
            const newHistory = [...prev, aiResponse];
            
            // Save conversation to history if this is the first exchange
            if (onConversationSave && newHistory.length === 2) {
              const title = userMessage.length > 30 ? userMessage.substring(0, 30) + '...' : userMessage;
              const preview = aiResponse.content.length > 100 ? aiResponse.content.substring(0, 100) + '...' : aiResponse.content;
              const category = selectedPersonality?.name.toLowerCase().includes('coach') ? 'productivity' : 
                             selectedPersonality?.name.toLowerCase().includes('goal') ? 'goals' : 
                             'general';
              
              onConversationSave(title, preview, category);
            }
            
            return newHistory;
          });
          return; // Exit early, we're done
          
        } catch (fallbackError) {
          console.error('❌ AICoach: Fallback also failed:', fallbackError);
          throw new Error('Both Edge Function and fallback failed');
        }
      }
      
      const aiResponse = {
        role: 'ai' as const,
        content: data.response,
        timestamp: new Date(),
        suggestions: data.suggestions || {}
      };
      
      console.log('✅ AICoach: Created AI response object:', {
        contentLength: aiResponse.content.length,
        hasSuggestions: Object.keys(aiResponse.suggestions).length > 0,
        suggestionsKeys: Object.keys(aiResponse.suggestions)
      });
      
      setConversationHistory(prev => {
        const newHistory = [...prev, aiResponse];
        console.log('📋 AICoach: Updated conversation history:', {
          totalMessages: newHistory.length,
          lastMessage: {
            role: newHistory[newHistory.length - 1].role,
            contentPreview: newHistory[newHistory.length - 1].content.substring(0, 50)
          }
        });
        return newHistory;
      });
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