SimpleCheckList - Advanced Task Management System
================================================

A comprehensive task management system built with MERN stack, featuring SQLite database, MCP server for AI integration, and a modern React frontend.

ARCHITECTURE
============

- Backend: Express.js API with SQLite database
- Frontend: React with TypeScript and Material-UI
- MCP Server: Model Context Protocol server for AI applications
- Database: SQLite with comprehensive schema for projects, groups, task lists, tasks, and subtasks
- Deployment: Docker containerization

FEATURES
========

1. Project Management
   - Create, read, update, delete projects
   - Project color coding and descriptions
   - Project statistics and completion tracking

2. Hierarchical Organization
   - Projects contain Groups
   - Groups contain Task Lists
   - Task Lists contain Tasks
   - Tasks can have Subtasks

3. Task Management
   - Priority levels (low, medium, high)
   - Due dates and completion tracking
   - Rich metadata support
   - Subtask support

4. AI Integration (MCP Server)
   - Complete MCP server with all CRUD operations
   - AI applications can manage tasks programmatically
   - Standardized tool interface for AI tools

5. Modern UI
   - Material-UI components
   - Responsive design
   - Real-time updates
   - Intuitive task management interface

DATABASE SCHEMA
===============

Projects Table:
- id (TEXT PRIMARY KEY)
- name (TEXT NOT NULL)
- description (TEXT)
- color (TEXT DEFAULT '#3B82F6')
- created_at (DATETIME)
- updated_at (DATETIME)
- is_archived (BOOLEAN DEFAULT 0)

Groups Table:
- id (TEXT PRIMARY KEY)
- project_id (TEXT NOT NULL)
- name (TEXT NOT NULL)
- description (TEXT)
- order_index (INTEGER DEFAULT 0)
- created_at (DATETIME)
- updated_at (DATETIME)
- is_archived (BOOLEAN DEFAULT 0)

Task Lists Table:
- id (TEXT PRIMARY KEY)
- group_id (TEXT NOT NULL)
- name (TEXT NOT NULL)
- description (TEXT)
- order_index (INTEGER DEFAULT 0)
- created_at (DATETIME)
- updated_at (DATETIME)
- is_archived (BOOLEAN DEFAULT 0)

Tasks Table:
- id (TEXT PRIMARY KEY)
- task_list_id (TEXT NOT NULL)
- title (TEXT NOT NULL)
- description (TEXT)
- is_completed (BOOLEAN DEFAULT 0)
- priority (TEXT DEFAULT 'medium')
- due_date (DATETIME)
- completed_at (DATETIME)
- order_index (INTEGER DEFAULT 0)
- created_at (DATETIME)
- updated_at (DATETIME)
- metadata (TEXT) -- JSON string for additional metadata

Subtasks Table:
- id (TEXT PRIMARY KEY)
- task_id (TEXT NOT NULL)
- title (TEXT NOT NULL)
- is_completed (BOOLEAN DEFAULT 0)
- completed_at (DATETIME)
- order_index (INTEGER DEFAULT 0)
- created_at (DATETIME)
- updated_at (DATETIME)

INSTALLATION
============

Prerequisites:
- Node.js 18+
- Docker and Docker Compose
- Git

1. Clone the repository:
   git clone <repository-url>
   cd SimpleCheckList

2. Install dependencies:
   npm install
   cd server && npm install
   cd ../client && npm install
   cd ../mcp-server && npm install

3. Initialize the database:
   cd server
   npm run init-db

4. Start the development environment:
   cd ..
   npm run dev

   This will start:
   - Backend API on http://localhost:8355
   - React frontend on http://localhost:8354
   - MCP server (stdio transport)

DOCKER DEPLOYMENT
=================

1. Build and start with Docker Compose:
   docker-compose up --build

2. Access the application:
   - Frontend: http://localhost:8354
   - Backend API: http://localhost:8355
   - Health check: http://localhost:8355/api/health

3. Stop the services:
   docker-compose down

MCP SERVER USAGE
================

The MCP server provides tools for AI applications to manage tasks:

Available Tools:
- list_projects: Get all projects
- create_project: Create a new project
- get_project: Get project details
- update_project: Update project
- delete_project: Delete project
- list_groups: Get groups for a project
- create_group: Create a new group
- list_task_lists: Get task lists for a group
- create_task_list: Create a new task list
- list_tasks: Get tasks for a task list
- create_task: Create a new task
- toggle_task_completion: Toggle task completion
- update_task: Update task
- delete_task: Delete task
- list_subtasks: Get subtasks for a task
- create_subtask: Create a new subtask
- toggle_subtask_completion: Toggle subtask completion
- delete_subtask: Delete subtask
- get_project_stats: Get project statistics
- get_all_tasks: Get all tasks with details

To use the MCP server with an AI application, configure it to connect to the MCP server using stdio transport.

API ENDPOINTS
=============

Projects:
- GET /api/projects - List all projects
- GET /api/projects/:id - Get project by ID
- POST /api/projects - Create project
- PUT /api/projects/:id - Update project
- DELETE /api/projects/:id - Delete project
- GET /api/projects/:id/stats - Get project statistics

Groups:
- GET /api/projects/:projectId/groups - List groups for project
- POST /api/projects/:projectId/groups - Create group
- PUT /api/groups/:id - Update group
- DELETE /api/groups/:id - Delete group

Task Lists:
- GET /api/groups/:groupId/task-lists - List task lists for group
- POST /api/groups/:groupId/task-lists - Create task list
- PUT /api/task-lists/:id - Update task list
- DELETE /api/task-lists/:id - Delete task list

Tasks:
- GET /api/task-lists/:taskListId/tasks - List tasks for task list
- POST /api/task-lists/:taskListId/tasks - Create task
- PUT /api/tasks/:id - Update task
- PATCH /api/tasks/:id/toggle - Toggle task completion
- DELETE /api/tasks/:id - Delete task
- GET /api/tasks/all - Get all tasks with details

Subtasks:
- GET /api/tasks/:taskId/subtasks - List subtasks for task
- POST /api/tasks/:taskId/subtasks - Create subtask
- PATCH /api/subtasks/:id/toggle - Toggle subtask completion
- DELETE /api/subtasks/:id - Delete subtask

DEVELOPMENT
===========

Backend Development:
- cd server
- npm run dev (starts with nodemon)

Frontend Development:
- cd client
- npm start (starts React dev server)

MCP Server Development:
- cd mcp-server
- npm run dev (starts with nodemon)

Database Management:
- Database file: data/checklist.db
- Initialize: npm run init-db (in server directory)
- Reset: Delete data/checklist.db and run init-db again

CONFIGURATION
=============

Environment Variables:
- DATABASE_PATH: Path to SQLite database file
- API_BASE_URL: Backend API URL (for MCP server)
- MCP_PORT: Port for MCP server (if using TCP transport)
- NODE_ENV: Environment (development/production)

Frontend Configuration:
- REACT_APP_API_URL: Backend API URL for frontend

SECURITY
========

- Input validation on all API endpoints
- SQL injection protection with parameterized queries
- CORS enabled for frontend communication
- Helmet.js for security headers
- No authentication (add as needed for production)

TROUBLESHOOTING
===============

1. Database not found:
   - Run: cd server && npm run init-db

2. Port conflicts:
   - Change ports in docker-compose.yml or package.json scripts

3. MCP server not working:
   - Ensure backend API is running
   - Check API_BASE_URL configuration

4. Frontend not connecting to backend:
   - Check REACT_APP_API_URL in client/.env
   - Ensure backend is running on correct port

LICENSE
=======

MIT License - see LICENSE file for details

SUPPORT
=======

For issues and questions, please create an issue in the repository.
