#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8355/api';

class SimpleCheckListMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'simple-checklist-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
          logging: {},
        },
      }
    );

    this.cache = new Map(); // Simple cache for resources
    this.setupToolHandlers();
    this.setupResourceHandlers();
    this.setupPromptHandlers();
    this.setupErrorHandling();
  }

  setupToolHandlers() {
    // List all available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'list_projects',
            description: 'Get all projects from SimpleCheckList',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'create_project',
            description: 'Create a new project',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Project name',
                },
                description: {
                  type: 'string',
                  description: 'Project description',
                },
                color: {
                  type: 'string',
                  description: 'Project color (hex code)',
                },
              },
              required: ['name'],
            },
          },
          {
            name: 'get_project',
            description: 'Get a specific project by ID',
            inputSchema: {
              type: 'object',
              properties: {
                project_id: {
                  type: 'string',
                  description: 'Project ID',
                },
              },
              required: ['project_id'],
            },
          },
          {
            name: 'update_project',
            description: 'Update a project',
            inputSchema: {
              type: 'object',
              properties: {
                project_id: {
                  type: 'string',
                  description: 'Project ID',
                },
                name: {
                  type: 'string',
                  description: 'New project name',
                },
                description: {
                  type: 'string',
                  description: 'New project description',
                },
                color: {
                  type: 'string',
                  description: 'New project color',
                },
              },
              required: ['project_id'],
            },
          },
          {
            name: 'delete_project',
            description: 'Delete a project',
            inputSchema: {
              type: 'object',
              properties: {
                project_id: {
                  type: 'string',
                  description: 'Project ID',
                },
              },
              required: ['project_id'],
            },
          },
          {
            name: 'list_groups',
            description: 'Get all groups for a project',
            inputSchema: {
              type: 'object',
              properties: {
                project_id: {
                  type: 'string',
                  description: 'Project ID',
                },
              },
              required: ['project_id'],
            },
          },
          {
            name: 'create_group',
            description: 'Create a new group in a project',
            inputSchema: {
              type: 'object',
              properties: {
                project_id: {
                  type: 'string',
                  description: 'Project ID',
                },
                name: {
                  type: 'string',
                  description: 'Group name',
                },
                description: {
                  type: 'string',
                  description: 'Group description',
                },
                order_index: {
                  type: 'number',
                  description: 'Order index for sorting',
                },
              },
              required: ['project_id', 'name'],
            },
          },
          {
            name: 'list_task_lists',
            description: 'Get all task lists for a group',
            inputSchema: {
              type: 'object',
              properties: {
                group_id: {
                  type: 'string',
                  description: 'Group ID',
                },
              },
              required: ['group_id'],
            },
          },
          {
            name: 'create_task_list',
            description: 'Create a new task list in a group',
            inputSchema: {
              type: 'object',
              properties: {
                group_id: {
                  type: 'string',
                  description: 'Group ID',
                },
                name: {
                  type: 'string',
                  description: 'Task list name',
                },
                description: {
                  type: 'string',
                  description: 'Task list description',
                },
                order_index: {
                  type: 'number',
                  description: 'Order index for sorting',
                },
              },
              required: ['group_id', 'name'],
            },
          },
          {
            name: 'list_tasks',
            description: 'Get all tasks for a task list',
            inputSchema: {
              type: 'object',
              properties: {
                task_list_id: {
                  type: 'string',
                  description: 'Task list ID',
                },
              },
              required: ['task_list_id'],
            },
          },
          {
            name: 'create_task',
            description: 'Create a new task in a task list',
            inputSchema: {
              type: 'object',
              properties: {
                task_list_id: {
                  type: 'string',
                  description: 'Task list ID',
                },
                title: {
                  type: 'string',
                  description: 'Task title',
                },
                description: {
                  type: 'string',
                  description: 'Task description',
                },
                priority: {
                  type: 'string',
                  enum: ['low', 'medium', 'high'],
                  description: 'Task priority',
                },
                due_date: {
                  type: 'string',
                  description: 'Due date (ISO string)',
                },
                metadata: {
                  type: 'object',
                  description: 'Additional task metadata',
                },
              },
              required: ['task_list_id', 'title'],
            },
          },
          {
            name: 'toggle_task_completion',
            description: 'Toggle task completion status',
            inputSchema: {
              type: 'object',
              properties: {
                task_id: {
                  type: 'string',
                  description: 'Task ID',
                },
              },
              required: ['task_id'],
            },
          },
          {
            name: 'update_task',
            description: 'Update a task',
            inputSchema: {
              type: 'object',
              properties: {
                task_id: {
                  type: 'string',
                  description: 'Task ID',
                },
                title: {
                  type: 'string',
                  description: 'New task title',
                },
                description: {
                  type: 'string',
                  description: 'New task description',
                },
                priority: {
                  type: 'string',
                  enum: ['low', 'medium', 'high'],
                  description: 'New task priority',
                },
                due_date: {
                  type: 'string',
                  description: 'New due date (ISO string)',
                },
                metadata: {
                  type: 'object',
                  description: 'New task metadata',
                },
              },
              required: ['task_id'],
            },
          },
          {
            name: 'delete_task',
            description: 'Delete a task',
            inputSchema: {
              type: 'object',
              properties: {
                task_id: {
                  type: 'string',
                  description: 'Task ID',
                },
              },
              required: ['task_id'],
            },
          },
          {
            name: 'list_subtasks',
            description: 'Get all subtasks for a task',
            inputSchema: {
              type: 'object',
              properties: {
                task_id: {
                  type: 'string',
                  description: 'Task ID',
                },
              },
              required: ['task_id'],
            },
          },
          {
            name: 'create_subtask',
            description: 'Create a new subtask',
            inputSchema: {
              type: 'object',
              properties: {
                task_id: {
                  type: 'string',
                  description: 'Task ID',
                },
                title: {
                  type: 'string',
                  description: 'Subtask title',
                },
                order_index: {
                  type: 'number',
                  description: 'Order index for sorting',
                },
              },
              required: ['task_id', 'title'],
            },
          },
          {
            name: 'toggle_subtask_completion',
            description: 'Toggle subtask completion status',
            inputSchema: {
              type: 'object',
              properties: {
                subtask_id: {
                  type: 'string',
                  description: 'Subtask ID',
                },
              },
              required: ['subtask_id'],
            },
          },
          {
            name: 'delete_subtask',
            description: 'Delete a subtask',
            inputSchema: {
              type: 'object',
              properties: {
                subtask_id: {
                  type: 'string',
                  description: 'Subtask ID',
                },
              },
              required: ['subtask_id'],
            },
          },
          {
            name: 'get_project_stats',
            description: 'Get statistics for a project',
            inputSchema: {
              type: 'object',
              properties: {
                project_id: {
                  type: 'string',
                  description: 'Project ID',
                },
              },
              required: ['project_id'],
            },
          },
          {
            name: 'get_all_tasks',
            description: 'Get all tasks with full details across all projects',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'list_projects':
            return await this.listProjects();

          case 'create_project':
            return await this.createProject(args);

          case 'get_project':
            return await this.getProject(args);

          case 'update_project':
            return await this.updateProject(args);

          case 'delete_project':
            return await this.deleteProject(args);

          case 'list_groups':
            return await this.listGroups(args);

          case 'create_group':
            return await this.createGroup(args);

          case 'list_task_lists':
            return await this.listTaskLists(args);

          case 'create_task_list':
            return await this.createTaskList(args);

          case 'list_tasks':
            return await this.listTasks(args);

          case 'create_task':
            return await this.createTask(args);

          case 'toggle_task_completion':
            return await this.toggleTaskCompletion(args);

          case 'update_task':
            return await this.updateTask(args);

          case 'delete_task':
            return await this.deleteTask(args);

          case 'list_subtasks':
            return await this.listSubtasks(args);

          case 'create_subtask':
            return await this.createSubtask(args);

          case 'toggle_subtask_completion':
            return await this.toggleSubtaskCompletion(args);

          case 'delete_subtask':
            return await this.deleteSubtask(args);

          case 'get_project_stats':
            return await this.getProjectStats(args);

          case 'get_all_tasks':
            return await this.getAllTasks();

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  setupResourceHandlers() {
    // List all available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'checklist://projects',
            name: 'All Projects',
            description: 'Complete list of all projects with metadata',
            mimeType: 'application/json',
          },
          {
            uri: 'checklist://tasks/all',
            name: 'All Tasks',
            description: 'All tasks across all projects with full details',
            mimeType: 'application/json',
          },
          {
            uri: 'checklist://stats/summary',
            name: 'System Statistics',
            description: 'Overall system statistics and metrics',
            mimeType: 'application/json',
          },
          {
            uri: 'checklist://projects/{id}',
            name: 'Project Details',
            description: 'Detailed information about a specific project',
            mimeType: 'application/json',
          },
          {
            uri: 'checklist://projects/{id}/hierarchy',
            name: 'Project Hierarchy',
            description: 'Complete hierarchical structure of a project',
            mimeType: 'application/json',
          },
        ],
      };
    });

    // Read specific resources
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      try {
        switch (true) {
          case uri === 'checklist://projects':
            return await this.getProjectsResource();

          case uri === 'checklist://tasks/all':
            return await this.getAllTasksResource();

          case uri === 'checklist://stats/summary':
            return await this.getSystemStatsResource();

          case uri.startsWith('checklist://projects/') && uri.endsWith('/hierarchy'):
            const projectId = uri.split('/')[2];
            return await this.getProjectHierarchyResource(projectId);

          case uri.startsWith('checklist://projects/'):
            const id = uri.split('/')[2];
            return await this.getProjectResource(id);

          default:
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Unknown resource: ${uri}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to read resource ${uri}: ${error.message}`
        );
      }
    });
  }

  setupPromptHandlers() {
    // List all available prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: 'create_project_plan',
            description: 'Create a comprehensive project plan with groups and tasks',
            arguments: [
              {
                name: 'project_name',
                description: 'Name of the project',
                required: true,
              },
              {
                name: 'project_description',
                description: 'Description of the project',
                required: false,
              },
              {
                name: 'complexity',
                description: 'Project complexity level (simple, moderate, complex)',
                required: false,
              },
            ],
          },
          {
            name: 'analyze_project_progress',
            description: 'Analyze project progress and provide insights',
            arguments: [
              {
                name: 'project_id',
                description: 'ID of the project to analyze',
                required: true,
              },
            ],
          },
          {
            name: 'suggest_task_breakdown',
            description: 'Suggest how to break down a complex task',
            arguments: [
              {
                name: 'task_description',
                description: 'Description of the task to break down',
                required: true,
              },
              {
                name: 'priority',
                description: 'Task priority level',
                required: false,
              },
            ],
          },
          {
            name: 'generate_status_report',
            description: 'Generate a comprehensive status report',
            arguments: [
              {
                name: 'project_id',
                description: 'Project ID for the report (optional for all projects)',
                required: false,
              },
              {
                name: 'include_details',
                description: 'Include detailed task information',
                required: false,
              },
            ],
          },
        ],
      };
    });

    // Get specific prompts
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create_project_plan':
            return await this.getCreateProjectPlanPrompt(args);

          case 'analyze_project_progress':
            return await this.getAnalyzeProjectProgressPrompt(args);

          case 'suggest_task_breakdown':
            return await this.getSuggestTaskBreakdownPrompt(args);

          case 'generate_status_report':
            return await this.getGenerateStatusReportPrompt(args);

          default:
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Unknown prompt: ${name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to get prompt ${name}: ${error.message}`
        );
      }
    });
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async makeRequest(method, endpoint, data = null) {
    try {
      const config = {
        method,
        url: `${API_BASE_URL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      throw new Error(`API request failed: ${error.response?.data?.error || error.message}`);
    }
  }

  // Resource implementations
  async getProjectsResource() {
    const projects = await this.makeRequest('GET', '/projects');
    return {
      contents: [
        {
          uri: 'checklist://projects',
          mimeType: 'application/json',
          text: JSON.stringify({
            projects,
            metadata: {
              total: projects.length,
              timestamp: new Date().toISOString(),
            },
          }, null, 2),
        },
      ],
    };
  }

  async getAllTasksResource() {
    const tasks = await this.makeRequest('GET', '/tasks/all');
    return {
      contents: [
        {
          uri: 'checklist://tasks/all',
          mimeType: 'application/json',
          text: JSON.stringify({
            tasks,
            metadata: {
              total: tasks.length,
              completed: tasks.filter(t => t.is_completed === 1 || t.is_completed === true).length,
              timestamp: new Date().toISOString(),
            },
          }, null, 2),
        },
      ],
    };
  }

  async getSystemStatsResource() {
    const projects = await this.makeRequest('GET', '/projects');
    const tasks = await this.makeRequest('GET', '/tasks/all');
    
    const stats = {
      projects: {
        total: projects.length,
        active: projects.filter(p => p.is_archived === 0 || p.is_archived === false).length,
      },
      tasks: {
        total: tasks.length,
        completed: tasks.filter(t => t.is_completed === 1 || t.is_completed === true).length,
        by_priority: {
          high: tasks.filter(t => t.priority === 'high').length,
          medium: tasks.filter(t => t.priority === 'medium').length,
          low: tasks.filter(t => t.priority === 'low').length,
        },
      },
      completion_rate: tasks.length > 0 ? (tasks.filter(t => t.is_completed === 1 || t.is_completed === true).length / tasks.length * 100).toFixed(2) : 0,
      timestamp: new Date().toISOString(),
    };

    return {
      contents: [
        {
          uri: 'checklist://stats/summary',
          mimeType: 'application/json',
          text: JSON.stringify(stats, null, 2),
        },
      ],
    };
  }

  async getProjectResource(projectId) {
    const project = await this.makeRequest('GET', `/projects/${projectId}`);
    const stats = await this.makeRequest('GET', `/projects/${projectId}/stats`);
    
    return {
      contents: [
        {
          uri: `checklist://projects/${projectId}`,
          mimeType: 'application/json',
          text: JSON.stringify({
            project,
            statistics: stats,
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  }

  async getProjectHierarchyResource(projectId) {
    const project = await this.makeRequest('GET', `/projects/${projectId}`);
    const groups = await this.makeRequest('GET', `/projects/${projectId}/groups`);
    
    const hierarchy = {
      project,
      groups: await Promise.all(groups.map(async (group) => {
        const taskLists = await this.makeRequest('GET', `/groups/${group.id}/task-lists`);
        return {
          ...group,
          task_lists: await Promise.all(taskLists.map(async (taskList) => {
            const tasks = await this.makeRequest('GET', `/task-lists/${taskList.id}/tasks`);
            return {
              ...taskList,
              tasks: await Promise.all(tasks.map(async (task) => {
                const subtasks = await this.makeRequest('GET', `/tasks/${task.id}/subtasks`);
                return {
                  ...task,
                  subtasks,
                };
              })),
            };
          })),
        };
      })),
      timestamp: new Date().toISOString(),
    };

    return {
      contents: [
        {
          uri: `checklist://projects/${projectId}/hierarchy`,
          mimeType: 'application/json',
          text: JSON.stringify(hierarchy, null, 2),
        },
      ],
    };
  }

  // Prompt implementations
  async getCreateProjectPlanPrompt(args) {
    const { project_name, project_description = '', complexity = 'moderate' } = args;
    
    let prompt = `Create a comprehensive project plan for "${project_name}".\n\n`;
    
    if (project_description) {
      prompt += `Project Description: ${project_description}\n\n`;
    }
    
    prompt += `Complexity Level: ${complexity}\n\n`;
    prompt += `Please create a structured project plan with:\n`;
    prompt += `1. Project groups to organize different aspects\n`;
    prompt += `2. Task lists within each group\n`;
    prompt += `3. Individual tasks with appropriate priorities\n`;
    prompt += `4. Consider the ${complexity} complexity level when determining scope\n\n`;
    
    if (complexity === 'simple') {
      prompt += `For a simple project, create 1-2 groups with 2-3 task lists each, and 3-5 tasks per list.\n`;
    } else if (complexity === 'moderate') {
      prompt += `For a moderate project, create 2-4 groups with 3-5 task lists each, and 5-8 tasks per list.\n`;
    } else {
      prompt += `For a complex project, create 4-6 groups with 5-8 task lists each, and 8-12 tasks per list.\n`;
    }
    
    prompt += `\nUse the available MCP tools to create the project structure systematically.`;

    return {
      description: `Project planning prompt for "${project_name}"`,
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: prompt,
          },
        },
      ],
    };
  }

  async getAnalyzeProjectProgressPrompt(args) {
    const { project_id } = args;
    
    const project = await this.makeRequest('GET', `/projects/${project_id}`);
    const stats = await this.makeRequest('GET', `/projects/${project_id}/stats`);
    const hierarchy = await this.getProjectHierarchyResource(project_id);
    
    const prompt = `Analyze the progress of project "${project.name}" (ID: ${project_id}).\n\n` +
      `Current Statistics:\n` +
      `- Total Groups: ${stats.total_groups}\n` +
      `- Total Task Lists: ${stats.total_task_lists}\n` +
      `- Total Tasks: ${stats.total_tasks}\n` +
      `- Completed Tasks: ${stats.completed_tasks}\n` +
      `- Completion Rate: ${(stats.completed_tasks / stats.total_tasks * 100).toFixed(1)}%\n\n` +
      `Project Structure:\n${hierarchy.contents[0].text}\n\n` +
      `Please provide:\n` +
      `1. Overall progress assessment\n` +
      `2. Identification of bottlenecks or blocked areas\n` +
      `3. Recommendations for improving completion rate\n` +
      `4. Priority adjustments if needed\n` +
      `5. Timeline estimation for remaining work`;

    return {
      description: `Progress analysis for project "${project.name}"`,
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: prompt,
          },
        },
      ],
    };
  }

  async getSuggestTaskBreakdownPrompt(args) {
    const { task_description, priority = 'medium' } = args;
    
    const prompt = `Break down this task into smaller, manageable subtasks:\n\n` +
      `Task: ${task_description}\n` +
      `Priority: ${priority}\n\n` +
      `Please suggest:\n` +
      `1. 3-7 specific subtasks that together complete the main task\n` +
      `2. Logical order for completing the subtasks\n` +
      `3. Estimated effort level for each subtask\n` +
      `4. Any dependencies between subtasks\n` +
      `5. Potential risks or challenges to consider\n\n` +
      `Format the response so I can easily create the subtasks using the MCP tools.`;

    return {
      description: `Task breakdown suggestion for: ${task_description}`,
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: prompt,
          },
        },
      ],
    };
  }

  async getGenerateStatusReportPrompt(args) {
    const { project_id, include_details = 'false' } = args;
    
    let prompt = '';
    let data = {};
    
    if (project_id) {
      const project = await this.makeRequest('GET', `/projects/${project_id}`);
      const stats = await this.makeRequest('GET', `/projects/${project_id}/stats`);
      data = { project, stats };
      
      prompt = `Generate a comprehensive status report for project "${project.name}".\n\n`;
    } else {
      const projects = await this.makeRequest('GET', '/projects');
      const allTasks = await this.makeRequest('GET', '/tasks/all');
      data = { projects, allTasks };
      
      prompt = `Generate a comprehensive status report for all projects in the system.\n\n`;
    }
    
    prompt += `Available data:\n${JSON.stringify(data, null, 2)}\n\n`;
    prompt += `Please create a professional status report including:\n`;
    prompt += `1. Executive summary\n`;
    prompt += `2. Key metrics and statistics\n`;
    prompt += `3. Progress highlights\n`;
    prompt += `4. Areas of concern or delays\n`;
    prompt += `5. Upcoming milestones\n`;
    prompt += `6. Recommendations for next steps\n\n`;
    
    if (include_details === 'true') {
      prompt += `Include detailed task-level information and individual progress updates.\n`;
    }

    return {
      description: project_id ? `Status report for specific project` : `System-wide status report`,
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: prompt,
          },
        },
      ],
    };
  }

  // Project methods
  async listProjects() {
    const projects = await this.makeRequest('GET', '/projects');
    return {
      content: [
        {
          type: 'text',
          text: `Found ${projects.length} projects:\n${JSON.stringify(projects, null, 2)}`,
        },
      ],
    };
  }

  async createProject(args) {
    const project = await this.makeRequest('POST', '/projects', args);
    return {
      content: [
        {
          type: 'text',
          text: `Project created successfully:\n${JSON.stringify(project, null, 2)}`,
        },
      ],
    };
  }

  async getProject(args) {
    const project = await this.makeRequest('GET', `/projects/${args.project_id}`);
    return {
      content: [
        {
          type: 'text',
          text: `Project details:\n${JSON.stringify(project, null, 2)}`,
        },
      ],
    };
  }

  async updateProject(args) {
    const { project_id, ...updates } = args;
    await this.makeRequest('PUT', `/projects/${project_id}`, updates);
    return {
      content: [
        {
          type: 'text',
          text: 'Project updated successfully',
        },
      ],
    };
  }

  async deleteProject(args) {
    await this.makeRequest('DELETE', `/projects/${args.project_id}`);
    return {
      content: [
        {
          type: 'text',
          text: 'Project deleted successfully',
        },
      ],
    };
  }

  // Group methods
  async listGroups(args) {
    const groups = await this.makeRequest('GET', `/projects/${args.project_id}/groups`);
    return {
      content: [
        {
          type: 'text',
          text: `Found ${groups.length} groups:\n${JSON.stringify(groups, null, 2)}`,
        },
      ],
    };
  }

  async createGroup(args) {
    const group = await this.makeRequest('POST', `/projects/${args.project_id}/groups`, args);
    return {
      content: [
        {
          type: 'text',
          text: `Group created successfully:\n${JSON.stringify(group, null, 2)}`,
        },
      ],
    };
  }

  // Task List methods
  async listTaskLists(args) {
    const taskLists = await this.makeRequest('GET', `/groups/${args.group_id}/task-lists`);
    return {
      content: [
        {
          type: 'text',
          text: `Found ${taskLists.length} task lists:\n${JSON.stringify(taskLists, null, 2)}`,
        },
      ],
    };
  }

  async createTaskList(args) {
    const taskList = await this.makeRequest('POST', `/groups/${args.group_id}/task-lists`, args);
    return {
      content: [
        {
          type: 'text',
          text: `Task list created successfully:\n${JSON.stringify(taskList, null, 2)}`,
        },
      ],
    };
  }

  // Task methods
  async listTasks(args) {
    const tasks = await this.makeRequest('GET', `/task-lists/${args.task_list_id}/tasks`);
    return {
      content: [
        {
          type: 'text',
          text: `Found ${tasks.length} tasks:\n${JSON.stringify(tasks, null, 2)}`,
        },
      ],
    };
  }

  async createTask(args) {
    const task = await this.makeRequest('POST', `/task-lists/${args.task_list_id}/tasks`, args);
    return {
      content: [
        {
          type: 'text',
          text: `Task created successfully:\n${JSON.stringify(task, null, 2)}`,
        },
      ],
    };
  }

  async toggleTaskCompletion(args) {
    await this.makeRequest('PATCH', `/tasks/${args.task_id}/toggle`);
    return {
      content: [
        {
          type: 'text',
          text: 'Task completion status toggled successfully',
        },
      ],
    };
  }

  async updateTask(args) {
    const { task_id, ...updates } = args;
    await this.makeRequest('PUT', `/tasks/${task_id}`, updates);
    return {
      content: [
        {
          type: 'text',
          text: 'Task updated successfully',
        },
      ],
    };
  }

  async deleteTask(args) {
    await this.makeRequest('DELETE', `/tasks/${args.task_id}`);
    return {
      content: [
        {
          type: 'text',
          text: 'Task deleted successfully',
        },
      ],
    };
  }

  // Subtask methods
  async listSubtasks(args) {
    const subtasks = await this.makeRequest('GET', `/tasks/${args.task_id}/subtasks`);
    return {
      content: [
        {
          type: 'text',
          text: `Found ${subtasks.length} subtasks:\n${JSON.stringify(subtasks, null, 2)}`,
        },
      ],
    };
  }

  async createSubtask(args) {
    const subtask = await this.makeRequest('POST', `/tasks/${args.task_id}/subtasks`, args);
    return {
      content: [
        {
          type: 'text',
          text: `Subtask created successfully:\n${JSON.stringify(subtask, null, 2)}`,
        },
      ],
    };
  }

  async toggleSubtaskCompletion(args) {
    await this.makeRequest('PATCH', `/subtasks/${args.subtask_id}/toggle`);
    return {
      content: [
        {
          type: 'text',
          text: 'Subtask completion status toggled successfully',
        },
      ],
    };
  }

  async deleteSubtask(args) {
    await this.makeRequest('DELETE', `/subtasks/${args.subtask_id}`);
    return {
      content: [
        {
          type: 'text',
          text: 'Subtask deleted successfully',
        },
      ],
    };
  }

  // Analytics methods
  async getProjectStats(args) {
    const stats = await this.makeRequest('GET', `/projects/${args.project_id}/stats`);
    return {
      content: [
        {
          type: 'text',
          text: `Project statistics:\n${JSON.stringify(stats, null, 2)}`,
        },
      ],
    };
  }

  async getAllTasks() {
    const tasks = await this.makeRequest('GET', '/tasks/all');
    return {
      content: [
        {
          type: 'text',
          text: `Found ${tasks.length} tasks across all projects:\n${JSON.stringify(tasks, null, 2)}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('SimpleCheckList MCP Server running on stdio');
  }
}

const server = new SimpleCheckListMCPServer();
server.run().catch(console.error);
