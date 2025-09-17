#!/bin/bash
# SimpleCheckList MCP Server - Docker Hub Publishing Script

set -e

echo "🚀 SimpleCheckList MCP Server - Docker Hub Publishing"
echo "======================================================"

# Configuration
IMAGE_NAME="simplechecklist/mcp-server"
VERSION="1.0.0"
DOCKERFILE="Dockerfile.hub"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"

# Build the image
echo "🔨 Building Docker image..."
docker build -f $DOCKERFILE \
    -t $IMAGE_NAME:latest \
    -t $IMAGE_NAME:$VERSION \
    .

echo "✅ Docker image built successfully"

# Test the image locally
echo "🧪 Testing Docker image locally..."
docker run --rm -d --name simplechecklist-test -p 8355:8355 $IMAGE_NAME:latest

# Wait for container to start
echo "⏳ Waiting for container to start..."
sleep 10

# Health check
if curl -f http://localhost:8355/api/health >/dev/null 2>&1; then
    echo "✅ Container health check passed"
else
    echo "❌ Container health check failed"
    docker logs simplechecklist-test
    docker stop simplechecklist-test
    exit 1
fi

# Stop test container
docker stop simplechecklist-test
echo "✅ Local testing completed successfully"

# Check if logged into Docker Hub
if ! docker info | grep -q "Username:"; then
    echo "🔐 Please log in to Docker Hub:"
    docker login
fi

# Push to Docker Hub
echo "📤 Pushing to Docker Hub..."
docker push $IMAGE_NAME:latest
docker push $IMAGE_NAME:$VERSION

echo "🎉 Successfully published to Docker Hub!"
echo ""
echo "📋 Image Details:"
echo "   Repository: $IMAGE_NAME"
echo "   Tags: latest, $VERSION"
echo "   Size: $(docker images $IMAGE_NAME:latest --format 'table {{.Size}}' | tail -1)"
echo ""
echo "🚀 Usage:"
echo "   docker run -p 8355:8355 $IMAGE_NAME:latest"
echo ""
echo "📖 Documentation: https://github.com/DevMayur/SimpleCheckList"
