
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const AICoach = () => {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<Array<{role: 'user' | 'ai', content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setMessage("");
    setConversation(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/functions/v1/ai-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      setConversation(prev => [...prev, { role: 'ai', content: data.response }]);
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

  return (
    <div className="space-y-4">
      <div className="h-96 overflow-y-auto space-y-3 p-4 border rounded-lg bg-muted/50">
        {conversation.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>Hello! I'm your AI productivity coach. Ask me anything about goal setting, time management, or productivity tips!</p>
          </div>
        ) : (
          conversation.map((msg, index) => (
            <Card key={index} className={`p-3 ${msg.role === 'user' ? 'ml-8 bg-primary/10' : 'mr-8 bg-secondary/50'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </Card>
          ))
        )}
        {isLoading && (
          <Card className="mr-8 bg-secondary/50 p-3">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p className="text-sm text-muted-foreground">AI is thinking...</p>
            </div>
          </Card>
        )}
      </div>
      
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask your AI coach for productivity advice..."
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
