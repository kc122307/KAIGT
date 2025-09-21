// Direct OpenRouter API integration as fallback
export interface OpenRouterRequest {
  message: string;
  userContext?: {
    goals: Array<{
      title: string;
      category: string;
      status: string;
      progress: number;
    }>;
    personality?: string;
  };
  history: Array<{
    role: 'user' | 'ai';
    content: string;
  }>;
}

export interface OpenRouterResponse {
  response: string;
  suggestions: {
    goals?: Array<any>;
    mode?: any;
    template?: any;
  };
}

// Get OpenRouter API key from environment variables (try multiple possible names)
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || import.meta.env.DEEPSEEK_API_KEY;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const callOpenRouterDirectly = async (request: OpenRouterRequest): Promise<OpenRouterResponse> => {
  console.log('🔑 Calling OpenRouter directly from frontend...');
  
  if (!OPENROUTER_API_KEY) {
    throw new Error('Missing OpenRouter API key. Please check your Vercel environment variables: DEEPSEEK_API_KEY');
  }
  
  // Build context-aware prompt with personality
  let contextPrompt = request.userContext?.personality || 'You are a helpful AI productivity coach. Provide practical, actionable advice about goal setting, time management, productivity, and personal development.';
  
  if (request.userContext?.goals && request.userContext.goals.length > 0) {
    contextPrompt += `\n\nUser's current goals:\n${request.userContext.goals.map(g => 
      `- ${g.title} (${g.category}, ${g.status}, ${g.progress}% complete)`
    ).join('\n')}`;
  }

  const messages = [
    { role: 'system', content: contextPrompt },
    ...request.history.map(h => ({ role: h.role === 'user' ? 'user' : 'assistant', content: h.content })),
    { role: 'user', content: request.message }
  ];

  // Try multiple models with retry logic
  const models = [
    'meta-llama/llama-3.2-3b-instruct:free',
    'microsoft/wizardlm-2-8x22b:free',
    'deepseek/deepseek-r1-0528:free'
  ];
  
  for (let modelIndex = 0; modelIndex < models.length; modelIndex++) {
    const model = models[modelIndex];
    
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`🚀 Attempt ${attempt}/2 with model: ${model}`);
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://goal-glimpse-achieve.app',
            'X-Title': 'Goal Glimpse AI Coach'
          },
          body: JSON.stringify({
            model,
            messages,
            max_tokens: 600,
            temperature: 0.7,
            stream: false
          }),
        });

        console.log(`📊 ${model} Response Status:`, response.status);

        if (response.status === 429) {
          console.log(`⏳ Rate limited on ${model}, attempt ${attempt}`);
          if (attempt < 2) {
            const delay = attempt * 2000; // 2s, 4s delay
            console.log(`🔄 Waiting ${delay}ms before retry...`);
            await sleep(delay);
            continue; // Try again
          } else {
            console.log(`🔄 Max retries reached for ${model}, trying next model...`);
            break; // Try next model
          }
        }
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error(`❌ ${model} API Error:`, errorData);
          if (modelIndex === models.length - 1) {
            throw new Error(`OpenRouter API Error (${response.status}): ${errorData.error?.message || response.statusText}`);
          }
          break; // Try next model
        }

        const data = await response.json();
        console.log(`✅ ${model} Success:`, data);

        const aiResponse = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
        
        if (aiResponse && aiResponse !== 'Sorry, I could not generate a response.') {
          console.log(`🎉 Got valid response from ${model}:`, aiResponse.substring(0, 100) + '...');
          
          // For now, return empty suggestions - you can enhance this later
          const suggestions = {};

          return {
            response: aiResponse,
            suggestions
          };
        }
        
      } catch (error) {
        console.error(`❌ Error with ${model}, attempt ${attempt}:`, error);
        if (modelIndex === models.length - 1 && attempt === 2) {
          throw error; // Last model, last attempt
        }
        // Continue to next attempt or model
      }
    }
  }
  
  throw new Error('All models exhausted or rate limited. Please try again later.');
};
