# PromptTrim - Start All Services
# This script starts both the frontend and backend services

Write-Host "🚀 Starting PromptTrim Full Stack Application" -ForegroundColor Green
Write-Host "=" * 50

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "backend/main.py")) {
    Write-Host "❌ Error: backend/main.py not found. Please ensure the backend folder exists." -ForegroundColor Red
    exit 1
}

Write-Host "📋 Starting services..." -ForegroundColor Yellow

# Start backend in background
Write-Host "🔧 Starting FastAPI backend..." -ForegroundColor Cyan
Start-Process -FilePath "python" -ArgumentList "start.py" -WorkingDirectory "backend" -WindowStyle Minimized

# Wait a moment for backend to start
Write-Host "⏳ Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start frontend
Write-Host "⚛️ Starting React frontend..." -ForegroundColor Cyan
Write-Host "🌐 Frontend will be available at: http://localhost:5173" -ForegroundColor Green
Write-Host "🔧 Backend API will be available at: http://localhost:8000" -ForegroundColor Green
Write-Host "📖 API Documentation: http://localhost:8000/docs" -ForegroundColor Green
Write-Host ""
Write-Host "🛑 Press Ctrl+C to stop all services" -ForegroundColor Yellow
Write-Host "=" * 50

# Start frontend (this will block)
npm run dev
