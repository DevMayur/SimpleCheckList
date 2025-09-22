#!/bin/bash

# WebSocket Implementation Setup Script
# This script sets up the WebSocket real-time updates feature

echo "🚀 Setting up WebSocket Real-Time Updates..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the project root directory"
    exit 1
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd client
npm install socket.io-client@^4.8.1
if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed successfully"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

cd ..

# Check if server dependencies are already installed
echo "🔍 Checking server dependencies..."
cd server
if grep -q "socket.io" package.json; then
    echo "✅ Server dependencies already present"
else
    echo "❌ Socket.IO not found in server dependencies"
    echo "Please ensure socket.io@^4.8.1 is in server/package.json"
    exit 1
fi

cd ..

echo ""
echo "🎉 WebSocket setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Start the backend server: cd server && npm start"
echo "2. Start the frontend: cd client && npm start"
echo "3. Open multiple browser tabs to test real-time updates"
echo ""
echo "🔧 Features enabled:"
echo "  ✅ Real-time updates across all components"
echo "  ✅ Automatic reconnection on connection loss"
echo "  ✅ Project-scoped event distribution"
echo "  ✅ Connection status indicators"
echo "  ✅ Offline/online handling"
echo ""
echo "📖 See WEBSOCKET-IMPLEMENTATION.md for detailed documentation"
