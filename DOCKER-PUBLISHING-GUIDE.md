# Docker Hub Publishing Guide - SimpleCheckList MCP Server

## 🎯 Overview

This guide walks you through publishing the SimpleCheckList MCP Server to Docker Hub, making it easily accessible for users worldwide.

## 📋 Prerequisites

### Required Software:
- Docker Desktop installed and running
- Docker Hub account created
- Git repository access

### Docker Hub Setup:
1. Create account at [hub.docker.com](https://hub.docker.com)
2. Create repository: `simplechecklist/mcp-server`
3. Set repository to public
4. Add description: "Advanced task and project management MCP server with hierarchical organization and AI-powered planning"

## 🚀 Quick Publishing (Automated)

### Step 1: Start Docker
```bash
# Make sure Docker Desktop is running
docker info
```

### Step 2: Run Publishing Script
```bash
# Make script executable and run
chmod +x docker-publish.sh
./docker-publish.sh
```

The script will:
- ✅ Check Docker is running
- 🔨 Build optimized production image
- 🧪 Test the image locally
- 🔐 Prompt for Docker Hub login
- 📤 Push to Docker Hub with version tags

## 🛠️ Manual Publishing Process

### Step 1: Build Docker Image
```bash
# Build with multiple tags
docker build -f Dockerfile.hub \
    -t simplechecklist/mcp-server:latest \
    -t simplechecklist/mcp-server:1.0.0 \
    .
```

### Step 2: Test Locally
```bash
# Run container for testing
docker run -d --name simplechecklist-test \
    -p 8355:8355 \
    simplechecklist/mcp-server:latest

# Test health endpoint
curl http://localhost:8355/api/health

# Check logs
docker logs simplechecklist-test

# Stop test container
docker stop simplechecklist-test
docker rm simplechecklist-test
```

### Step 3: Login to Docker Hub
```bash
docker login
# Enter your Docker Hub username and password
```

### Step 4: Push to Docker Hub
```bash
# Push both tags
docker push simplechecklist/mcp-server:latest
docker push simplechecklist/mcp-server:1.0.0
```

## 📦 Docker Image Details

### Image Specifications:
- **Base Image**: node:18-alpine (production-optimized)
- **Architecture**: Multi-stage build for minimal size
- **Security**: Non-root user, minimal attack surface
- **Size**: ~150MB (optimized)
- **Platforms**: linux/amd64, linux/arm64

### Included Components:
- SimpleCheckList backend API server
- MCP server with full protocol support
- SQLite database with initialization
- Health checks and monitoring
- Production-ready configuration

### Environment Variables:
```bash
NODE_ENV=production
API_BASE_URL=http://localhost:8355/api
DATABASE_PATH=/app/data/checklist.db
```

### Exposed Ports:
- **8355**: Backend API server
- **3001**: MCP server (optional, for TCP transport)

### Volumes:
- **/app/data**: Persistent database storage
- **/app/logs**: Application logs

## 🚀 Usage Examples

### Basic Usage:
```bash
# Run with default settings
docker run -p 8355:8355 simplechecklist/mcp-server:latest
```

### Production Deployment:
```bash
# Run with persistent data
docker run -d --name simplechecklist \
    -p 8355:8355 \
    -v simplechecklist_data:/app/data \
    -v simplechecklist_logs:/app/logs \
    --restart unless-stopped \
    simplechecklist/mcp-server:latest
```

### Docker Compose:
```yaml
version: '3.8'
services:
  simplechecklist:
    image: simplechecklist/mcp-server:latest
    ports:
      - "8355:8355"
    volumes:
      - simplechecklist_data:/app/data
    restart: unless-stopped
volumes:
  simplechecklist_data:
```

### Different Startup Modes:
```bash
# Backend only
docker run -p 8355:8355 simplechecklist/mcp-server:latest backend

# MCP server only
docker run simplechecklist/mcp-server:latest mcp

# Both (default)
docker run -p 8355:8355 simplechecklist/mcp-server:latest both
```

## 🔧 Claude Desktop Integration

### With Docker Container:
```json
{
  "mcpServers": {
    "simple-checklist": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "-p", "8355:8355",
        "simplechecklist/mcp-server:latest",
        "mcp"
      ],
      "env": {
        "API_BASE_URL": "http://localhost:8355/api"
      }
    }
  }
}
```

## 📊 Docker Hub Repository Setup

### Repository Configuration:
- **Name**: `simplechecklist/mcp-server`
- **Visibility**: Public
- **Description**: Advanced task and project management MCP server
- **README**: Link to GitHub repository

### Tags Strategy:
- `latest`: Always points to newest stable release
- `1.0.0`: Specific version for stability
- `1.0`: Major version for compatibility

### Automated Builds (Optional):
Set up GitHub integration for automatic builds on repository updates.

## 🔍 Verification Steps

### After Publishing:
1. **Check Docker Hub**: Verify image appears in repository
2. **Test Pull**: `docker pull simplechecklist/mcp-server:latest`
3. **Test Run**: Verify container starts and responds
4. **Documentation**: Update README with Docker instructions

### Health Checks:
```bash
# Container health
docker run --rm simplechecklist/mcp-server:latest curl -f http://localhost:8355/api/health

# MCP server functionality
# Test with Claude Desktop integration
```

## 📈 Monitoring and Maintenance

### Image Updates:
- Update version tags for new releases
- Maintain security patches
- Monitor image size and optimization
- Update dependencies regularly

### Docker Hub Metrics:
- Monitor download statistics
- Track user feedback and issues
- Maintain repository documentation

## 🆘 Troubleshooting

### Common Issues:

**Docker Build Fails:**
```bash
# Check Docker is running
docker info

# Clear build cache
docker builder prune

# Build with verbose output
docker build -f Dockerfile.hub --progress=plain .
```

**Push Permission Denied:**
```bash
# Login again
docker logout
docker login

# Check repository name matches
docker tag simplechecklist/mcp-server:latest your-username/mcp-server:latest
```

**Container Won't Start:**
```bash
# Check logs
docker logs container-name

# Run interactively for debugging
docker run -it --entrypoint /bin/sh simplechecklist/mcp-server:latest
```

## 📚 Additional Resources

- **Docker Hub Repository**: https://hub.docker.com/r/simplechecklist/mcp-server
- **GitHub Repository**: https://github.com/DevMayur/SimpleCheckList
- **MCP Documentation**: https://modelcontextprotocol.io/
- **Docker Documentation**: https://docs.docker.com/

## 🎉 Success Metrics

After successful publishing:
- ✅ Image available on Docker Hub
- ✅ Users can pull and run with single command
- ✅ Integration works with Claude Desktop
- ✅ Health checks pass
- ✅ Documentation updated

**Your SimpleCheckList MCP Server is now ready for global distribution via Docker Hub!** 🚀
