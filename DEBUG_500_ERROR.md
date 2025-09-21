# 🚨 **500 Internal Server Error - Complete Debugging Guide**

## 🎯 **Current Issue:**
Your AI Coach is returning **500 Internal Server Error** instead of AI responses. I've added comprehensive logging to help identify the exact problem.

## 🔍 **Enhanced Debugging:**

### ✅ **What I've Added:**

#### **1. Comprehensive Edge Function Logging**
- ✅ **Request logging** - Shows incoming requests and headers
- ✅ **Authentication logging** - Traces user verification process  
- ✅ **Environment variable checking** - Verifies all required settings
- ✅ **DeepSeek API logging** - Detailed API call information
- ✅ **Error handling** - Specific error messages for each failure point

#### **2. Enhanced Client-Side Logging**  
- ✅ **AICoach component** - Traces every step of message sending
- ✅ **GoalSuggestions component** - Logs suggestion generation process
- ✅ **Session management** - Shows authentication token handling
- ✅ **API response logging** - Details about server responses

#### **3. Fixed GSAP Console Spam**
- ✅ **Production-ready error suppression**
- ✅ **Clean console output** for easier debugging

## 🚀 **Step-by-Step Debugging Process:**

### **Step 1: Deploy Updated Edge Function** 🔧
```powershell
# Deploy the function with enhanced logging
supabase functions deploy ai-coach

# Verify deployment
supabase functions list
```

### **Step 2: Check Supabase Environment Variables** ⚙️

1. **Go to Supabase Dashboard:**
   https://supabase.com/dashboard/project/gfqgjnytfgnpfiquqixt/settings/functions

2. **Verify these secrets exist:**
   - ✅ **`DEEPSEEK_API_KEY`** - Your DeepSeek API key (starts with `sk-`)
   - ✅ **`SUPABASE_URL`** - Should be: `https://gfqgjnytfgnpfiquqixt.supabase.co`
   - ✅ **`SUPABASE_ANON_KEY`** - Your anon key

### **Step 3: Test with Enhanced Logging** 🧪

1. **Start your app:** `npm run dev`
2. **Open AI page:** `/ai`
3. **Open DevTools:** F12 → Console tab
4. **Clear console:** Right-click → Clear console
5. **Send test message:** "Help me create a goal"

### **Step 4: Analyze the Logs** 📊

#### **Expected Client-Side Logs:**
```
🚀 AICoach: sendMessage called
💬 AICoach: User message: {length: 23, preview: "Help me create a goal"}
🔄 AICoach: State updated, starting API call...
🔐 AICoach: Getting user session...
✅ AICoach: Using session for AI request: {userId: "...", tokenExists: true, tokenPreview: "..."}
📊 AICoach: Preparing user context...
📋 AICoach: User context prepared: {goalsCount: 0, recentConversationCount: 0}
🚀 AICoach: Making API request to Edge Function...
📊 AICoach: Edge Function response received: {status: 200, statusText: "OK", ok: true}
```

#### **Expected Edge Function Logs (in Supabase):**
```
🚀 AI Coach function started
🔐 Auth header present: true
🔧 Environment check:
- SUPABASE_URL: https://gfqgjnytfgnpfiquqixt.supabase.co
- SUPABASE_ANON_KEY present: true  
- DEEPSEEK_API_KEY present: true
📋 Creating Supabase client...
🔍 Verifying user authentication...
✅ User authenticated successfully: user-id-here
📋 Parsing request body...
🔑 Checking DeepSeek API key...
🤖 Preparing DeepSeek API request...
🚀 Making DeepSeek API call...
📊 DeepSeek API response status: 200 OK
```

## 🔍 **Common 500 Error Causes & Solutions:**

### **1. Missing DeepSeek API Key** ❌
**Log Pattern:**
```
🔧 Environment check:
- DEEPSEEK_API_KEY present: false
```
**Solution:**
- Get API key from https://platform.deepseek.com
- Add to Supabase as `DEEPSEEK_API_KEY` secret
- Redeploy function

### **2. Invalid DeepSeek API Key** ❌  
**Log Pattern:**
```
📊 DeepSeek API response status: 401 Unauthorized
```
**Solution:**
- Verify API key format (should start with `sk-`)
- Check key hasn't expired
- Regenerate key if needed

### **3. DeepSeek Quota Exceeded** ❌
**Log Pattern:**
```  
📊 DeepSeek API response status: 429 Too Many Requests
```
**Solution:**
- Check usage at https://platform.deepseek.com/usage
- Wait for quota reset or add payment method

### **4. Missing Supabase Environment Variables** ❌
**Log Pattern:**
```
🔧 Environment check:
- SUPABASE_URL: NOT SET
- SUPABASE_ANON_KEY present: false
```
**Solution:**
- Add missing environment variables to Edge Function

### **5. Authentication Issues** ❌
**Log Pattern:**
```
📊 Auth verification result:
- User ID: No user
- Auth error: Invalid token
```
**Solution:**
- User needs to log out and back in
- Check session token validity

## 🛠️ **Advanced Debugging:**

### **Check Edge Function Logs Directly:**
1. Go to: https://supabase.com/dashboard/project/gfqgjnytfgnpfiquqixt/functions/ai-coach
2. Click **"Logs"** tab
3. Look for recent error entries
4. Check for specific error messages

### **Test Edge Function Directly:**
```powershell
# Test with Supabase CLI
supabase functions invoke ai-coach \
  --data '{"message":"test"}' \
  --method POST
```

### **Manual API Test:**
```javascript
// Run in browser console on AI page
async function testEdgeFunction() {
  try {
    const response = await fetch('/functions/v1/ai-coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: "test" })
    });
    
    console.log('Response:', response.status, response.statusText);
    const data = await response.text();
    console.log('Data:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testEdgeFunction();
```

## 📱 **Quick Diagnostic Script:**

Copy this into browser console on `/ai` page:
```javascript
// Complete diagnostic script
async function diagnose500Error() {
  console.log("🔍 Diagnosing 500 Error...");
  
  // Check authentication
  const userAvatar = document.querySelector('img[alt*="avatar"]');
  console.log("👤 User authenticated:", !!userAvatar);
  
  // Test AI interface
  const textArea = document.querySelector('textarea');
  const sendButton = document.querySelector('button:has(svg)');
  console.log("🤖 AI interface found:", !!textArea && !!sendButton);
  
  // Check for error messages in UI
  const errorMessages = document.querySelectorAll('[role="alert"]');
  console.log("⚠️ Error messages:", errorMessages.length);
  
  if (textArea) {
    textArea.value = "Test diagnostic message";
    textArea.dispatchEvent(new Event('input', { bubbles: true }));
    console.log("✅ Test message set - now watch Network and Console tabs");
  }
}

diagnose500Error();
```

## ✅ **Success Indicators:**

### **When Fixed, You'll See:**
```
✅ Client logs show successful API call
✅ Edge Function logs show successful DeepSeek API call  
✅ AI Coach responds with intelligent message
✅ No more 500 errors in Network tab
```

### **Successful AI Response:**
```
AI Coach: I'd be happy to help you create a goal! 

Let me guide you through an effective goal-setting framework:

SMART GOAL STRUCTURE:
1. Specific - What exactly do you want to achieve?
2. Measurable - How will you track progress?
3. Achievable - Is this realistic for your situation?
4. Relevant - Does this align with your priorities?
5. Time-bound - When do you want to complete this?

What area would you like to focus on? (productivity, health, career, personal growth, etc.)
```

## 🎯 **Next Steps:**

1. **Deploy the updated function** with enhanced logging
2. **Verify environment variables** in Supabase dashboard
3. **Test the AI chat** and watch console output
4. **Check Edge Function logs** in Supabase for detailed error info
5. **Follow specific solutions** based on log patterns

The enhanced logging will show you **exactly** where the 500 error is occurring! 🚀