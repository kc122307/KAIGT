# Supabase Edge Functions Deployment Script
# This script helps deploy and test the AI-related Edge Functions

Write-Host "🚀 Deploying Supabase Edge Functions..." -ForegroundColor Green

# Check if Supabase CLI is installed
try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI found: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Check if logged in to Supabase
Write-Host "🔐 Checking Supabase authentication..." -ForegroundColor Blue
try {
    supabase projects list 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Not logged in to Supabase. Please run:" -ForegroundColor Red
        Write-Host "   supabase login" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ Authenticated with Supabase" -ForegroundColor Green
} catch {
    Write-Host "❌ Authentication check failed" -ForegroundColor Red
    exit 1
}

# Deploy AI Coach function
Write-Host "📦 Deploying ai-coach function..." -ForegroundColor Blue
try {
    supabase functions deploy ai-coach
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ ai-coach function deployed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to deploy ai-coach function" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error deploying ai-coach function: $_" -ForegroundColor Red
}

# Deploy Voice-to-Text function (if it exists)
if (Test-Path "supabase/functions/voice-to-text") {
    Write-Host "📦 Deploying voice-to-text function..." -ForegroundColor Blue
    try {
        supabase functions deploy voice-to-text
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ voice-to-text function deployed successfully" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to deploy voice-to-text function" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error deploying voice-to-text function: $_" -ForegroundColor Red
    }
} else {
    Write-Host "ℹ️  voice-to-text function not found, skipping..." -ForegroundColor Yellow
}

# Set up environment variables
Write-Host "⚙️  Setting up environment variables..." -ForegroundColor Blue
Write-Host "📝 IMPORTANT: Set up your FREE DeepSeek R1 API key:" -ForegroundColor Yellow
Write-Host "   🚀 DeepSeek offers a generous FREE tier with $5 worth of credits!" -ForegroundColor Green
Write-Host "   
   Step 1: Get your FREE API key" -ForegroundColor Cyan
Write-Host "      1. Visit: https://platform.deepseek.com" -ForegroundColor White
Write-Host "      2. Sign up (no credit card required)" -ForegroundColor White
Write-Host "      3. Create API key in the dashboard" -ForegroundColor White
Write-Host "      4. Copy your key (starts with sk-...)" -ForegroundColor White
Write-Host "   
   Step 2: Configure in Supabase" -ForegroundColor Cyan
Write-Host "      1. Go to: https://supabase.com/dashboard/project/gfqgjnytfgnpfiquqixt/settings/functions" -ForegroundColor White
Write-Host "      2. Add these secrets:" -ForegroundColor White
Write-Host "         - DEEPSEEK_API_KEY: Your DeepSeek API key (from step 1)" -ForegroundColor Yellow
Write-Host "         - SUPABASE_URL: https://gfqgjnytfgnpfiquqixt.supabase.co" -ForegroundColor Gray
Write-Host "         - SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." -ForegroundColor Gray

Write-Host "`n🧪 Testing Edge Function..." -ForegroundColor Blue
Write-Host "Once you've set up the environment variables, test the function:" -ForegroundColor Yellow
Write-Host "1. Open your React app and go to /ai" -ForegroundColor White
Write-Host "2. Open browser developer tools (F12)" -ForegroundColor White
Write-Host "3. Try sending a message in the AI chat" -ForegroundColor White
Write-Host "4. Check the Network tab for the API call to see detailed error information" -ForegroundColor White

Write-Host "`n✅ Deployment script completed!" -ForegroundColor Green
Write-Host "📚 For detailed setup instructions, see: DEEPSEEK_SETUP.md" -ForegroundColor Cyan
Write-Host "`n🎯 Your AI Coach now uses DeepSeek R1 - perfect for intelligent goal coaching!" -ForegroundColor Green
Write-Host "If you still get 401 errors, check the console logs for detailed authentication info." -ForegroundColor Yellow
