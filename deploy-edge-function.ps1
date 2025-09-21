# Deploy Edge Function to Supabase
# Run this script to update the ai-coach Edge Function

Write-Host "🚀 Deploying ai-coach Edge Function to Supabase..." -ForegroundColor Green

# Check if supabase CLI is installed
try {
    supabase --version
    Write-Host "✅ Supabase CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Deploy the function
Write-Host "📦 Deploying function..." -ForegroundColor Blue
supabase functions deploy ai-coach

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🔧 The Edge Function should now have the updated API key handling." -ForegroundColor Blue