# PromptTrim 🚀

**AI-Powered Prompt Optimization Platform**

PromptTrim is a full-stack SaaS application that helps you optimize AI prompts to reduce token usage and save costs. It features a React frontend and a FastAPI backend with TinyLlama integration for intelligent prompt compression.

![Tech Stack](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-green)
![TinyLlama](https://img.shields.io/badge/TinyLlama-AI%20Powered-purple)
![Supabase](https://img.shields.io/badge/Supabase-Enabled-green)

## ✨ Features

- 🤖 **AI-Powered Optimization** - Uses TinyLlama for intelligent prompt compression
- 📊 **Real-time Analytics** - Track tokens saved, cost savings, and compression rates
- 📝 **Prompt History** - Access all your previously optimized prompts
- 🎯 **Configurable Compression** - Choose compression ratios from 10% to 90%
- 💰 **Cost Tracking** - See exactly how much money you're saving
- 🔒 **Secure API** - JWT-based authentication with API keys
- 📈 **Usage Dashboard** - Monitor your optimization usage and savings
- 📧 **Email Integration** - SendGrid-powered welcome emails
- 🐳 **Docker Ready** - Easy deployment with Docker Compose

## 🛠️ Tech Stack

### Frontend
- **React 18** + TypeScript
- **TailwindCSS** for styling
- **Vite** as build tool
- **Lucide React** for icons

### Backend
- **FastAPI** (Python) for API server
- **TinyLlama** for AI-powered compression
- **PostgreSQL** for database
- **SendGrid** for email services
- **Docker** for containerization

### Database
- **Supabase** (PostgreSQL) for frontend
- **PostgreSQL** for backend API

## 📦 Installation

### Prerequisites

- Node.js 18+ (for frontend)
- Python 3.11+ (for backend)
- PostgreSQL 15+ (for backend database)
- Supabase account (for frontend database)
- SendGrid account (for email services)

### Quick Start

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd project
```

2. **Frontend Setup**
```bash
# Install frontend dependencies
npm install

# Set up frontend environment
cp env.example .env
# Edit .env with your Supabase credentials
```

3. **Backend Setup**
```bash
# Navigate to backend directory
cd backend

# Install backend dependencies
pip install -r requirements.txt

# Set up backend environment
cp env.example .env
# Edit .env with your database and SendGrid credentials
```

4. **Start All Services (Easy)**

**Windows:**
```powershell
.\start-all.ps1
```

**Mac/Linux:**
```bash
./start-all.sh
```

5. **Or start with Docker (Recommended)**
```bash
# From the backend directory
cd backend
docker-compose up -d

# Then start frontend from project root
npm run dev
```

6. **Or start manually**
```bash
# Start backend (from backend directory)
cd backend
python start.py

# Start frontend (from project root)
npm run dev
```

## 🎮 Usage

### Frontend (React App)
- **URL**: http://localhost:5173
- **Features**: User interface for prompt optimization
- **Database**: Supabase for user management and prompt storage

### Backend (FastAPI)
- **URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Features**: Prompt optimization API with TinyLlama integration

### API Usage Example

```bash
# Register a user
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "name": "John Doe", "password": "password123"}'

# Login and get API key
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# Optimize a prompt
curl -X POST "http://localhost:8000/optimize" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Your long prompt here", "compression_ratio": 0.5}'
```

## 🧠 How It Works

### Backend API (TinyLlama Integration)

The FastAPI backend uses TinyLlama for intelligent prompt compression:

1. **User submits prompt** via API with desired compression ratio
2. **TinyLlama analyzes** the prompt's intent and context
3. **AI compresses** the prompt while preserving meaning
4. **Returns optimized version** with token savings metrics
5. **Tracks usage** and analytics for the user

### Frontend Integration

The React frontend can integrate with the backend API:

- **Direct API calls** to the FastAPI backend
- **User authentication** via API keys
- **Real-time optimization** with progress indicators
- **Analytics dashboard** showing usage and savings

## 📁 Project Structure

```
project/
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── contexts/          # React contexts
│   ├── services/          # Frontend services
│   └── lib/               # Utility libraries
├── backend/               # FastAPI backend
│   ├── services/          # Business logic services
│   ├── alembic/           # Database migrations
│   ├── main.py            # FastAPI application
│   ├── models.py          # Database models
│   ├── schemas.py         # Pydantic schemas
│   ├── requirements.txt   # Python dependencies
│   ├── Dockerfile         # Docker configuration
│   └── docker-compose.yml # Multi-service setup
├── supabase/              # Database migrations
└── README.md              # This file
```

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

