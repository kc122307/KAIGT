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

// Get OpenRouter API key from environment variables - try multiple possible names
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || 
                          import.meta.env.DEEPSEEK_API_KEY ||
                          import.meta.env.VITE_DEEPSEEK_API_KEY ||
                          ''; // fallback

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const callOpenRouterDirectly = async (request: OpenRouterRequest): Promise<OpenRouterResponse> => {
  console.log('🔑 Calling OpenRouter directly from frontend...');
  
  console.log('DEBUG: OpenRouter API Key resolved:', {
    OPENROUTER_API_KEY: OPENROUTER_API_KEY ? 'SET (length: ' + OPENROUTER_API_KEY.length + ')' : 'NOT SET',
    'import.meta.env.VITE_OPENROUTER_API_KEY': import.meta.env.VITE_OPENROUTER_API_KEY ? 'SET' : 'NOT SET',
    'import.meta.env.DEEPSEEK_API_KEY': import.meta.env.DEEPSEEK_API_KEY ? 'SET' : 'NOT SET'
  });
  
  if (!OPENROUTER_API_KEY) {
    console.error('OpenRouter API key check - available env keys:', Object.keys(import.meta.env));
    throw new Error('Missing OpenRouter API key. Available environment keys: ' + Object.keys(import.meta.env).join(', '));
  }
  
  // Build context-aware prompt with personality and premium formatting instructions
  let contextPrompt = `You are a modern AI Coach assistant.

Your responses must feel clean, premium, minimal, and human.

Formatting Rules:
- NEVER use markdown formatting symbols (no \`**\` for bolding, no \`*\` or \`-\` for bullet lists, no \`###\` or \`##\` for headings, and no horizontal rules like \`***\`).
- The UI renders your response as plain text, so raw markdown tags look like broken code.
- Use simple capitalization or plain text on a single line (with newlines before and after) to divide sections.
- Instead of bullet points, write separate actions as short paragraphs separated by clean line breaks.
- Avoid robotic, generic heading cards (instead of "Week 1: Foundations", use a clean label like "Days 1–7" or "Week 1" on its own line with nice spacing).
- Prefer numbered progression, day ranges, or weekly phases for roadmaps instead of bulleted lists.
- Use short readable sections and spacing intentionally to create a card-like layout.
- Keep paragraphs small and sentences concise, but highly actionable and detailed enough to be useful.

Response Style:
- Write naturally and confidently
- Use concise sentences
- Make the plan actionable immediately. When a user requests a timeline or roadmap, provide a structured plan with specific weekly or day-by-day actions.
- Focus on clarity over quantity, but do not sacrifice necessary details or steps
- Every section should feel useful
- Avoid repeating the user's goal unnecessarily

Preferred Structure:
- Goal understanding
- Clear roadmap (detailed progression by days or weeks)
- Daily actions
- Milestones
- Final outcome

UI/Text Presentation Rules:
- Use clean section titles in plain text
- Keep paragraphs small
- Use emojis minimally and only when useful
- Never create huge markdown walls
- Avoid nested lists
- Avoid excessive indentation
- Keep the response mobile-friendly

Tone:
- Modern, Minimal, Premium, Human, Helpful, Direct.

The response should feel like:
- Notion AI
- Apple-style writing
- High-end coaching app
- Calm and intelligent assistant

Do not generate generic AI-style formatting. Refer to these examples:
Bad: "### Days 1-7: Foundations" with "**Your Focus:** ..." and bullets
Good:
Days 1-7
Foundations

Focus on getting comfortable with movement. 
Practice 15 minutes daily by copying simple movements from dance videos. Do not worry about perfection.

Bad: "Daily practice: 20 minutes"
Good: "Practice 20 minutes daily. Consistency matters more than long sessions."`;

  if (request.userContext?.personality) {
    contextPrompt += `\n\nActive personality focus: ${request.userContext.personality}`;
  } else {
    contextPrompt += `\n\nActive personality focus: You are a helpful AI productivity coach. Provide practical, actionable advice about goal setting, time management, productivity, and personal development.`;
  }
  
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
    'meta-llama/llama-3.3-70b-instruct:free',
    'qwen/qwen-2.5-72b-instruct:free',
    'google/gemini-2.5-flash',
    'meta-llama/llama-3.2-3b-instruct:free',
    'openrouter/free'
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
            max_tokens: 1500,
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
        console.log(`📄 Resolved payload JSON:`, JSON.stringify(data));
        
        if (data.error) {
          console.error(`❌ OpenRouter JSON Error for ${model}:`, data.error);
          throw new Error(`OpenRouter Error: ${data.error.message || JSON.stringify(data.error)}`);
        }

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
