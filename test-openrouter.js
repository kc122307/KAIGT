// Test OpenRouter API key directly
const testOpenRouter = async () => {
    console.log('🔑 Testing OpenRouter API directly...');
    
    // Replace 'YOUR_API_KEY_HERE' with your actual OpenRouter API key
    const API_KEY = 'YOUR_API_KEY_HERE'; // ⚠️ REPLACE THIS WITH YOUR ACTUAL KEY
    
    if (API_KEY === 'YOUR_API_KEY_HERE') {
        console.log('❌ Please replace YOUR_API_KEY_HERE with your actual OpenRouter API key');
        return;
    }
    
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://goal-glimpse-achieve.app',
                'X-Title': 'Goal Glimpse AI Coach'
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-r1-0528:free',
                messages: [
                    { role: 'user', content: 'Hello, this is a test message' }
                ],
                max_tokens: 100,
                temperature: 0.7
            }),
        });
        
        console.log('📊 OpenRouter Response Status:', response.status);
        console.log('📊 OpenRouter Response Headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('📄 Raw OpenRouter Response:', responseText);
        
        if (!response.ok) {
            console.error('❌ OpenRouter API Error');
            return;
        }
        
        const jsonData = JSON.parse(responseText);
        console.log('✅ OpenRouter Success:', jsonData);
        
        if (jsonData.choices && jsonData.choices[0]?.message?.content) {
            console.log('🤖 AI Response:', jsonData.choices[0].message.content);
        }
        
    } catch (error) {
        console.error('❌ OpenRouter Network Error:', error);
    }
};

testOpenRouter();