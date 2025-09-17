#!/bin/bash

echo "Setting up SimpleCheckList..."

# Create data directory
mkdir -p data

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install server dependencies
echo "Installing server dependencies..."
cd server
npm install

# Initialize database
echo "Initializing database..."
npm run init-db

# Install client dependencies
echo "Installing client dependencies..."
cd ../client
npm install

# Install MCP server dependencies
echo "Installing MCP server dependencies..."
cd ../mcp-server
npm install

echo "Setup complete!"
echo ""
echo "To start the development environment:"
echo "  npm run dev"
echo ""
echo "To start with Docker:"
echo "  docker-compose up --build"
echo ""
echo "Access the application at:"
echo "  Frontend: http://localhost:8354"
echo "  Backend API: http://localhost:8355"
echo "  Health check: http://localhost:8355/api/health"
