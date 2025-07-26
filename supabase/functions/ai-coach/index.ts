
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CoachRequest {
  message: string;
  context?: {
    goals?: any[];
    userProfile?: any;
    recentActivity?: any[];
  };
  type: 'general' | 'goal_breakdown' | 'motivation' | 'procrastination' | 'goal_suggestion';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured. Please add your API key in Supabase settings.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, context, type }: CoachRequest = await req.json();

    let systemPrompt = '';
    
    switch (type) {
      case 'goal_breakdown':
        systemPrompt = `You are an AI productivity coach specializing in breaking down large goals into manageable subtasks. 
        Analyze the goal and provide a structured breakdown with specific, actionable steps. 
        Include timelines and priority levels. Be encouraging and practical.`;
        break;
      case 'motivation':
        systemPrompt = `You are a motivational AI coach. Provide personalized, inspiring advice and quotes. 
        Be supportive, understanding, and help users overcome challenges. Keep responses upbeat but realistic.`;
        break;
      case 'procrastination':
        systemPrompt = `You are an AI coach specializing in overcoming procrastination. 
        Provide practical strategies, identify potential causes, and suggest immediate actionable steps. 
        Be empathetic but firm in your guidance.`;
        break;
      case 'goal_suggestion':
        systemPrompt = `You are an AI coach that suggests SMART goals based on user data. 
        Analyze user habits, past goals, and preferences to recommend specific, measurable, achievable, relevant, and time-bound goals. 
        Consider the user's category preferences and timeline patterns.`;
        break;
      default:
        systemPrompt = `You are an AI productivity coach and goal achievement assistant. 
        Help users with goal setting, motivation, overcoming obstacles, and productivity strategies. 
        Be supportive, practical, and provide actionable advice.`;
    }

    const contextInfo = context ? `
    User Context:
    - Current Goals: ${context.goals ? JSON.stringify(context.goals, null, 2) : 'None provided'}
    - User Profile: ${context.userProfile ? JSON.stringify(context.userProfile, null, 2) : 'None provided'}
    - Recent Activity: ${context.recentActivity ? JSON.stringify(context.recentActivity, null, 2) : 'None provided'}
    
    Use this context to provide more personalized advice.
    ` : '';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: systemPrompt + contextInfo
          },
          { 
            role: 'user', 
            content: message 
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI Coach Response Generated:', { type, message: message.substring(0, 100) });

    return new Response(JSON.stringify({ 
      response: aiResponse,
      type: type 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI coach function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An error occurred while processing your request' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
