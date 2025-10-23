# Environment Variables Setup

This guide will help you configure the necessary environment variables for PromptTrim.

## Required Environment Variables

Create a `.env` file in the root of the project with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Gemini AI Configuration
VITE_GEMINI_API_KEY=AIzaSyBn7zHmeXe54sTv9UKV-4vDBt446yXJ5a0
```

## Setup Instructions

### 1. Create the .env file

```bash
# Copy the example and edit it
cp .env.example .env
```

Or create it manually:

**Windows (PowerShell):**
```powershell
New-Item -Path .env -ItemType File
```

**Mac/Linux:**
```bash
touch .env
```

### 2. Add Your Credentials

Open the `.env` file in a text editor and add:

- **VITE_SUPABASE_URL**: Your Supabase project URL (found in Supabase Dashboard → Settings → API)
- **VITE_SUPABASE_ANON_KEY**: Your Supabase anonymous key (found in same location)
- **VITE_GEMINI_API_KEY**: Already provided: `AIzaSyBn7zHmeXe54sTv9UKV-4vDBt446yXJ5a0`

### 3. Restart the Dev Server

After adding the environment variables, restart your development server:

```bash
npm run dev
```

## Features

### AI-Powered Optimization (Gemini API)

When `VITE_GEMINI_API_KEY` is configured:
- ✅ Uses Google Gemini Pro for intelligent prompt optimization
- ✅ Better understanding of context and meaning
- ✅ More accurate optimization results
- ✅ Shows "AI-Powered Optimization Enabled" banner in the UI

### Fallback Mode (Without Gemini)

If the Gemini API key is missing or invalid:
- ⚠️ Falls back to regex-based local optimization
- ⚠️ Works offline but less intelligent
- ⚠️ No AI banner shown in the UI

## Security Notes

- ✅ The `.env` file is already added to `.gitignore`
- ✅ Never commit API keys to version control
- ✅ API keys are only exposed in the browser (client-side)
- ⚠️ For production, consider using a backend proxy to hide API keys

## Troubleshooting

### "Gemini API is not configured" error
- Check that `VITE_GEMINI_API_KEY` is in your `.env` file
- Ensure the `.env` file is in the project root (same level as `package.json`)
- Restart the dev server after adding environment variables

### Changes not taking effect
- Environment variables are loaded at build time
- You must restart `npm run dev` after changing `.env`
- Clear browser cache if issues persist

## Testing the Integration

1. Start the dev server: `npm run dev`
2. Look for the purple "AI-Powered Optimization Enabled" banner
3. Try optimizing a prompt
4. Check the browser console for any Gemini API errors

