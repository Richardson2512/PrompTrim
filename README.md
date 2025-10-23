# PromptTrim 🚀

**AI-Powered Prompt Optimization Platform**

PromptTrim is a SaaS application that helps you optimize AI prompts to reduce token usage and save costs. Using Google Gemini AI, it intelligently compresses prompts while preserving their meaning and intent.

![Tech Stack](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Enabled-green)
![Gemini AI](https://img.shields.io/badge/Gemini-AI%20Powered-purple)

## ✨ Features

- 🤖 **AI-Powered Optimization** - Uses Google Gemini Pro for intelligent prompt compression
- 📊 **Real-time Analytics** - Track tokens saved, cost savings, and compression rates
- 📝 **Prompt History** - Access all your previously optimized prompts
- 🎯 **3 Optimization Levels** - Choose between minimal, moderate, or aggressive optimization
- 💰 **Cost Tracking** - See exactly how much money you're saving
- 🔒 **Secure Authentication** - Built with Supabase Auth
- 📈 **Usage Dashboard** - Monitor your monthly token limits

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: TailwindCSS
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini Pro
- **Build Tool**: Vite
- **Icons**: Lucide React

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Google Gemini API key

### Quick Start

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd project
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

**Option A: Using the setup script (Windows)**
```powershell
.\setup-env.ps1
```

**Option B: Using the setup script (Mac/Linux)**
```bash
chmod +x setup-env.sh
./setup-env.sh
```

**Option C: Manual setup**

Create a `.env` file in the project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Gemini AI Configuration
VITE_GEMINI_API_KEY=AIzaSyBn7zHmeXe54sTv9UKV-4vDBt446yXJ5a0
```

4. **Run database migrations**

Execute the SQL migration file in your Supabase dashboard:
```
supabase/migrations/20251023160623_create_prompttrim_schema.sql
```

5. **Start the development server**
```bash
npm run dev
```

6. **Open your browser**
```
http://localhost:5173
```

## 🎮 Usage

### 1. Create an Account
- Sign up with your email and password
- Your profile is automatically created with a free tier (10,000 tokens/month)

### 2. Optimize Prompts
- Navigate to the "Optimize" tab
- Paste your prompt into the text area
- Select an optimization level:
  - **Minimal**: Light cleanup, 10-20% reduction
  - **Moderate**: Balanced optimization, 20-35% reduction (recommended)
  - **Aggressive**: Maximum compression, 40-60% reduction
- Click "Optimize" and watch the magic happen! ✨

### 3. View Analytics
- Check the "Analytics" tab for comprehensive stats
- See total tokens saved, cost savings, and compression rates
- View daily activity breakdown

### 4. Access History
- Browse all your optimized prompts in the "History" tab
- Copy optimized prompts with one click
- Expand to see original vs. optimized comparison

## 🧠 How It Works

### AI-Powered Mode (Gemini API Configured)

When the Gemini API key is configured, PromptTrim uses Google's Gemini Pro model to:

1. Analyze the prompt's intent and context
2. Remove unnecessary words while preserving meaning
3. Apply intelligent abbreviations and simplifications
4. Ensure the optimized prompt maintains the original purpose

### Fallback Mode (No API Key)

Without the Gemini API key, the app falls back to regex-based optimization:

- Removes filler words and politeness terms
- Simplifies common phrases
- Applies common abbreviations
- Works completely offline

## 📊 Database Schema

### Tables

- **profiles**: User accounts with subscription tiers and usage limits
- **prompts**: Stores original and optimized prompts with statistics
- **analytics_daily**: Daily aggregated analytics per user
- **api_keys**: API key management (for future external API access)

All tables have Row-Level Security (RLS) enabled for data protection.

## 🔐 Security

- ✅ Row-Level Security (RLS) on all database tables
- ✅ Supabase Auth for authentication
- ✅ Environment variables for sensitive data
- ✅ Users can only access their own data
- ⚠️ API keys are exposed client-side (consider backend proxy for production)

## 📝 Scripts

```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run typecheck    # Type check with TypeScript
```

## 🚀 Deployment

### Environment Setup

Ensure all environment variables are set in your hosting platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GEMINI_API_KEY`

### Build Command
```bash
npm run build
```

### Output Directory
```
dist/
```

### Recommended Platforms
- Vercel
- Netlify
- Railway (as mentioned in user preferences)
- Cloudflare Pages

## 📈 Roadmap

- [ ] External API for programmatic access
- [ ] Subscription management and upgrades
- [ ] Token limit enforcement
- [ ] Support for multiple AI models
- [ ] Batch prompt optimization
- [ ] Export analytics to CSV/PDF
- [ ] Team collaboration features
- [ ] Custom abbreviation dictionaries

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

## 💡 Support

For questions or issues, please open an issue in the repository.

---

**Built with ❤️ using React, TypeScript, Supabase, and Google Gemini AI**

