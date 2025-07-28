
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Volume2, Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AICoachProps {
  personality?: any;
  conversation?: any;
}

export const AICoach = ({ personality, conversation }: AICoachProps) => {
  const [message, setMessage] = useState("");
  const [conversationHistory, setConversationHistory] = useState<Array<{role: 'user' | 'ai', content: string, timestamp: Date}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
      // Construct the prompt with personality mode if selected
      let systemPrompt = "You are a helpful AI productivity coach. Provide practical, actionable advice about goal setting, time management, productivity, and personal development. Keep responses concise but helpful.";
      
      if (personality) {
        systemPrompt = personality.prompt;
      }

      const response = await fetch('/functions/v1/ai-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          systemPrompt: systemPrompt,
          history: conversationHistory.slice(-10) // Send last 10 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const aiResponse = {
        role: 'ai' as const,
        content: data.response,
        timestamp: new Date()
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

  return (
    <div className="space-y-4">
      {/* Personality Mode Indicator */}
      {personality && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <div className={`p-2 rounded-lg ${personality.color}`}>
            {personality.icon}
          </div>
          <div>
            <p className="font-medium text-sm">{personality.name} Mode</p>
            <p className="text-xs text-muted-foreground">{personality.description}</p>
          </div>
        </div>
      )}

      {/* Conversation Area */}
      <div className="h-96 overflow-y-auto space-y-3 p-4 border rounded-lg bg-muted/50">
        {conversationHistory.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>
              {personality 
                ? `Hello! I'm your ${personality.name.toLowerCase()}. ${personality.description}` 
                : "Hello! I'm your AI productivity coach. Ask me anything about goal setting, time management, or productivity tips!"
              }
            </p>
          </div>
        ) : (
          conversationHistory.map((msg, index) => (
            <Card key={index} className={`p-3 ${msg.role === 'user' ? 'ml-8 bg-primary/10' : 'mr-8 bg-secondary/50'}`}>
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
          ))
        )}
        {isLoading && (
          <Card className="mr-8 bg-secondary/50 p-3">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p className="text-sm text-muted-foreground">
                {personality ? `${personality.name} is thinking...` : 'AI is thinking...'}
              </p>
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
          placeholder={
            personality 
              ? `Ask your ${personality.name.toLowerCase()} for advice...`
              : "Ask your AI coach for productivity advice..."
          }
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
