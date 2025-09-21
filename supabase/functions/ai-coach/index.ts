import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Initialize Supabase client for server-side authentication
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

// Updated: Use DEEPSEEK_API_KEY as the environment variable name
const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 AI Coach function started');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight request handled');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the Authorization header
    const authHeader = req.headers.get('Authorization');
    console.log('🔐 Auth header present:', !!authHeader);
    console.log('🔐 Auth header preview:', authHeader ? authHeader.substring(0, 20) + '...' : 'Not provided');
    
    if (!authHeader) {
      console.log('❌ No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log environment variables (safely)
    console.log('🔧 Environment check:');
    console.log('- SUPABASE_URL:', supabaseUrl || 'NOT SET');
    console.log('- SUPABASE_ANON_KEY present:', !!supabaseAnonKey);
    console.log('- DEEPSEEK_API_KEY present:', !!deepseekApiKey);
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('❌ Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error - missing Supabase credentials' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create a Supabase client with the user's JWT
    console.log('📋 Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // Verify the user is authenticated
    console.log('🔍 Verifying user authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('📊 Auth verification result:');
    console.log('- User ID:', user?.id || 'No user');
    console.log('- Auth error:', authError?.message || 'None');
    
    if (authError || !user) {
      console.log('❌ Authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Authentication failed', details: authError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('✅ User authenticated successfully:', user.id);

    // Parse request body
    console.log('📋 Parsing request body...');
    let message, userContext, history, requestSuggestions;
    
    try {
      const requestBody = await req.json();
      console.log('📊 Request body parsed:', {
        hasMessage: !!requestBody.message,
        messageLength: requestBody.message?.length || 0,
        hasUserContext: !!requestBody.userContext,
        goalsCount: requestBody.userContext?.goals?.length || 0,
        historyLength: requestBody.history?.length || 0,
        requestSuggestions: !!requestBody.requestSuggestions
      });
      
      ({ message, userContext, history, requestSuggestions } = requestBody);
      
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        console.log('❌ Invalid message provided:', message);
        return new Response(
          JSON.stringify({ error: 'Invalid or empty message provided' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
    } catch (parseError) {
      console.log('❌ Request body parsing failed:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for DeepSeek API key (free tier available)
    console.log('🔑 Checking DeepSeek API key...');
    if (!deepseekApiKey) {
      return new Response(
        JSON.stringify({ 
          response: "I'm your AI productivity coach! However, I need a DeepSeek API key to provide personalized responses. Good news: DeepSeek offers a generous FREE tier! Get your free API key at https://platform.deepseek.com and configure it in the edge function settings.",
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

    // Make DeepSeek API call
    console.log('🤖 Preparing DeepSeek API request...');
    console.log('📊 Request details:', {
      model: 'deepseek-r1',
      messageCount: messages.length,
      maxTokens: 600,
      temperature: 0.7,
      hasApiKey: !!deepseekApiKey,
      apiKeyPrefix: deepseekApiKey ? deepseekApiKey.substring(0, 10) + '...' : 'None'
    });
    
    console.log('📝 Messages structure:', messages.map((msg, i) => ({
      index: i,
      role: msg.role,
      contentLength: msg.content.length,
      preview: msg.content.substring(0, 50) + (msg.content.length > 50 ? '...' : '')
    })));
    
    let response;
    try {
      console.log('🚀 Making DeepSeek API call...');
      response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${deepseekApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-r1',
          messages,
          max_tokens: 600,
          temperature: 0.7,
          stream: false
        }),
      });
      
      console.log('📊 DeepSeek API response status:', response.status, response.statusText);
      
    } catch (fetchError) {
      console.log('❌ DeepSeek API fetch failed:', fetchError);
      return new Response(
        JSON.stringify({ 
          response: `Network error: ${fetchError.message}. Please check your internet connection and try again.`,
          suggestions: {},
          debug: { error: 'fetch_failed', details: fetchError.message }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    // Enhanced error logging for debugging
    if (!response.ok) {
      console.error('DeepSeek API Error:', {
        status: response.status,
        statusText: response.statusText,
        data: data,
        model: 'deepseek-r1',
        apiKeyExists: !!deepseekApiKey,
        apiKeyPrefix: deepseekApiKey ? deepseekApiKey.substring(0, 10) + '...' : 'Not set'
      });
      
      return new Response(
        JSON.stringify({ 
          response: `DeepSeek API Error (${response.status}): ${data.error?.message || response.statusText}. Please check your API configuration.`,
          suggestions: {},
          debug: {
            status: response.status,
            error: data.error?.message || 'Unknown error',
            model: 'deepseek-r1',
            hasApiKey: !!deepseekApiKey
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('DeepSeek API Success:', {
      model: 'deepseek-r1',
      responseLength: data.choices?.[0]?.message?.content?.length || 0,
      usage: data.usage
    });
    
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
            // Using DeepSeek R1 0528 for suggestions  
            model: 'deepseek-r1',
            messages: [{ role: 'user', content: suggestionPrompt }],
            max_tokens: 300,
            temperature: 0.5,
            stream: false
          }),
        });

        const suggestionData = await suggestionResponse.json();
        
        if (!suggestionResponse.ok) {
          console.error('DeepSeek Suggestions API Error:', {
            status: suggestionResponse.status,
            data: suggestionData
          });
        }
        
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