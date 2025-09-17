SimpleCheckList MCP Server
===========================

A comprehensive Model Context Protocol (MCP) server for advanced task and project management with AI integration.

OVERVIEW
========

The SimpleCheckList MCP Server provides AI applications with powerful tools for managing complex projects through a hierarchical structure. It supports the complete project lifecycle from planning to completion, with built-in analytics and AI-powered planning assistance.

Key Features:
- Hierarchical project organization (Projects → Groups → Task Lists → Tasks → Subtasks)
- 20 comprehensive tools for complete CRUD operations
- 5 resource endpoints for real-time data access
- 4 AI-powered planning and analysis prompts
- Built-in security and validation
- SQLite database with full transaction support
- Real-time analytics and progress tracking

ARCHITECTURE
============

The MCP server follows a clean, hierarchical architecture:

1. Projects: Top-level containers for related work
2. Groups: Organize different aspects of a project (Frontend, Backend, Testing, etc.)
3. Task Lists: Specific feature sets or components within groups
4. Tasks: Individual work items with priority, due dates, and rich metadata
5. Subtasks: Granular breakdown of complex tasks

This structure allows AI applications to understand and manage complex projects with appropriate context and organization.

INSTALLATION
============

Prerequisites:
- Node.js 18 or higher
- SimpleCheckList backend API running on localhost:8355

Quick Start:
1. Clone the repository:
   git clone https://github.com/mayurkakade/SimpleCheckList.git
   cd SimpleCheckList

2. Install dependencies:
   cd mcp-server
   npm install

3. Configure environment:
   export API_BASE_URL=http://localhost:8355/api

4. Start the MCP server:
   node index.js

For Claude Desktop integration, add to your Claude configuration:
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

TOOLS REFERENCE
===============

Project Management (5 tools):
- list_projects: Get all projects with metadata
- create_project: Create new project with name, description, color
- get_project: Retrieve specific project details
- update_project: Modify project properties
- delete_project: Remove project and all contents

Group Management (2 tools):
- list_groups: Get groups for a specific project
- create_group: Create new group within project

Task List Management (2 tools):
- list_task_lists: Get task lists for a specific group
- create_task_list: Create new task list within group

Task Management (6 tools):
- list_tasks: Get tasks for a specific task list
- create_task: Create new task with title, description, priority, due date, metadata
- toggle_task_completion: Mark task as completed/incomplete
- update_task: Modify task properties
- delete_task: Remove task and all subtasks
- get_all_tasks: Retrieve all tasks across all projects with full details

Subtask Management (3 tools):
- list_subtasks: Get subtasks for a specific task
- create_subtask: Create new subtask within task
- toggle_subtask_completion: Mark subtask as completed/incomplete
- delete_subtask: Remove subtask

Analytics (2 tools):
- get_project_stats: Get comprehensive statistics for a project
- get_all_tasks: Get system-wide task data for analysis

RESOURCES REFERENCE
===================

The server provides 5 resource endpoints for real-time data access:

1. checklist://projects
   - Complete list of all projects with metadata
   - Includes project count and timestamp

2. checklist://tasks/all
   - All tasks across all projects with full details
   - Includes completion statistics and metadata

3. checklist://stats/summary
   - System-wide statistics and metrics
   - Project counts, task completion rates, priority distribution

4. checklist://projects/{id}
   - Detailed information about a specific project
   - Includes project data and statistics

5. checklist://projects/{id}/hierarchy
   - Complete hierarchical structure of a project
   - Full tree with all groups, task lists, tasks, and subtasks

PROMPTS REFERENCE
=================

The server includes 4 AI-powered prompts for enhanced functionality:

1. create_project_plan
   Parameters: project_name, project_description, complexity
   Creates comprehensive project plans with appropriate structure based on complexity level

2. analyze_project_progress
   Parameters: project_id
   Provides detailed progress analysis with bottleneck identification and recommendations

3. suggest_task_breakdown
   Parameters: task_description, priority
   Suggests optimal subtask breakdown for complex tasks

4. generate_status_report
   Parameters: project_id (optional), include_details
   Generates professional status reports with metrics and insights

USAGE EXAMPLES
==============

Creating a Web Application Project:

1. Create the project:
   create_project({
     name: "E-commerce Platform",
     description: "Full-stack e-commerce application with React and Node.js",
     color: "#2563EB"
   })

2. Create groups:
   create_group({
     project_id: "project-id",
     name: "Frontend",
     description: "React UI components and user experience"
   })

3. Create task lists:
   create_task_list({
     group_id: "group-id",
     name: "User Authentication",
     description: "Login, registration, and user management"
   })

4. Create tasks with metadata:
   create_task({
     task_list_id: "task-list-id",
     title: "Implement login form",
     description: "Create responsive login form with validation",
     priority: "high",
     metadata: {
       files: ["LoginForm.tsx", "auth.service.ts"],
       acceptance_criteria: [
         "Form validates email format",
         "Shows appropriate error messages",
         "Integrates with authentication API"
       ]
     }
   })

AI Planning Integration:

Use the create_project_plan prompt to get AI assistance:
create_project_plan({
  project_name: "Mobile App Development",
  project_description: "Cross-platform mobile app with offline capabilities",
  complexity: "complex"
})

This will generate a comprehensive project structure with appropriate groups, task lists, and tasks.

SECURITY FEATURES
=================

The MCP server implements comprehensive security measures:

- Input validation on all parameters
- SQL injection protection with parameterized queries
- CORS configuration for secure cross-origin requests
- Helmet.js security headers
- Error handling with proper error codes
- Request timeout protection
- Resource caching for performance

PERFORMANCE OPTIMIZATION
========================

- Efficient SQLite queries with proper indexing
- Resource caching to reduce database load
- Batch operations for bulk updates
- Connection pooling for database access
- Memory-efficient data structures
- Optimized JSON serialization

ERROR HANDLING
==============

The server provides comprehensive error handling:

- Proper MCP error codes (InvalidRequest, InternalError)
- Detailed error messages for debugging
- Graceful degradation for network issues
- Transaction rollback on failures
- Logging for monitoring and debugging

DEVELOPMENT WORKFLOW INTEGRATION
===============================

The MCP server is designed to integrate seamlessly with development workflows:

1. Project Initialization:
   - Use create_project_plan prompt for AI-assisted planning
   - Create standard groups (Frontend, Backend, Database, Testing)
   - Set up task lists for major features

2. Feature Development:
   - Create tasks with detailed metadata including file paths
   - Use suggest_task_breakdown for complex features
   - Track progress with completion toggles

3. Progress Monitoring:
   - Use analyze_project_progress for insights
   - Generate status reports for stakeholders
   - Monitor completion rates and bottlenecks

TROUBLESHOOTING
===============

Common Issues and Solutions:

1. "API request failed" errors:
   - Ensure SimpleCheckList backend is running on localhost:8355
   - Check API_BASE_URL environment variable
   - Verify network connectivity

2. "Unknown tool" errors:
   - Update to latest MCP SDK version
   - Verify tool names match exactly
   - Check MCP client configuration

3. Database errors:
   - Ensure SQLite database is initialized
   - Check file permissions on database file
   - Verify database schema is up to date

4. Performance issues:
   - Monitor database query performance
   - Check for large result sets
   - Consider implementing pagination for large projects

CONTRIBUTING
============

We welcome contributions to improve the SimpleCheckList MCP Server:

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit pull request with detailed description

Guidelines:
- Follow existing code style
- Add comprehensive tests
- Update documentation
- Ensure security best practices

LICENSE
=======

MIT License - see LICENSE file for details.

SUPPORT
=======

For issues, questions, or feature requests:
- Create an issue on GitHub: https://github.com/mayurkakade/SimpleCheckList/issues
- Check existing documentation and examples
- Review troubleshooting guide above

Version: 1.0.0
Last Updated: September 2025
MCP Protocol Version: 1.0
