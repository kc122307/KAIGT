
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VoiceInterfaceProps {
  onTranscription: (text: string) => void;
  onSpeakText: (text: string) => void;
}

export const VoiceInterface = ({ onTranscription, onSpeakText }: VoiceInterfaceProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudioForTranscription(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Simulate audio level changes
      const levelInterval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);

      setTimeout(() => {
        clearInterval(levelInterval);
        setAudioLevel(0);
      }, 10000);

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
    }
  };

  const processAudioForTranscription = async (audioBlob: Blob) => {
    try {
      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please log in to use voice transcription.",
          variant: "destructive",
        });
        return;
      }
      
      // Convert blob to base64 for API call
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const audioData = base64Audio.split(',')[1];

        // Call voice-to-text API
        const response = await fetch('https://gfqgjnytfgnpfiquqixt.supabase.co/functions/v1/voice-to-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmcWdqbnl0ZmducGZpcXVxaXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMDc0ODgsImV4cCI6MjA2MTc4MzQ4OH0.QHEWlB4k_uka9AZoOHXOCW_tlRahaJcMNY5BAS9yjmI',
          },
          body: JSON.stringify({ audio: audioData }),
        });

        if (response.ok) {
          const data = await response.json();
          onTranscription(data.text);
        } else {
          throw new Error('Transcription failed');
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "Transcription Error",
        description: "Could not process audio. Please try again.",
        variant: "destructive",
      });
    }
  };

  const speakText = async (text: string) => {
    if (isSpeaking) return;
    
    setIsSpeaking(true);
    
    try {
      // Use Web Speech API for text-to-speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
        toast({
          title: "Speech Error",
          description: "Could not speak text. Please try again.",
          variant: "destructive",
        });
      };
      
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error speaking text:', error);
      setIsSpeaking(false);
      toast({
        title: "Speech Error",
        description: "Text-to-speech is not available in your browser.",
        variant: "destructive",
      });
    }
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Voice Interface
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Recording Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={isRecording ? "destructive" : "default"}
              size="lg"
              onClick={isRecording ? stopRecording : startRecording}
              className="flex items-center gap-2"
            >
              {isRecording ? (
                <>
                  <MicOff className="h-5 w-5" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5" />
                  Start Recording
                </>
              )}
            </Button>
            
            <Button
              variant={isSpeaking ? "destructive" : "outline"}
              size="lg"
              onClick={isSpeaking ? stopSpeaking : () => speakText("Hello! I'm your AI assistant. How can I help you today?")}
              className="flex items-center gap-2"
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="h-5 w-5" />
                  Stop Speaking
                </>
              ) : (
                <>
                  <Volume2 className="h-5 w-5" />
                  Test Voice
                </>
              )}
            </Button>
          </div>

          {/* Audio Level Indicator */}
          {isRecording && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Audio Level</span>
                <span>{Math.round(audioLevel)}%</span>
              </div>
              <Progress value={audioLevel} className="h-2" />
            </div>
          )}

          {/* Instructions */}
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Click "Start Recording" to speak your question</p>
            <p>• Recording will automatically stop after 10 seconds</p>
            <p>• Use "Test Voice" to hear how AI responses will sound</p>
            <p>• Voice features work best in quiet environments</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
