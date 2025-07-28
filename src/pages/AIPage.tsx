
import { useState } from "react";
import { AICoach } from "@/components/AI/AICoach";
import { GoalSuggestions } from "@/components/AI/GoalSuggestions";
import { ConversationHistory } from "@/components/AI/ConversationHistory";
import { PersonalityModes } from "@/components/AI/PersonalityModes";
import { SmartTemplates } from "@/components/AI/SmartTemplates";
import { VoiceInterface } from "@/components/AI/VoiceInterface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Target, History, Bot, Template, Mic } from "lucide-react";

const AIPage = () => {
  const [selectedPersonality, setSelectedPersonality] = useState(null);
  const [currentConversation, setCurrentConversation] = useState(null);

  const handlePersonalitySelect = (personality) => {
    setSelectedPersonality(personality);
    console.log('Selected personality:', personality);
  };

  const handleConversationLoad = (conversation) => {
    setCurrentConversation(conversation);
    console.log('Loaded conversation:', conversation);
  };

  const handleTemplateSelect = (template) => {
    console.log('Selected template:', template);
    // This would typically send the template prompt to the AI coach
  };

  const handleVoiceTranscription = (text) => {
    console.log('Voice transcription:', text);
    // This would typically send the transcribed text to the AI coach
  };

  const handleSpeakText = (text) => {
    console.log('Speaking text:', text);
    // This would typically use text-to-speech for AI responses
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">AI Assistant</h1>
      </div>
      
      <Tabs defaultValue="coach" className="w-full">
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
            <Template className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="voice" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Voice
          </TabsTrigger>
        </TabsList>

        <TabsContent value="coach" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Productivity Coach
                  {selectedPersonality && (
                    <span className="text-sm font-normal text-muted-foreground">
                      ({selectedPersonality.name})
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AICoach 
                  personality={selectedPersonality}
                  conversation={currentConversation}
                />
              </CardContent>
            </Card>
            
            <div className="space-y-4">
              <PersonalityModes 
                onModeSelect={handlePersonalitySelect}
                selectedMode={selectedPersonality}
              />
              <SmartTemplates onTemplateSelect={handleTemplateSelect} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card>
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
          <ConversationHistory onLoadConversation={handleConversationLoad} />
        </TabsContent>

        <TabsContent value="personality" className="space-y-6">
          <PersonalityModes 
            onModeSelect={handlePersonalitySelect}
            selectedMode={selectedPersonality}
          />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <SmartTemplates onTemplateSelect={handleTemplateSelect} />
        </TabsContent>

        <TabsContent value="voice" className="space-y-6">
          <VoiceInterface 
            onTranscription={handleVoiceTranscription}
            onSpeakText={handleSpeakText}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIPage;
