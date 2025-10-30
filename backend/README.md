# PromptTrim Backend API

This is the backend API for PromptTrim, an AI-powered prompt optimization platform using TinyLlama compression technology.

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Setup Environment

```bash
cp env.example .env
# Edit .env with your configuration
```

### 3. Start with Docker (Recommended)

```bash
docker-compose up -d
```

### 4. Or Start Manually

```bash
python start.py
```

## API Documentation

Once running, visit:
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## Project Structure

```
backend/
├── main.py                 # FastAPI application
├── database.py            # Database configuration
├── models.py              # SQLAlchemy models
├── schemas.py             # Pydantic schemas
├── services/              # Business logic services
│   ├── auth_service.py    # Authentication & API keys
│   ├── email_service.py   # SendGrid email integration
│   ├── prompt_service.py  # Prompt optimization logic
│   └── tinyllama_service.py # TinyLlama model integration
├── alembic/               # Database migrations
├── requirements.txt       # Python dependencies
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Multi-service setup
├── start.py              # Startup script
├── run_tests.py          # Test suite
└── README.md             # This file
```

## Key Features

- 🚀 **Smart Compression**: TinyLlama-powered prompt optimization
- 💰 **Cost Savings**: Reduce tokens by 30-70% while maintaining quality
- 🔐 **Secure API**: JWT-based authentication with API keys
- 📧 **Email Integration**: SendGrid-powered welcome emails
- 📊 **Analytics**: Usage tracking and optimization metrics
- 🐳 **Docker Ready**: Easy deployment with Docker Compose

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SENDGRID_API_KEY` | SendGrid API key | Yes |
| `FROM_EMAIL` | From email address | Yes |
| `SECRET_KEY` | JWT secret key | Yes |

## API Endpoints

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /api-keys` - List API keys
- `POST /api-keys` - Create API key
- `POST /optimize` - Optimize prompt
- `GET /analytics/usage` - Usage analytics

## Testing

```bash
python run_tests.py
```

## Deployment

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

## Support

- **Documentation**: https://docs.prompttrim.com
- **Issues**: https://github.com/prompttrim/api/issues
- **Email**: support@prompttrim.com
