<div align="center">

![SimpleCheckList Icon](./icon.png)

# SimpleCheckList MCP Server

[![MCP Registry Ready](https://img.shields.io/badge/MCP%20Registry-Ready-brightgreen)](https://github.com/modelcontextprotocol/registry)
[![Docker Hub](https://img.shields.io/badge/Docker%20Hub-mayurkakade/mcp--server-blue)](https://hub.docker.com/r/mayurkakade/mcp-server)
[![Security Audit](https://img.shields.io/badge/Security-Audit%20Passed-brightgreen)](./SECURITY-AUDIT.txt)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Advanced task and project management MCP server with hierarchical organization, AI-powered planning, and comprehensive analytics**

</div>

## 🚀 Quick Start

### 🌐 Full-Stack Web Application (NEW in v1.0.1):
```bash
# Complete project management application with web UI + API
docker run -d -p 8080:80 -p 8355:8355 mayurkakade/mcp-server:v1.0.1

# Access:
# - Web UI: http://localhost:8080 (Complete project management interface)
# - API: http://localhost:8355/api (MCP server endpoints)
# - Health: http://localhost:8355/api/health
```

### 📡 API-Only Mode (Original):
```bash
# Backend API server only (for MCP integration)
docker run -p 8355:8355 mayurkakade/mcp-server:latest backend

# Access the API at http://localhost:8355/api/health
# MCP server ready for Claude Desktop integration!
```

### For Developers:
```bash
# Clone the repository for development
git clone https://github.com/DevMayur/SimpleCheckList.git
cd SimpleCheckList

# Quick setup (installs dependencies and initializes database)
./setup.sh

# Start the full stack
npm run dev
```

## 📋 Overview

SimpleCheckList is a comprehensive Model Context Protocol (MCP) server that provides AI applications with powerful project management capabilities. It features a hierarchical organization system, AI-powered planning assistance, and real-time analytics.

### 🎯 Key Features

- **🌐 Full-Stack Web UI**: Complete React-based project management interface (NEW in v1.0.1)
- **🔧 Hierarchical Organization**: Projects → Groups → Task Lists → Tasks → Subtasks
- **🛠️ 20 Comprehensive Tools**: Complete CRUD operations for all entity types
- **📊 5 Resource Endpoints**: Real-time data access and analytics
- **🤖 4 AI-Powered Prompts**: Intelligent planning and analysis assistance
- **🔒 Enterprise Security**: Comprehensive security audit passed
- **🚀 Multi-Deployment**: Web UI, API-only, local, Docker, and cloud options

## 🏗️ Architecture

```
Project
├── Groups (Frontend, Backend, Testing, etc.)
│   ├── Task Lists (User Auth, API Endpoints, etc.)
│   │   ├── Tasks (Individual work items)
│   │   │   └── Subtasks (Granular breakdown)
```

## 🔧 Installation

### Prerequisites
- Node.js 18+ (for local installation)
- Docker (for containerized deployment)
- SQLite3 (for local installation)

### Method 1: Docker Hub (Recommended) 🐳

#### Full-Stack Web Application (v1.0.1+):
```bash
# Complete application with web UI + API
docker run -d --name simplechecklist-fullstack \
    -p 8080:80 \
    -p 8355:8355 \
    -v simplechecklist_data:/app/data \
    --restart unless-stopped \
    mayurkakade/mcp-server:v1.0.1

# Access:
# - Web UI: http://localhost:8080
# - API: http://localhost:8355/api
```

#### API-Only Mode:
```bash
# Backend API server only (for MCP integration)
docker run -d --name simplechecklist-api \
    -p 8355:8355 \
    -v simplechecklist_data:/app/data \
    --restart unless-stopped \
    mayurkakade/mcp-server:latest backend
```

#### Docker Compose (Production):
```bash
# Use the full-stack compose file
docker-compose -f docker-compose.fullstack.yml up -d

# Access:
# - Web UI: http://localhost:8080
# - API: http://localhost:8355/api
```

### Method 2: Quick Setup Script
```bash
./setup.sh
```

### Method 3: Manual Installation
```bash
# Install dependencies
npm install
cd server && npm install
cd ../client && npm install  
cd ../mcp-server && npm install

# Initialize database
cd server && npm run init-db

# Start services
cd .. && npm run dev
```

### Method 4: Docker Compose
```bash
docker-compose up --build
```

## 🤖 MCP Integration

### Claude Desktop Configuration

#### Option 1: Docker (Recommended)
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

#### Option 2: Local Installation
```json
{
  "mcpServers": {
    "simple-checklist": {
      "command": "node",
      "args": ["/path/to/SimpleCheckList/mcp-server/index.js"],
      "env": {
        "API_BASE_URL": "http://localhost:8355/api"
      }
    }
  }
}
```

### Available Tools (20)

#### Project Management
- `list_projects` - Get all projects with metadata
- `create_project` - Create new project
- `get_project` - Get specific project details
- `update_project` - Modify project properties
- `delete_project` - Remove project and contents

#### Task Management
- `create_task` - Create tasks with priority, due dates, metadata
- `list_tasks` - Get tasks for specific task list
- `update_task` - Modify task properties
- `toggle_task_completion` - Mark tasks complete/incomplete
- `delete_task` - Remove tasks and subtasks

#### Analytics
- `get_project_stats` - Comprehensive project statistics
- `get_all_tasks` - System-wide task analysis

[See full tool documentation →](./MCP-SERVER-README.txt)

### Resource Endpoints (5)

- `checklist://projects` - All projects with metadata
- `checklist://tasks/all` - All tasks across projects
- `checklist://stats/summary` - System-wide statistics
- `checklist://projects/{id}` - Specific project details
- `checklist://projects/{id}/hierarchy` - Complete project structure

### AI-Powered Prompts (4)

- `create_project_plan` - Automated project structure generation
- `analyze_project_progress` - Intelligent progress analysis
- `suggest_task_breakdown` - Smart task decomposition
- `generate_status_report` - Comprehensive reporting

## 🌐 Web UI Features (v1.0.1+)

The full-stack deployment includes a complete React-based web interface:

### 📋 Project Management Dashboard
- **Visual Project Overview**: See all projects with progress indicators
- **Hierarchical Task Organization**: Drill down from projects to subtasks
- **Real-time Updates**: Live progress tracking and completion status
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### 🎯 Task Management Interface
- **Drag & Drop**: Intuitive task organization and prioritization
- **Rich Task Details**: Add descriptions, due dates, priorities, and metadata
- **Progress Tracking**: Visual completion indicators and statistics
- **Search & Filter**: Find tasks quickly across projects

### 📊 Analytics & Reporting
- **Project Statistics**: Completion rates, task distribution, progress charts
- **Time Tracking**: Due date management and deadline monitoring
- **Export Capabilities**: Generate reports and export data

### 🔧 Admin Features
- **User Management**: Multi-user support with role-based access
- **Settings Panel**: Configure preferences and system settings
- **Data Import/Export**: Backup and restore project data

## 📖 Usage Examples

### Web UI Usage
1. **Start the application**: `docker run -d -p 8080:80 -p 8355:8355 mayurkakade/mcp-server:v1.0.1`
2. **Open your browser**: Navigate to `http://localhost:8080`
3. **Create your first project**: Click "New Project" and follow the wizard
4. **Organize with groups**: Add Frontend, Backend, Testing groups
5. **Add task lists**: Create specific feature lists within groups
6. **Track progress**: Mark tasks complete and watch progress indicators update

### API Usage - Creating a Web Application Project

```javascript
// 1. Create project
create_project({
  name: "E-commerce Platform",
  description: "Full-stack e-commerce with React and Node.js",
  color: "#2563EB"
})

// 2. Create groups
create_group({
  project_id: "project-id",
  name: "Frontend",
  description: "React UI components"
})

// 3. Create tasks with rich metadata
create_task({
  task_list_id: "task-list-id",
  title: "Implement user authentication",
  description: "Complete auth system with JWT",
  priority: "high",
  metadata: {
    files: ["auth.service.ts", "login.component.tsx"],
    acceptance_criteria: [
      "JWT token generation",
      "Protected routes",
      "Password validation"
    ]
  }
})
```

### AI-Assisted Planning

```javascript
// Get AI help for project planning
create_project_plan({
  project_name: "Mobile App Development",
  complexity: "complex"
})

// Analyze project progress
analyze_project_progress({
  project_id: "project-id"
})
```

## 🔒 Security

SimpleCheckList has undergone a comprehensive security audit:

- ✅ **No Critical Vulnerabilities**
- ✅ **Input Validation & Sanitization**
- ✅ **SQL Injection Protection**
- ✅ **Secure Error Handling**
- ✅ **Enterprise-Grade Controls**

[View Security Audit Report →](./SECURITY-AUDIT.txt)

## 📊 API Reference

### REST API Endpoints

- **Projects**: `/api/projects`
- **Groups**: `/api/projects/:id/groups`
- **Task Lists**: `/api/groups/:id/task-lists`
- **Tasks**: `/api/task-lists/:id/tasks`
- **Subtasks**: `/api/tasks/:id/subtasks`

[Complete API Documentation →](./README.txt)

## 🚀 Deployment

### Local Development
```bash
npm run dev
# Backend: http://localhost:8355
# Frontend: http://localhost:8354
```

### Docker Production
```bash
docker-compose up --build
```

### Environment Variables
```bash
# Backend API URL for MCP server
API_BASE_URL=http://localhost:8355/api

# Database path (optional)
DATABASE_PATH=./data/checklist.db
```

## 📚 Documentation

- **[MCP Server Documentation](./MCP-SERVER-README.txt)** - Complete MCP integration guide
- **[AI Agent Integration](./AI-AGENT-INTEGRATION-GUIDE.md)** - AI application examples
- **[Security Audit](./SECURITY-AUDIT.txt)** - Comprehensive security analysis
- **[Registry Submission](./publish-anthropic.md)** - Anthropic registry details

## 🎯 Anthropic MCP Registry

SimpleCheckList is **ready for submission** to the Anthropic MCP Registry:

- ✅ MCP specification compliance
- ✅ Security audit passed
- ✅ Comprehensive documentation
- ✅ Registry manifest prepared
- ✅ Production deployment tested

[View Registry Submission Guide →](./publish-anthropic.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check our comprehensive guides above
- **Issues**: [Create a GitHub issue](https://github.com/mayurkakade/SimpleCheckList/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mayurkakade/SimpleCheckList/discussions)

## 🏆 Acknowledgments

- Built with [Model Context Protocol](https://modelcontextprotocol.io/)
- Designed for [Claude Desktop](https://claude.ai/desktop) integration
- Inspired by modern project management methodologies

---

<div align="center">
  <strong>Ready for AI-powered project management? Get started today!</strong>
</div>
