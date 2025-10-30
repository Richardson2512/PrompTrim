#!/bin/bash

# PromptTrim - Start All Services
# This script starts both the frontend and backend services

echo "🚀 Starting PromptTrim Full Stack Application"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

if [ ! -f "backend/main.py" ]; then
    echo "❌ Error: backend/main.py not found. Please ensure the backend folder exists."
    exit 1
fi

echo "📋 Starting services..."

# Start backend in background
echo "🔧 Starting FastAPI backend..."
cd backend
python start.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 5

# Start frontend
echo "⚛️ Starting React frontend..."
echo "🌐 Frontend will be available at: http://localhost:5173"
echo "🔧 Backend API will be available at: http://localhost:8000"
echo "📖 API Documentation: http://localhost:8000/docs"
echo ""
echo "🛑 Press Ctrl+C to stop all services"
echo "=================================================="

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $BACKEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start frontend (this will block)
npm run dev
