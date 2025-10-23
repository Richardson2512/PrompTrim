# Gemini AI Integration Guide

## 🎯 Overview

The Gemini API has been successfully integrated into PromptTrim! Your API key is already configured in the codebase.

**API Key**: `AIzaSyBn7zHmeXe54sTv9UKV-4vDBt446yXJ5a0`

## ✅ What Was Added

### 1. New Service: `geminiService.ts`
- Handles all Gemini API communication
- Implements three optimization strategies (minimal, moderate, aggressive)
- Provides fallback detection for missing API keys
- Error handling and logging

### 2. Updated: `promptService.ts`
- Now checks if Gemini is configured
- Uses AI optimization when available
- Falls back to regex-based optimization if not

### 3. Updated: `PromptOptimizer.tsx`
- Displays AI status banner when Gemini is active
- Shows purple "AI-Powered Optimization Enabled" indicator
- Visual feedback for users

### 4. Dependencies Added
- `@google/generative-ai` - Official Google Gemini SDK

## 🚀 Quick Setup

### Windows (PowerShell)
```powershell
# Run the automated setup script
.\setup-env.ps1
```

### Mac/Linux
```bash
# Make executable and run
chmod +x setup-env.sh
./setup-env.sh
```

### Manual Setup
1. Create a `.env` file in the project root
2. Add these lines:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_GEMINI_API_KEY=AIzaSyBn7zHmeXe54sTv9UKV-4vDBt446yXJ5a0
```
3. Restart dev server: `npm run dev`

## 🧪 Testing the Integration

### 1. Visual Confirmation
After starting the app, you should see a purple banner at the top of the Optimize tab:

```
✨ AI-Powered Optimization Enabled
Using Google Gemini for intelligent prompt optimization
```

### 2. Test Optimization
Try optimizing this sample prompt:

**Original:**
```
Please could you very kindly help me with creating a really comprehensive and detailed documentation for my application? I need you to basically include all the important information that would be useful for new developers.
```

**Expected Result:**
The AI should intelligently remove filler words, simplify structure, and reduce tokens by 20-60% depending on the optimization level.

### 3. Check Console
Open browser DevTools (F12) and look for:
- No Gemini-related errors
- Successful API calls
- Token count calculations

## 🎨 Optimization Strategies

### Minimal (10-20% reduction)
- Removes obvious filler words
- Cleans up extra whitespace
- Maintains original structure
- Best for: Already concise prompts

### Moderate (20-35% reduction) ⭐ Recommended
- Removes politeness terms
- Simplifies sentence structures
- Uses common abbreviations
- Best for: Most use cases

### Aggressive (40-60% reduction)
- Maximum compression
- Heavy abbreviation usage
- Removes all non-essential words
- Best for: Cost-critical scenarios

## 📊 How It Works

```
User Input
    ↓
Check if Gemini configured
    ↓
[YES] → Send to Gemini Pro with optimization level
    ↓
Gemini processes with context-aware compression
    ↓
Return optimized text
    ↓
Calculate tokens saved
    ↓
Update analytics & usage
```

## 🔧 Configuration Details

### API Key Location
- **Development**: `.env` file (local only, not committed)
- **Production**: Set in hosting platform environment variables

### Model Used
- **Model**: `gemini-pro`
- **Provider**: Google Generative AI
- **Cost**: Check Google AI pricing

### Request Format
Each optimization sends:
1. System prompt (optimization instructions)
2. User prompt (the text to optimize)
3. Context about optimization level

## 🐛 Troubleshooting

### Issue: "Gemini API is not configured"
**Solution:**
1. Check `.env` file exists in project root
2. Verify `VITE_GEMINI_API_KEY` is set correctly
3. Restart dev server (`npm run dev`)

### Issue: API Key Invalid
**Solution:**
1. Verify the key: `AIzaSyBn7zHmeXe54sTv9UKV-4vDBt446yXJ5a0`
2. Check Google AI Studio for key status
3. Generate a new key if needed

### Issue: No AI banner showing
**Solution:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Check browser console for errors
3. Verify environment variable is loaded: `console.log(import.meta.env.VITE_GEMINI_API_KEY)`

### Issue: Optimization fails
**Fallback:**
The app automatically falls back to regex-based optimization if Gemini fails.

Check console for specific error messages.

## 🔒 Security Considerations

### Current Setup (Client-Side)
- ✅ API key in `.env` (gitignored)
- ⚠️ Key exposed in browser (visible in DevTools)
- ⚠️ Users can see/use your API key
- ✅ OK for development/testing

### Production Recommendations
1. **Backend Proxy**: Create a server endpoint to hide API key
2. **Rate Limiting**: Prevent API abuse
3. **User Quotas**: Enforce per-user limits
4. **Key Rotation**: Regular key updates

### Example Backend Proxy (Node.js)
```javascript
// server/optimize.js
app.post('/api/optimize', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY; // Server-side only
  const { prompt, level } = req.body;
  
  // Call Gemini API server-side
  const result = await optimizeWithGemini(prompt, level, apiKey);
  res.json(result);
});
```

## 📈 Monitoring Usage

### Check API Usage
1. Visit [Google AI Studio](https://makersuite.google.com/)
2. Navigate to API usage dashboard
3. Monitor requests and costs

### Set Alerts
Configure billing alerts in Google Cloud Console to prevent unexpected charges.

## 🎓 Best Practices

1. **Test Before Production**: Verify optimization quality with sample prompts
2. **Monitor Costs**: Keep track of API usage
3. **Set User Limits**: Use the monthly token limits in profiles table
4. **Provide Feedback**: Show users before/after comparisons
5. **Cache Results**: Consider caching optimized prompts to reduce API calls

## 📚 Resources

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Pricing Information](https://ai.google.dev/pricing)
- [API Key Management](https://makersuite.google.com/app/apikey)
- [PromptTrim ENV Setup](./ENV_SETUP.md)

## ✨ What's Next?

The AI integration is complete and ready to use! Just:
1. Set up your `.env` file
2. Start the dev server
3. Look for the purple AI banner
4. Start optimizing prompts with AI! 🚀

---

**Need help?** Check the main [README.md](./README.md) or create an issue.

