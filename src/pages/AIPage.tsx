
import { useState } from "react";
import { AICoach } from "@/components/AI/AICoach";
import { GoalSuggestions } from "@/components/AI/GoalSuggestions";
import { ConversationHistory } from "@/components/AI/ConversationHistory";
import { PersonalityModes } from "@/components/AI/PersonalityModes";
import { SmartTemplates } from "@/components/AI/SmartTemplates";
import { VoiceInterface } from "@/components/AI/VoiceInterface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Target, History, Bot, FileText, Mic } from "lucide-react";
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

  const handleTemplateSelect = (template) => {
    setActiveTab("coach");
    toast({
      title: "Template Selected",
      description: `Using ${template.title} template in your coaching session.`,
    });
    console.log('Selected template:', template);
  };

  const handleVoiceTranscription = (text) => {
    console.log('Voice transcription:', text);
  };

  const handleSpeakText = (text) => {
    console.log('Speaking text:', text);
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

  const handleTemplateRecommendation = (template) => {
    setActiveTab("templates");
    toast({
      title: "Template Suggested",
      description: `The AI suggests using the ${template.title} template.`,
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="coach" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Coach
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="personality" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Modes
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Voice
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
                  onGoalSuggestion={handleGoalSuggestion}
                  onModeRecommendation={handleModeRecommendation}
                  onTemplateRecommendation={handleTemplateRecommendation}
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

          <TabsContent value="templates" className="space-y-6">
            <div className="scroll-fade">
              <SmartTemplates onTemplateSelect={handleTemplateSelect} />
            </div>
          </TabsContent>

          <TabsContent value="voice" className="space-y-6">
            <div className="scroll-fade">
              <VoiceInterface 
                onTranscription={handleVoiceTranscription}
                onSpeakText={handleSpeakText}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIPage;
