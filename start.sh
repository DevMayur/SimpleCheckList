#!/bin/sh
set -e

echo "🚀 Starting SimpleCheckList Full Stack Application"
echo "📍 Working directory: $(pwd)"

# Initialize database if it doesn't exist
if [ ! -f /app/data/checklist.db ]; then
    echo "📊 Initializing database..."
    mkdir -p /app/data
    cd /app/server
    node scripts/init-db.js
fi

# Start nginx in background
echo "🌐 Starting Nginx (Frontend server on port 80)..."
nginx

# Start backend server
echo "🔧 Starting Backend API server (port 8355)..."
cd /app/server
node index.js &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to be ready..."
sleep 5

# Test if backend is running
if curl -f http://localhost:8355/api/health > /dev/null 2>&1; then
    echo "✅ Backend API is ready!"
else
    echo "❌ Backend API failed to start"
    exit 1
fi

echo ""
echo "🎉 SimpleCheckList Full Stack Application is ready!"
echo "🌐 Frontend (Web UI): http://localhost:8080"
echo "📡 Backend API: http://localhost:8355/api"
echo "🏥 Health check: http://localhost:8355/api/health"
echo ""

# Keep container running by waiting for background processes
wait $BACKEND_PID
