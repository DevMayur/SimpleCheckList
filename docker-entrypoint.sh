#!/bin/sh
set -e

# SimpleCheckList MCP Server Docker Entrypoint
# Handles different startup modes and initialization

echo "🚀 Starting SimpleCheckList MCP Server v1.0.0"
echo "📍 Working directory: $(pwd)"
echo "🔧 Mode: ${1:-both}"

# Ensure data directory exists with proper permissions
mkdir -p /app/data /app/logs

# Check if database exists, initialize if not
if [ ! -f "/app/data/checklist.db" ]; then
    echo "📊 Initializing database..."
    cd /app/server && node scripts/init-db.js
    echo "✅ Database initialized successfully"
fi

# Function to start backend server
start_backend() {
    echo "🔧 Starting backend API server..."
    cd /app/server
    exec node index.js
}

# Function to start MCP server
start_mcp() {
    echo "🤖 Starting MCP server..."
    cd /app/mcp-server
    exec node index.js
}

# Function to start both servers
start_both() {
    echo "🚀 Starting both backend and MCP servers..."
    
    # Start backend in background
    cd /app/server
    node index.js &
    BACKEND_PID=$!
    
    # Wait a moment for backend to start
    sleep 3
    
    # Check if backend is running
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo "❌ Backend server failed to start"
        exit 1
    fi
    
    echo "✅ Backend server started (PID: $BACKEND_PID)"
    
    # Start MCP server in foreground
    cd /app/mcp-server
    exec node index.js
}

# Handle different startup modes
case "${1:-both}" in
    "backend")
        start_backend
        ;;
    "mcp")
        start_mcp
        ;;
    "both")
        start_both
        ;;
    *)
        echo "❌ Unknown mode: $1"
        echo "Usage: docker run simplechecklist/mcp-server [backend|mcp|both]"
        exit 1
        ;;
esac
