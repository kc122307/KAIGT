
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { History, MessageCircle, Trash2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConversationItem {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  messageCount: number;
  category: string;
}

interface ConversationHistoryProps {
  onLoadConversation: (conversation: ConversationItem) => void;
}

export const ConversationHistory = ({ onLoadConversation }: ConversationHistoryProps) => {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load conversations from localStorage
    const savedConversations = localStorage.getItem('ai-conversations');
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        setConversations(parsed.map((conv: any) => ({
          ...conv,
          timestamp: new Date(conv.timestamp)
        })));
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    }
  }, []);

  const saveConversation = (title: string, preview: string, category: string) => {
    const newConversation: ConversationItem = {
      id: Date.now().toString(),
      title,
      preview,
      timestamp: new Date(),
      messageCount: 1,
      category
    };

    const updatedConversations = [newConversation, ...conversations].slice(0, 10); // Keep last 10
    setConversations(updatedConversations);
    localStorage.setItem('ai-conversations', JSON.stringify(updatedConversations));
  };

  const deleteConversation = (id: string) => {
    const updatedConversations = conversations.filter(conv => conv.id !== id);
    setConversations(updatedConversations);
    localStorage.setItem('ai-conversations', JSON.stringify(updatedConversations));
    
    toast({
      title: "Conversation Deleted",
      description: "The conversation has been removed from your history.",
    });
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'productivity': return 'bg-blue-100 text-blue-800';
      case 'goals': return 'bg-green-100 text-green-800';
      case 'planning': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Recent Conversations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {conversations.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No conversations yet. Start chatting to see your history!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="group border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => onLoadConversation(conversation)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm line-clamp-1">
                          {conversation.title}
                        </h4>
                        <Badge className={`text-xs ${getCategoryColor(conversation.category)}`}>
                          {conversation.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {conversation.preview}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(conversation.timestamp)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {conversation.messageCount} messages
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conversation.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
