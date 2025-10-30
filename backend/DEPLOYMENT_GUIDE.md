# PromptTrim API Deployment Guide

## Overview

This guide covers deploying the PromptTrim API using Docker, Docker Compose, or manual installation.

## Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Redis (optional, for caching)
- Docker & Docker Compose (for containerized deployment)

## Quick Start with Docker Compose

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd prompttrim-api
cp env.example .env
```

### 2. Configure Environment

Edit `.env` file:

```bash
# Database Configuration
DATABASE_URL=postgresql://prompttrim_user:prompttrim_password@postgres:5432/prompttrim

# SendGrid Configuration
SENDGRID_API_KEY=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
FROM_EMAIL=noreply@prompttrim.com

# JWT Configuration
SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 3. Start Services

```bash
docker-compose up -d
```

### 4. Verify Deployment

```bash
# Check health
curl http://localhost:8000/health

# View API docs
open http://localhost:8000/docs
```

## Manual Installation

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Setup Database

```bash
# Create PostgreSQL database
createdb prompttrim

# Run migrations
alembic upgrade head
```

### 3. Configure Environment

```bash
cp env.example .env
# Edit .env with your configuration
```

### 4. Start Server

```bash
python start.py
```

## Production Deployment

### Using Docker

1. **Build Production Image**

```bash
docker build -t prompttrim-api:latest .
```

2. **Run with Environment Variables**

```bash
docker run -d \
  --name prompttrim-api \
  -p 8000:8000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e SENDGRID_API_KEY="your-key" \
  -e SECRET_KEY="your-secret" \
  prompttrim-api:latest
```

### Using Docker Compose (Production)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: prompttrim
      POSTGRES_USER: prompttrim_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - SENDGRID_API_KEY=${SENDGRID_API_KEY}
      - FROM_EMAIL=${FROM_EMAIL}
      - SECRET_KEY=${SECRET_KEY}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

volumes:
  postgres_data:
```

### Using Railway

1. **Connect Repository**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link project
railway login
railway link
```

2. **Set Environment Variables**

```bash
railway variables set DATABASE_URL="postgresql://..."
railway variables set SENDGRID_API_KEY="SG..."
railway variables set SECRET_KEY="your-secret-key"
```

3. **Deploy**

```bash
railway up
```

### Using Heroku

1. **Create Heroku App**

```bash
heroku create prompttrim-api
```

2. **Add PostgreSQL Addon**

```bash
heroku addons:create heroku-postgresql:hobby-dev
```

3. **Set Environment Variables**

```bash
heroku config:set SENDGRID_API_KEY="SG..."
heroku config:set SECRET_KEY="your-secret-key"
heroku config:set FROM_EMAIL="noreply@prompttrim.com"
```

4. **Deploy**

```bash
git push heroku main
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `SENDGRID_API_KEY` | SendGrid API key for emails | Yes | - |
| `FROM_EMAIL` | From email address | Yes | - |
| `SECRET_KEY` | JWT secret key | Yes | - |
| `ALGORITHM` | JWT algorithm | No | HS256 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration | No | 30 |
| `REDIS_URL` | Redis connection string | No | - |
| `API_HOST` | Server host | No | 0.0.0.0 |
| `API_PORT` | Server port | No | 8000 |

## Database Migrations

### Create Migration

```bash
alembic revision --autogenerate -m "Description of changes"
```

### Apply Migrations

```bash
alembic upgrade head
```

### Rollback Migration

```bash
alembic downgrade -1
```

## Monitoring and Logs

### Health Checks

```bash
# Basic health check
curl http://localhost:8000/health

# Detailed health check
curl http://localhost:8000/health | jq
```

### Logs

```bash
# Docker logs
docker-compose logs -f api

# Heroku logs
heroku logs --tail

# Railway logs
railway logs
```

## Security Considerations

1. **Change Default Secrets**
   - Update `SECRET_KEY` in production
   - Use strong, unique passwords

2. **Database Security**
   - Use connection pooling
   - Enable SSL connections
   - Regular backups

3. **API Security**
   - Rate limiting (implement in production)
   - Input validation
   - CORS configuration

4. **Email Security**
   - Verify SendGrid domain
   - Use SPF/DKIM records

## Scaling

### Horizontal Scaling

1. **Load Balancer**
   - Use nginx or cloud load balancer
   - Configure sticky sessions if needed

2. **Database Scaling**
   - Read replicas for analytics
   - Connection pooling

3. **Caching**
   - Redis for session storage
   - CDN for static assets

### Vertical Scaling

1. **Resource Monitoring**
   - CPU usage
   - Memory usage
   - Database connections

2. **Optimization**
   - Model caching
   - Async processing
   - Database indexing

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check database status
   docker-compose ps postgres
   
   # Check logs
   docker-compose logs postgres
   ```

2. **SendGrid Email Failed**
   ```bash
   # Verify API key
   curl -X GET "https://api.sendgrid.com/v3/user/profile" \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

3. **TinyLlama Model Loading**
   ```bash
   # Check model download
   python -c "from transformers import AutoTokenizer; AutoTokenizer.from_pretrained('TinyLlama/TinyLlama-1.1B-Chat-v1.0')"
   ```

### Performance Issues

1. **Slow Response Times**
   - Check database queries
   - Monitor model loading time
   - Consider model caching

2. **High Memory Usage**
   - Monitor model memory usage
   - Consider model quantization
   - Implement model unloading

## Support

- **Documentation**: https://docs.prompttrim.com
- **Issues**: https://github.com/prompttrim/api/issues
- **Email**: support@prompttrim.com
