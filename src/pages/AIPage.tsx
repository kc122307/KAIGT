
import { useState } from "react";
import { AICoach } from "@/components/AI/AICoach";
import { GoalSuggestions } from "@/components/AI/GoalSuggestions";
import { ConversationHistory } from "@/components/AI/ConversationHistory";
import { PersonalityModes } from "@/components/AI/PersonalityModes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Target, History, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGSAP } from "../hooks/useGSAP";

const AIPage = () => {
  const [selectedPersonality, setSelectedPersonality] = useState(null);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [activeTab, setActiveTab] = useState("coach");
  const { toast } = useToast();
  const { containerRef } = useGSAP();

  const handlePersonalitySelect = (personality) => {
    setSelectedPersonality(personality);
    toast({
      title: "Mode Selected",
      description: `Switched to ${personality.name} mode. This will influence future AI responses.`,
    });
    console.log('Selected personality:', personality);
  };

  const handleConversationLoad = (conversation) => {
    setCurrentConversation(conversation);
    console.log('Loaded conversation:', conversation);
  };

  const handleConversationSave = (title, preview, category) => {
    // Save to localStorage
    const savedConversations = localStorage.getItem('ai-conversations');
    let conversations = [];
    if (savedConversations) {
      try {
        conversations = JSON.parse(savedConversations);
      } catch (error) {
        console.error('Error parsing saved conversations:', error);
      }
    }
    
    const newConversation = {
      id: Date.now().toString(),
      title,
      preview,
      timestamp: new Date(),
      messageCount: 2, // User message + AI response
      category
    };
    
    const updatedConversations = [newConversation, ...conversations].slice(0, 10);
    localStorage.setItem('ai-conversations', JSON.stringify(updatedConversations));
    
    toast({
      title: "Conversation Saved",
      description: "Your conversation has been saved to history.",
    });
  };

  const handleGoalSuggestion = (suggestion) => {
    setActiveTab("goals");
    toast({
      title: "Goal Suggestion",
      description: `Check out this suggested goal: ${suggestion.title}`,
    });
  };

  const handleModeRecommendation = (mode) => {
    setActiveTab("personality");
    toast({
      title: "Mode Recommended",
      description: `The AI recommends trying ${mode.name} mode for your current needs.`,
    });
  };

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="flex items-center gap-2 mb-6 scroll-fade">
        <Brain className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">AI Assistant</h1>
      </div>
      
      <div className="scroll-fade">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="coach" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Coach
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Goal Suggestions
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="personality" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Personality
            </TabsTrigger>
          </TabsList>

          <TabsContent value="coach" className="space-y-6">
            <Card className="scroll-fade">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Productivity Coach
                  {selectedPersonality && (
                    <span className="text-sm text-muted-foreground">
                      • {selectedPersonality.name} Mode
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AICoach 
                  conversation={currentConversation}
                  selectedPersonality={selectedPersonality}
                  onGoalSuggestion={handleGoalSuggestion}
                  onModeRecommendation={handleModeRecommendation}
                  onConversationSave={handleConversationSave}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <Card className="scroll-fade">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Goal Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GoalSuggestions />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div className="scroll-fade">
              <ConversationHistory onLoadConversation={handleConversationLoad} />
            </div>
          </TabsContent>

          <TabsContent value="personality" className="space-y-6">
            <div className="scroll-fade">
              <PersonalityModes 
                onModeSelect={handlePersonalitySelect}
                selectedMode={selectedPersonality}
              />
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default AIPage;
