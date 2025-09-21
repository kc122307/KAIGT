// DeepSeek API Troubleshooting Script
// Run this in the browser console on the /ai page to debug issues

async function debugDeepSeekAPI() {
  console.log("🔍 DeepSeek API Troubleshooting...");
  
  try {
    // Step 1: Check if user is authenticated
    console.log("\n1. Checking authentication...");
    
    // Try to get user avatar or name from the UI
    const userAvatar = document.querySelector('img[alt*="avatar"]') || 
                      document.querySelector('.rounded-full img');
    
    if (userAvatar) {
      console.log("✅ User appears authenticated");
    } else {
      console.log("❌ User may not be authenticated");
      console.log("   Please make sure you're logged in to use AI features");
      return;
    }
    
    // Step 2: Test the Edge Function directly
    console.log("\n2. Testing Edge Function...");
    
    try {
      const response = await fetch('https://gfqgjnytfgnpfiquqixt.supabase.co/functions/v1/ai-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmcWdqbnl0ZmducGZpcXVxaXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMDc0ODgsImV4cCI6MjA2MTc4MzQ4OH0.QHEWlB4k_uka9AZoOHXOCW_tlRahaJcMNY5BAS9yjmI',
          // Note: Missing Authorization header - this should trigger auth error
        },
        body: JSON.stringify({
          message: "Debug test",
          userContext: { goals: [] },
          history: [],
          requestSuggestions: false
        }),
      });
      
      const data = await response.json();
      
      console.log("Edge Function Response:", {
        status: response.status,
        ok: response.ok,
        data: data
      });
      
      if (!response.ok) {
        console.log("❌ Edge Function Error:", response.status);
        
        if (response.status === 401) {
          console.log("   This is expected - authentication required");
          console.log("   The actual AI Coach component should add auth headers automatically");
        } else if (response.status === 500) {
          console.log("   Internal server error - check Edge Function logs");
        }
      } else {
        console.log("✅ Edge Function responded");
        
        if (data.response.includes("DeepSeek API key")) {
          console.log("❌ DeepSeek API key not configured");
          console.log("   Go to Supabase dashboard and add DEEPSEEK_API_KEY");
        }
      }
      
    } catch (error) {
      console.log("❌ Edge Function request failed:", error);
    }
    
    // Step 3: Check for common issues
    console.log("\n3. Common Issues Checklist:");
    
    const checklist = [
      {
        item: "DeepSeek API Key",
        check: "Go to https://supabase.com/dashboard/project/gfqgjnytfgnpfiquqixt/settings/functions",
        action: "Add DEEPSEEK_API_KEY secret with your API key from https://platform.deepseek.com"
      },
      {
        item: "Edge Function Deployment",
        check: "Run: supabase functions deploy ai-coach",
        action: "Make sure the latest Edge Function code is deployed"
      },
      {
        item: "DeepSeek API Key Format",
        check: "API key should start with 'sk-'",
        action: "Verify your API key from DeepSeek dashboard"
      },
      {
        item: "DeepSeek Credits",
        check: "Check https://platform.deepseek.com/usage",
        action: "Ensure you have remaining free credits"
      },
      {
        item: "Model Name",
        check: "Using 'deepseek-r1' model",
        action: "This should be correct for R1 0528"
      }
    ];
    
    checklist.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.item}`);
      console.log(`      Check: ${item.check}`);
      console.log(`      Action: ${item.action}`);
    });
    
    // Step 4: Provide next steps
    console.log("\n4. Next Steps:");
    console.log("1. Make sure you have a DeepSeek API key from https://platform.deepseek.com");
    console.log("2. Add it to Supabase Edge Functions secrets as DEEPSEEK_API_KEY");
    console.log("3. Deploy the Edge Function: supabase functions deploy ai-coach");
    console.log("4. Test the AI Chat again");
    
    console.log("\n5. Debug Information:");
    console.log("- Current URL:", window.location.href);
    console.log("- User agent:", navigator.userAgent);
    console.log("- Timestamp:", new Date().toISOString());
    
  } catch (error) {
    console.error("❌ Debug script error:", error);
  }
}

// Auto-run the debug script
console.log("🚀 Starting DeepSeek API Debug...");
debugDeepSeekAPI();