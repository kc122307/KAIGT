import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Updated: Use DEEPSEEK_API_KEY as the environment variable name
const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userContext, history, requestSuggestions } = await req.json();

    // Updated: Check for the new deepseekApiKey
    if (!deepseekApiKey) {
      return new Response(
        JSON.stringify({ 
          response: "I'm your AI productivity coach! However, I need a DeepSeek API key to provide personalized responses. Please configure your API key in the edge function settings.",
          suggestions: {}
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build context-aware prompt
    let contextPrompt = 'You are a helpful AI productivity coach. Provide practical, actionable advice about goal setting, time management, productivity, and personal development.';
    
    if (userContext?.goals && userContext.goals.length > 0) {
      contextPrompt += `\n\nUser's current goals:\n${userContext.goals.map(g => 
        `- ${g.title} (${g.category}, ${g.status}, ${g.progress}% complete)`
      ).join('\n')}`;
    }

    if (requestSuggestions) {
      contextPrompt += `\n\nBased on the user's message and current goals, also provide contextual suggestions in your response. After your main response, analyze if you should suggest:
      1. New goals that align with their interests/challenges
      2. A different coaching mode that might help them better
      3. A helpful template for planning or organization
      
      Be selective - only suggest when truly relevant to the conversation.`;
    }

    const messages = [
      { role: 'system', content: contextPrompt },
      ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'assistant', content: h.content })),
      { role: 'user', content: message }
    ];

    // Updated: Change the fetch URL to DeepSeek's endpoint
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        // Updated: Use the new deepseekApiKey for authorization
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Updated: Change the model to a DeepSeek model
        model: 'deepseek-chat', 
        messages,
        max_tokens: 600,
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

    // Generate contextual suggestions based on the conversation
    let suggestions = {};
    
    if (requestSuggestions) {
      const suggestionPrompt = `Based on this conversation and the user's current goals, provide ONLY a JSON response with contextual suggestions. Be selective - only suggest when truly relevant:

User message: "${message}"
AI response: "${aiResponse}"
Current goals: ${userContext?.goals ? JSON.stringify(userContext.goals) : 'None'}

Return JSON in this exact format (omit sections if not relevant):
{
  "goals": [{"title": "Goal Title", "description": "Brief description", "category": "Personal|Work|Health|Education|Finance|Social", "difficulty": "Easy|Medium|Hard"}],
  "mode": {"id": "mode-id", "name": "Mode Name", "description": "Brief description"},
  "template": {"id": "template-id", "title": "Template Title", "description": "Brief description"}
}`;

      try {
        // Updated: Change the fetch URL to DeepSeek's endpoint
        const suggestionResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            // Updated: Use the new deepseekApiKey for authorization
            'Authorization': `Bearer ${deepseekApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // Updated: Change the model to a DeepSeek model
            model: 'deepseek-chat',
            messages: [{ role: 'user', content: suggestionPrompt }],
            max_tokens: 300,
          }),
        });

        const suggestionData = await suggestionResponse.json();
        const suggestionContent = suggestionData.choices?.[0]?.message?.content;
        
        if (suggestionContent) {
          try {
            suggestions = JSON.parse(suggestionContent);
          } catch (e) {
            console.log('Failed to parse suggestions JSON:', e);
          }
        }
      } catch (e) {
        console.log('Failed to generate suggestions:', e);
      }
    }

    return new Response(
      JSON.stringify({ response: aiResponse, suggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ai-coach function:', error);
    return new Response(
      JSON.stringify({ 
        response: "I apologize, but I'm having trouble responding right now. Please try again later.",
        suggestions: {}
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});