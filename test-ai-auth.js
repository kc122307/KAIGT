// AI Authentication Test Script
// Run this in the browser console while on the AI page

async function testAIAuthentication() {
  console.log("🧪 Testing AI Authentication...");
  
  try {
    // Test 1: Check if Supabase client is available
    if (typeof window.supabase === 'undefined') {
      console.log("ℹ️  Direct supabase client not found, checking import...");
      
      // Try to get session using the components method
      const testSession = async () => {
        try {
          // This will work if we're on the AI page and components are loaded
          const aiCoachElement = document.querySelector('textarea[placeholder*="Ask your AI coach"]');
          if (aiCoachElement) {
            console.log("✅ AI Coach component found");
            return true;
          }
          return false;
        } catch (error) {
          console.error("Error finding AI components:", error);
          return false;
        }
      };
      
      const componentFound = await testSession();
      if (!componentFound) {
        console.log("❌ AI components not found. Make sure you're on the /ai page.");
        return;
      }
    }
    
    // Test 2: Check authentication state from the store
    console.log("\n2. Checking authentication state...");
    
    // Look for user avatar or auth indicators
    const userAvatar = document.querySelector('img[alt*="avatar"]') || 
                      document.querySelector('[role="button"] img') ||
                      document.querySelector('.rounded-full img');
    
    if (userAvatar) {
      console.log("✅ User appears to be authenticated (avatar found)");
      console.log("   Avatar src:", userAvatar.src);
    } else {
      console.log("❌ User authentication unclear (no avatar found)");
    }
    
    // Test 3: Manual session test (if possible)
    console.log("\n3. Testing manual API call...");
    
    // Create a test function to call the AI API
    const testAIAPI = async () => {
      try {
        const response = await fetch('https://gfqgjnytfgnpfiquqixt.supabase.co/functions/v1/ai-coach', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmcWdqbnl0ZmducGZpcXVxaXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMDc0ODgsImV4cCI6MjA2MTc4MzQ4OH0.QHEWlB4k_uka9AZoOHXOCW_tlRahaJcMNY5BAS9yjmI',
            // Note: Authorization header will be added by the component when user is authenticated
          },
          body: JSON.stringify({
            message: "Test message",
            userContext: { goals: [] },
            history: [],
            requestSuggestions: false
          }),
        });
        
        console.log("API Response Status:", response.status);
        console.log("API Response Headers:", Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
          const data = await response.json();
          console.log("✅ API call successful:", data);
        } else {
          const errorText = await response.text();
          console.log("❌ API call failed:", {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });
          
          if (response.status === 401) {
            console.log("🔐 This is expected - the function requires user authentication");
            console.log("   The actual component will add the Authorization header automatically");
          }
        }
        
      } catch (error) {
        console.error("❌ API test error:", error);
      }
    };
    
    await testAIAPI();
    
    // Test 4: Check console errors
    console.log("\n4. Checking for console errors...");
    const originalError = console.error;
    let errorCount = 0;
    const errors = [];
    
    console.error = (...args) => {
      errorCount++;
      errors.push(args.join(' '));
      originalError.apply(console, args);
    };
    
    setTimeout(() => {
      console.error = originalError;
      if (errorCount === 0) {
        console.log("✅ No new console errors detected");
      } else {
        console.log(`❌ Found ${errorCount} console errors:`);
        errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
      }
    }, 2000);
    
    // Test 5: UI interaction test
    console.log("\n5. Testing UI interactions...");
    
    const sendButton = document.querySelector('button:has(svg)') || 
                      document.querySelector('button[disabled]');
    
    if (sendButton) {
      console.log("✅ Send button found");
      console.log("   Button disabled:", sendButton.disabled);
    } else {
      console.log("❌ Send button not found");
    }
    
    const textArea = document.querySelector('textarea');
    if (textArea) {
      console.log("✅ Text area found");
      console.log("   Placeholder:", textArea.placeholder);
    } else {
      console.log("❌ Text area not found");
    }
    
    console.log("\n🎯 Authentication test completed!");
    console.log("\nNext steps if you're still getting 401 errors:");
    console.log("1. Make sure you're logged in to the app");
    console.log("2. Try refreshing the page");
    console.log("3. Check if the Edge Function is deployed with: supabase functions deploy ai-coach");
    console.log("4. Ensure DEEPSEEK_API_KEY is set in Supabase Edge Function secrets");
    console.log("5. Check browser Network tab for detailed error information");
    
  } catch (error) {
    console.error("❌ Test failed with error:", error);
  }
}

// Run the test
testAIAuthentication();