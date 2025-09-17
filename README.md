# SimpleCheckList MCP Server

[![MCP Registry Ready](https://img.shields.io/badge/MCP%20Registry-Ready-brightgreen)](https://github.com/modelcontextprotocol/registry)
[![Security Audit](https://img.shields.io/badge/Security-Audit%20Passed-brightgreen)](./SECURITY-AUDIT.txt)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Advanced task and project management MCP server with hierarchical organization, AI-powered planning, and comprehensive analytics**

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/mayurkakade/SimpleCheckList.git
cd SimpleCheckList

# Quick setup (installs dependencies and initializes database)
./setup.sh

# Start the full stack
npm run dev
```

## 📋 Overview

SimpleCheckList is a comprehensive Model Context Protocol (MCP) server that provides AI applications with powerful project management capabilities. It features a hierarchical organization system, AI-powered planning assistance, and real-time analytics.

### 🎯 Key Features

- **Hierarchical Organization**: Projects → Groups → Task Lists → Tasks → Subtasks
- **20 Comprehensive Tools**: Complete CRUD operations for all entity types
- **5 Resource Endpoints**: Real-time data access and analytics
- **4 AI-Powered Prompts**: Intelligent planning and analysis assistance
- **Enterprise Security**: Comprehensive security audit passed
- **Multi-Deployment**: Local, Docker, and cloud deployment options

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
- Node.js 18+
- SQLite3
- Docker (optional)

### Method 1: Quick Setup Script
```bash
./setup.sh
```

### Method 2: Manual Installation
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

### Method 3: Docker
```bash
docker-compose up --build
```

## 🤖 MCP Integration

### Claude Desktop Configuration
Add to your Claude Desktop configuration:

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

## 📖 Usage Examples

### Creating a Web Application Project

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
