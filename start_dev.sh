#!/bin/bash

# Community Hub Development Startup Script

echo "🏘️  Starting Community Hub Development Environment..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists python3; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+"
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 14+"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Start backend
echo "🚀 Starting backend server..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Start backend server in background
echo "🔧 Starting FastAPI server on port 8000..."
python main.py &
BACKEND_PID=$!

# Start frontend
echo "⚡ Starting frontend server..."
cd ../frontend

# Install Node dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Start frontend server
echo "🌐 Starting React development server on port 3000..."
npm start &
FRONTEND_PID=$!

# Function to cleanup on exit
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Cleanup complete"
    exit 0
}

# Trap SIGINT and SIGTERM
trap cleanup SIGINT SIGTERM

echo ""
echo "🎉 Community Hub is starting up!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID