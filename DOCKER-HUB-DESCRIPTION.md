# SimpleCheckList MCP Server - Full-Stack Project Management

**🌟 NEW in v1.0.1: Complete Web UI + API Server**

Advanced Model Context Protocol (MCP) server with hierarchical project management, AI-powered planning, and comprehensive analytics. Now includes a full-stack React-based web interface!

## 🚀 Quick Start

### Full-Stack Web Application (Recommended)
```bash
docker run -d -p 8080:80 -p 8355:8355 mayurkakade/mcp-server:v1.0.1
```
- **Web UI**: http://localhost:8080 (Complete project management interface)
- **API**: http://localhost:8355/api (MCP server endpoints)

### API-Only Mode (MCP Integration)
```bash
docker run -p 8355:8355 mayurkakade/mcp-server:latest backend
```

## ✨ Key Features

- **🌐 Full-Stack Web UI**: React-based dashboard with visual project management
- **🔧 MCP Integration**: 20 tools, 5 resources, 4 AI-powered prompts
- **📊 Real-time Analytics**: Progress tracking and comprehensive reporting
- **🏗️ Hierarchical Organization**: Projects → Groups → Task Lists → Tasks → Subtasks
- **🤖 AI-Powered Planning**: Intelligent project planning and analysis
- **🔒 Enterprise Security**: Comprehensive security audit passed
- **🐳 Production Ready**: Health checks, persistent data, auto-restart

## 📋 What's New in v1.0.1

- **Complete Web Interface**: Modern React-based UI with Material Design
- **Visual Project Dashboard**: Progress indicators, charts, and analytics
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Multi-deployment Options**: Web UI + API or API-only modes
- **Enhanced Docker Support**: Optimized containers with health checks

## 🎯 Use Cases

- **Project Management**: Visual task tracking and team collaboration
- **AI Integration**: Claude Desktop and other MCP-compatible applications  
- **Development Teams**: Agile project organization and sprint planning
- **Personal Productivity**: Individual task management and goal tracking

## 🔧 Deployment Options

### Production with Persistent Data
```bash
docker run -d --name simplechecklist \
  -p 8080:80 -p 8355:8355 \
  -v simplechecklist_data:/app/data \
  --restart unless-stopped \
  mayurkakade/mcp-server:v1.0.1
```

### Claude Desktop Integration
Add to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "simple-checklist": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "-p", "8355:8355", "mayurkakade/mcp-server:latest", "mcp"]
    }
  }
}
```

## 📚 Links

- **GitHub**: https://github.com/DevMayur/SimpleCheckList
- **Documentation**: Complete guides and API reference
- **MCP Registry**: Approved and listed in Anthropic's MCP registry
- **Security Audit**: Comprehensive security analysis available

## 🏷️ Tags

- `latest` - Full-stack application (Web UI + API)
- `v1.0.1` - Full-stack with web interface
- `v1.0.0` - Original API-only version

**Ready for AI-powered project management? Get started today!**
