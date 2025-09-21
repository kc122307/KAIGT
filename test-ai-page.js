// Test script to verify AI Page functionality
// This script can be run in the browser console to test the AI Page

console.log("🧪 Testing AI Page Functionality...");

// Test 1: Check if AI components are properly imported
console.log("\n1. Testing component imports...");
try {
  const aiPageElement = document.querySelector('[data-testid="ai-page"]') || document.querySelector('.space-y-6');
  if (aiPageElement) {
    console.log("✅ AI Page container found");
  } else {
    console.log("❌ AI Page container not found");
  }
} catch (error) {
  console.log("❌ Error finding AI Page:", error);
}

// Test 2: Check if tabs are working
console.log("\n2. Testing tab functionality...");
try {
  const tabs = document.querySelectorAll('[role="tab"]');
  if (tabs.length > 0) {
    console.log(`✅ Found ${tabs.length} tabs`);
    tabs.forEach((tab, index) => {
      console.log(`   Tab ${index + 1}: ${tab.textContent?.trim()}`);
    });
  } else {
    console.log("❌ No tabs found");
  }
} catch (error) {
  console.log("❌ Error checking tabs:", error);
}

// Test 3: Check if AI Coach input is present
console.log("\n3. Testing AI Coach interface...");
try {
  const textArea = document.querySelector('textarea[placeholder*="Ask your AI coach"]');
  const sendButton = document.querySelector('button[disabled]') || document.querySelector('button:has(svg)');
  
  if (textArea) {
    console.log("✅ AI Coach input field found");
  } else {
    console.log("❌ AI Coach input field not found");
  }
  
  if (sendButton) {
    console.log("✅ Send button found");
  } else {
    console.log("❌ Send button not found");
  }
} catch (error) {
  console.log("❌ Error checking AI Coach interface:", error);
}

// Test 4: Check for console errors
console.log("\n4. Checking for console errors...");
const originalError = console.error;
let errorCount = 0;
console.error = (...args) => {
  errorCount++;
  originalError.apply(console, args);
};

setTimeout(() => {
  console.error = originalError;
  if (errorCount === 0) {
    console.log("✅ No console errors detected");
  } else {
    console.log(`❌ Found ${errorCount} console errors`);
  }
}, 1000);

// Test 5: Check authentication state
console.log("\n5. Testing authentication state...");
// This would need to be run after the app loads
setTimeout(() => {
  try {
    const authButton = document.querySelector('button:has([data-testid="user-menu"])') || 
                     document.querySelector('[role="button"]:has(img[alt*="avatar"])');
    
    if (authButton) {
      console.log("✅ User appears to be authenticated");
    } else {
      console.log("❌ User might not be authenticated or avatar not found");
    }
  } catch (error) {
    console.log("❌ Error checking authentication:", error);
  }
}, 2000);

console.log("\n🎯 AI Page functionality test completed!");
console.log("To run this test, copy and paste this script into your browser console while on the AI page.");