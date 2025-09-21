# 🚀 DeepSeek R1 Free Model Setup Guide

## 🎯 Overview
DeepSeek offers powerful AI models including their R1 reasoning model with a **generous FREE tier**! This guide will help you set up the free DeepSeek API for your AI-powered goal coaching app.

## 📈 DeepSeek Free Tier Benefits

### ✅ **What You Get FREE:**
- **$5 worth of free credits** when you sign up
- **Access to R1 models** including the powerful reasoning capabilities
- **High token limits** - much more generous than many competitors
- **Fast response times**
- **No credit card required** for the free tier
- **Multiple model options** including R1-distill and chat models

### 🔥 **Available Models:**
- `deepseek-r1` - R1 0528 reasoning model (FREE - excellent for complex tasks) ⭐
- `deepseek-chat` - General chat model
- `deepseek-coder` - Code-optimized model
- `deepseek-reasoner` - Advanced reasoning capabilities

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Your Free API Key

1. **Visit DeepSeek Platform**: https://platform.deepseek.com
2. **Sign Up** with your email (no credit card needed)
3. **Verify your email** 
4. **Navigate to API Keys** section
5. **Create a New API Key**
   - Click "Create API Key"
   - Give it a name like "Goal Coaching App"
   - Copy the key (starts with `sk-...`)

### Step 2: Configure Supabase Edge Function

1. **Open Supabase Dashboard**: 
   https://supabase.com/dashboard/project/gfqgjnytfgnpfiquqixt/settings/functions

2. **Add Environment Variable**:
   - Click "Add new secret"
   - Name: `DEEPSEEK_API_KEY`
   - Value: Your API key from Step 1 (e.g., `sk-xxx...`)
   - Click "Save"

### Step 3: Deploy Updated Function

Run in your project directory:
```powershell
# Deploy the updated function
supabase functions deploy ai-coach

# Or use the deployment script
.\deploy-edge-functions.ps1
```

### Step 4: Test Your Setup

1. Start your app: `npm run dev`
2. Go to `/ai` page
3. Send a test message like "Help me create a productivity goal"
4. You should get an intelligent response from DeepSeek R1!

## 🎛️ Model Comparison

| Model | Best For | Reasoning | Speed | Free Tier |
|-------|----------|-----------|--------|-----------|
| `deepseek-r1` | R1 0528 - Complex reasoning, planning, analysis | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ FREE |
| `deepseek-chat` | General conversation | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ |
| `deepseek-coder` | Code generation | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ |

## 💡 Why R1 is Perfect for Your App

The **DeepSeek R1 model** is excellent for your AI coaching app because:

### 🧠 **Advanced Reasoning**:
- **Goal Analysis**: Can break down complex goals into actionable steps
- **Context Understanding**: Remembers previous conversations and goals
- **Strategic Planning**: Provides intelligent scheduling and priority recommendations
- **Problem Solving**: Helps users overcome obstacles and challenges

### 🎯 **Coaching Capabilities**:
- **Personalized Advice**: Adapts responses based on user's goal history
- **Motivational Support**: Provides encouragement and maintains engagement
- **Progress Tracking**: Analyzes patterns and suggests improvements
- **Template Generation**: Creates custom planning templates

## 📊 Usage Monitoring

### Free Tier Limits:
- **Monthly Credits**: $5 worth (approximately 2-5 million tokens)
- **Rate Limits**: 60 requests per minute
- **Model Access**: All models including R1
- **No Expiration**: Credits don't expire monthly

### Monitor Your Usage:
1. Go to: https://platform.deepseek.com/usage
2. Check your current credit usage
3. Set up usage alerts if needed

## 🔧 Advanced Configuration

### Custom Model Parameters:
The current setup uses:
```javascript
{
  model: 'deepseek-r1',     // R1 0528 - Latest reasoning model
  temperature: 0.7,         // Balanced creativity
  max_tokens: 600,          // Detailed responses
  stream: false             // Simple request/response
}
```

### Alternative Models:
If you want to try different models, update the Edge Function:

```javascript
// For faster responses
model: 'deepseek-chat'

// For code-related goals
model: 'deepseek-coder'

// For maximum reasoning
model: 'deepseek-reasoner'
```

## 🚨 Troubleshooting

### Common Issues:

**❌ "Invalid API Key"**
- Double-check the key in Supabase secrets
- Ensure no extra spaces or characters
- Regenerate key if needed

**❌ "Rate Limited"**
- Free tier: 60 requests/minute
- Wait a minute and try again
- Consider upgrading if you hit limits frequently

**❌ "Insufficient Credits"**
- Check usage at https://platform.deepseek.com/usage
- Free tier gives $5 worth of credits
- Add payment method for more credits if needed

## 🔄 Migration from Other Models

If you were using other AI models before:

### From OpenAI:
- DeepSeek API is compatible with OpenAI format
- Similar request/response structure
- Often better reasoning capabilities
- Much more generous free tier

### From Anthropic Claude:
- DeepSeek R1 offers similar reasoning
- Better for mathematical and analytical tasks
- More cost-effective

## 📈 Upgrading Later

When you're ready to scale:
- **Pay-as-you-go**: Only pay for what you use
- **Much cheaper than competitors**: ~90% less cost than GPT-4
- **Higher rate limits**: Up to 10,000 RPM
- **Priority support**: Faster response times

## 🎉 Success! 

Once configured, your AI coaching app will have:
- ✅ Intelligent goal suggestions
- ✅ Personalized coaching advice
- ✅ Context-aware conversations
- ✅ Smart templates and planning
- ✅ All powered by DeepSeek's R1 reasoning!

---

## 📞 Need Help?

- **DeepSeek Documentation**: https://platform.deepseek.com/api-docs
- **DeepSeek Discord**: Join their community for support
- **Your App Console**: Check browser dev tools for detailed error messages

Happy coaching! 🎯