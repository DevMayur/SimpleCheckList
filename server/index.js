const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const { createServer } = require('http');
const { Server } = require('socket.io');
const Database = require('./database');

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 8355;

// Configure Socket.IO with robust CORS settings
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || ["http://localhost:8354", "http://localhost:3000", "http://localhost:8080"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database
const db = new Database();

// Socket.IO connection handling
const connectedClients = new Map();

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  connectedClients.set(socket.id, { socket, joinedRooms: new Set() });

  // Handle joining project rooms for scoped updates
  socket.on('join-project', (projectId) => {
    if (projectId) {
      socket.join(`project:${projectId}`);
      const client = connectedClients.get(socket.id);
      if (client) {
        client.joinedRooms.add(`project:${projectId}`);
      }
      console.log(`Client ${socket.id} joined project room: ${projectId}`);
    }
  });

  // Handle leaving project rooms
  socket.on('leave-project', (projectId) => {
    if (projectId) {
      socket.leave(`project:${projectId}`);
      const client = connectedClients.get(socket.id);
      if (client) {
        client.joinedRooms.delete(`project:${projectId}`);
      }
      console.log(`Client ${socket.id} left project room: ${projectId}`);
    }
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
    connectedClients.delete(socket.id);
  });

  // Handle connection errors
  socket.on('error', (error) => {
    console.error(`Socket error for client ${socket.id}:`, error);
  });
});

// Helper function to emit events to project rooms
const emitToProject = (projectId, event, data) => {
  if (projectId) {
    io.to(`project:${projectId}`).emit(event, data);
    console.log(`Emitted ${event} to project ${projectId}:`, data);
  }
};

// Helper function to get project ID from various entity IDs
const getProjectIdFromEntity = async (entityType, entityId) => {
  try {
    switch (entityType) {
      case 'project':
        return entityId;
      case 'group':
        const group = await db.getGroup(entityId);
        return group?.project_id;
      case 'task_list':
        const taskList = await db.getTaskList(entityId);
        if (taskList) {
          const group = await db.getGroup(taskList.group_id);
          return group?.project_id;
        }
        return null;
      case 'task':
        const task = await db.getTask(entityId);
        if (task) {
          const taskList = await db.getTaskList(task.task_list_id);
          if (taskList) {
            const group = await db.getGroup(taskList.group_id);
            return group?.project_id;
          }
        }
        return null;
      case 'subtask':
        const subtask = await db.getSubtask(entityId);
        if (subtask) {
          return await getProjectIdFromEntity('task', subtask.task_id);
        }
        return null;
      default:
        return null;
    }
  } catch (error) {
    console.error(`Error getting project ID for ${entityType} ${entityId}:`, error);
    return null;
  }
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Projects routes
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await db.getProjects();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    const project = await db.getProject(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const project = {
      id: uuidv4(),
      name: req.body.name,
      description: req.body.description || '',
      color: req.body.color || '#3B82F6'
    };
    await db.createProject(project);
    
    // Emit project creation event
    io.emit('project-created', project);
    
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/projects/:id', async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.color) updates.color = req.body.color;

    await db.updateProject(req.params.id, updates);
    const updatedProject = await db.getProject(req.params.id);
    
    // Emit project update event
    emitToProject(req.params.id, 'project-updated', updatedProject);
    io.emit('project-updated', updatedProject); // Also emit globally for project list
    
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    await db.deleteProject(projectId);
    
    // Emit project deletion event
    emitToProject(projectId, 'project-deleted', { id: projectId });
    io.emit('project-deleted', { id: projectId }); // Also emit globally for project list
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Groups routes
app.get('/api/projects/:projectId/groups', async (req, res) => {
  try {
    const groups = await db.getGroupsByProject(req.params.projectId);
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/projects/:projectId/groups', async (req, res) => {
  try {
    const group = {
      id: uuidv4(),
      project_id: req.params.projectId,
      name: req.body.name,
      description: req.body.description || '',
      order_index: req.body.order_index || 0
    };
    await db.createGroup(group);
    
    // Emit group creation event to project room
    emitToProject(req.params.projectId, 'group-created', group);
    
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/groups/:id', async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.order_index !== undefined) updates.order_index = req.body.order_index;

    await db.updateGroup(req.params.id, updates);
    
    // Get project ID and emit update
    const projectId = await getProjectIdFromEntity('group', req.params.id);
    const updatedGroup = await db.getGroup(req.params.id);
    emitToProject(projectId, 'group-updated', updatedGroup);
    
    res.json({ message: 'Group updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/groups/:id', async (req, res) => {
  try {
    const projectId = await getProjectIdFromEntity('group', req.params.id);
    await db.deleteGroup(req.params.id);
    
    // Emit group deletion event
    emitToProject(projectId, 'group-deleted', { id: req.params.id });
    
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Task Lists routes
app.get('/api/groups/:groupId/task-lists', async (req, res) => {
  try {
    const taskLists = await db.getTaskListsByGroup(req.params.groupId);
    res.json(taskLists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/groups/:groupId/task-lists', async (req, res) => {
  try {
    const taskList = {
      id: uuidv4(),
      group_id: req.params.groupId,
      name: req.body.name,
      description: req.body.description || '',
      order_index: req.body.order_index || 0
    };
    await db.createTaskList(taskList);
    
    // Get project ID and emit task list creation
    const projectId = await getProjectIdFromEntity('group', req.params.groupId);
    emitToProject(projectId, 'task-list-created', taskList);
    
    res.status(201).json(taskList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/task-lists/:id', async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.order_index !== undefined) updates.order_index = req.body.order_index;

    await db.updateTaskList(req.params.id, updates);
    
    // Get project ID and emit update
    const projectId = await getProjectIdFromEntity('task_list', req.params.id);
    const updatedTaskList = await db.getTaskList(req.params.id);
    emitToProject(projectId, 'task-list-updated', updatedTaskList);
    
    res.json({ message: 'Task list updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/task-lists/:id', async (req, res) => {
  try {
    const projectId = await getProjectIdFromEntity('task_list', req.params.id);
    await db.deleteTaskList(req.params.id);
    
    // Emit task list deletion event
    emitToProject(projectId, 'task-list-deleted', { id: req.params.id });
    
    res.json({ message: 'Task list deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tasks routes
app.get('/api/task-lists/:taskListId/tasks', async (req, res) => {
  try {
    const tasks = await db.getTasksByTaskList(req.params.taskListId);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/task-lists/:taskListId/tasks', async (req, res) => {
  try {
    const task = {
      id: uuidv4(),
      task_list_id: req.params.taskListId,
      title: req.body.title,
      description: req.body.description || '',
      priority: req.body.priority || 'medium',
      due_date: req.body.due_date || null,
      order_index: req.body.order_index || 0,
      metadata: req.body.metadata ? JSON.stringify(req.body.metadata) : null
    };
    await db.createTask(task);
    
    // Get project ID and emit task creation
    const projectId = await getProjectIdFromEntity('task_list', req.params.taskListId);
    emitToProject(projectId, 'task-created', task);
    
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const updates = {};
    if (req.body.title) updates.title = req.body.title;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.priority) updates.priority = req.body.priority;
    if (req.body.due_date !== undefined) updates.due_date = req.body.due_date;
    if (req.body.order_index !== undefined) updates.order_index = req.body.order_index;
    if (req.body.metadata !== undefined) updates.metadata = req.body.metadata ? JSON.stringify(req.body.metadata) : null;

    await db.updateTask(req.params.id, updates);
    
    // Get project ID and emit update
    const projectId = await getProjectIdFromEntity('task', req.params.id);
    const updatedTask = await db.getTask(req.params.id);
    emitToProject(projectId, 'task-updated', updatedTask);
    
    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/tasks/:id/toggle', async (req, res) => {
  try {
    await db.toggleTaskCompletion(req.params.id);
    
    // Get project ID and emit toggle event
    const projectId = await getProjectIdFromEntity('task', req.params.id);
    const updatedTask = await db.getTask(req.params.id);
    emitToProject(projectId, 'task-toggled', updatedTask);
    
    res.json({ message: 'Task completion toggled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const projectId = await getProjectIdFromEntity('task', req.params.id);
    await db.deleteTask(req.params.id);
    
    // Emit task deletion event
    emitToProject(projectId, 'task-deleted', { id: req.params.id });
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Subtasks routes
app.get('/api/tasks/:taskId/subtasks', async (req, res) => {
  try {
    const subtasks = await db.getSubtasksByTask(req.params.taskId);
    res.json(subtasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks/:taskId/subtasks', async (req, res) => {
  try {
    const subtask = {
      id: uuidv4(),
      task_id: req.params.taskId,
      title: req.body.title,
      order_index: req.body.order_index || 0
    };
    await db.createSubtask(subtask);
    
    // Get project ID and emit subtask creation
    const projectId = await getProjectIdFromEntity('task', req.params.taskId);
    emitToProject(projectId, 'subtask-created', subtask);
    
    res.status(201).json(subtask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/subtasks/:id/toggle', async (req, res) => {
  try {
    await db.toggleSubtaskCompletion(req.params.id);
    
    // Get project ID and emit subtask toggle event
    const projectId = await getProjectIdFromEntity('subtask', req.params.id);
    const updatedSubtask = await db.getSubtask(req.params.id);
    emitToProject(projectId, 'subtask-toggled', updatedSubtask);
    
    res.json({ message: 'Subtask completion toggled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/subtasks/:id', async (req, res) => {
  try {
    const projectId = await getProjectIdFromEntity('subtask', req.params.id);
    await db.deleteSubtask(req.params.id);
    
    // Emit subtask deletion event
    emitToProject(projectId, 'subtask-deleted', { id: req.params.id });
    
    res.json({ message: 'Subtask deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics routes
app.get('/api/projects/:projectId/stats', async (req, res) => {
  try {
    const stats = await db.getProjectStats(req.params.projectId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tasks/all', async (req, res) => {
  try {
    const tasks = await db.getAllTasksWithDetails();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`WebSocket server ready for connections`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await db.close();
  process.exit(0);
});

module.exports = app;
