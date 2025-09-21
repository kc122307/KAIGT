// Test script to check AI Coach Edge Function
const testAIFunction = async () => {
    console.log('🧪 Testing AI Coach Edge Function...');
    
    try {
        const response = await fetch('https://gfqgjnytfgnpfiquqixt.supabase.co/functions/v1/ai-coach', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token', // This will fail auth but show us the response format
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmcWdqbnl0ZmducGZpcXVxaXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMDc0ODgsImV4cCI6MjA2MTc4MzQ4OH0.QHEWlB4k_uka9AZoOHXOCW_tlRahaJcMNY5BAS9yjmI',
            },
            body: JSON.stringify({
                message: 'Hello AI Coach, this is a test message',
                userContext: { goals: [] },
                history: [],
                requestSuggestions: true
            }),
        });
        
        console.log('📊 Response Status:', response.status);
        console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('📄 Raw Response:', responseText);
        
        try {
            const jsonData = JSON.parse(responseText);
            console.log('✅ Parsed JSON:', jsonData);
        } catch (e) {
            console.error('❌ Failed to parse JSON:', e.message);
        }
        
    } catch (error) {
        console.error('❌ Network Error:', error);
    }
};

testAIFunction();