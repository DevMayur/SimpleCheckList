# SimpleCheckList MCP - AI Agent Quick Reference
# ================================================

## 🚀 ESSENTIAL WORKFLOW FOR AI AGENTS

### **1. START EVERY PROJECT**
```javascript
// Create project
const project = await mcp_call('create_project', {
  name: "Your Project Name",
  description: "Brief description of what you're building",
  color: "#3B82F6"
});

// Create standard groups
const frontend = await mcp_call('create_group', { project_id: project.id, name: "Frontend" });
const backend = await mcp_call('create_group', { project_id: project.id, name: "Backend" });
const database = await mcp_call('create_group', { project_id: project.id, name: "Database" });

// Get AI planning help
const plan = await mcp_prompt('create_project_plan', {
  project_name: project.name,
  complexity: "moderate" // simple, moderate, complex
});
```

### **2. CREATE FEATURES**
```javascript
// Create feature task
const task = await mcp_call('create_task', {
  task_list_id: taskListId,
  title: "Implement [Feature Name]",
  description: "Detailed description of the feature",
  priority: "high", // high, medium, low
  metadata: {
    files: ["file1.js", "file2.tsx"],
    dependencies: ["other task names"],
    acceptance_criteria: ["criteria 1", "criteria 2"]
  }
});

// Break down complex tasks
const breakdown = await mcp_prompt('suggest_task_breakdown', {
  task_description: task.description,
  priority: task.priority
});

// Create subtasks from AI suggestions
await mcp_call('create_subtask', {
  task_id: task.id,
  title: "Subtask name",
  order_index: 1
});
```

### **3. TRACK PROGRESS**
```javascript
// Mark tasks complete
await mcp_call('toggle_task_completion', { task_id });
await mcp_call('toggle_subtask_completion', { subtask_id });

// Check progress
const stats = await mcp_call('get_project_stats', { project_id });
console.log(`Progress: ${stats.completed_tasks}/${stats.total_tasks}`);

// Get AI analysis
const analysis = await mcp_prompt('analyze_project_progress', { project_id });
```

## 🔧 ALL AVAILABLE TOOLS

### **Projects**
- `list_projects` - Get all projects
- `create_project` - Create new project
- `get_project` - Get project details
- `update_project` - Update project
- `delete_project` - Delete project
- `get_project_stats` - Get project statistics

### **Groups & Task Lists**
- `list_groups` - Get groups for project
- `create_group` - Create new group
- `list_task_lists` - Get task lists for group
- `create_task_list` - Create new task list

### **Tasks & Subtasks**
- `list_tasks` - Get tasks for task list
- `create_task` - Create new task
- `update_task` - Update task
- `delete_task` - Delete task
- `toggle_task_completion` - Toggle task completion
- `get_all_tasks` - Get all tasks with details
- `list_subtasks` - Get subtasks for task
- `create_subtask` - Create new subtask
- `toggle_subtask_completion` - Toggle subtask completion
- `delete_subtask` - Delete subtask

## 📚 RESOURCES (Real-time Data)

- `checklist://projects` - All projects with metadata
- `checklist://tasks/all` - All tasks with completion stats
- `checklist://stats/summary` - System-wide statistics
- `checklist://projects/{id}` - Specific project details
- `checklist://projects/{id}/hierarchy` - Complete project structure

## 🎯 AI PROMPTS

- `create_project_plan` - Get AI help planning projects
- `analyze_project_progress` - Get AI progress analysis
- `suggest_task_breakdown` - Break down complex tasks
- `generate_status_report` - Create professional reports

## 💡 QUICK PATTERNS

### **Web App Setup**
```javascript
const webApp = await mcp_call('create_project', {
  name: "My Web App",
  description: "Full-stack web application",
  color: "#10B981"
});

// Create groups: Frontend, Backend, Database, Testing, Documentation
```

### **API Endpoint Task**
```javascript
await mcp_call('create_task', {
  task_list_id: apiTaskListId,
  title: "POST /api/users - Create User",
  description: "Create user endpoint with validation",
  priority: "high",
  metadata: {
    endpoint: "POST /api/users",
    file: "routes/users.js",
    tests: "tests/users.test.js"
  }
});
```

### **UI Component Task**
```javascript
await mcp_call('create_task', {
  task_list_id: uiTaskListId,
  title: "Create LoginForm component",
  description: "Reusable login form with validation",
  priority: "medium",
  metadata: {
    component: "LoginForm.tsx",
    tests: "LoginForm.test.tsx",
    props: { onSubmit: "function", loading: "boolean" }
  }
});
```

### **Bug Fix Task**
```javascript
await mcp_call('create_task', {
  task_list_id: bugFixTaskListId,
  title: "Fix: Login validation on mobile",
  description: "Validation errors not showing on mobile devices",
  priority: "high",
  metadata: {
    bug_type: "critical",
    affected_platforms: ["iOS Safari", "Android Chrome"],
    files_to_check: ["LoginForm.tsx", "validation.ts"]
  }
});
```

## ⚡ COPY-PASTE SNIPPETS

### **Daily Progress Check**
```javascript
const stats = await mcp_call('get_project_stats', { project_id });
const analysis = await mcp_prompt('analyze_project_progress', { project_id });
console.log(`Progress: ${stats.completed_tasks}/${stats.total_tasks} (${Math.round(stats.completed_tasks/stats.total_tasks*100)}%)`);
```

### **Feature Complete Workflow**
```javascript
// 1. Create task
const task = await mcp_call('create_task', { /* task details */ });

// 2. Break down
const breakdown = await mcp_prompt('suggest_task_breakdown', { task_description: task.description });

// 3. Create subtasks
// ... create subtasks based on breakdown ...

// 4. Implement and mark complete
await mcp_call('toggle_task_completion', { task_id: task.id });
```

### **Weekly Report**
```javascript
const report = await mcp_prompt('generate_status_report', {
  project_id,
  include_details: 'true'
});
console.log("📊 Weekly Report:", report);
```

## 🎯 REMEMBER

1. **Always create a project first** - Don't start coding without project structure
2. **Use descriptive names** - Make tasks searchable and clear
3. **Break down complex tasks** - Use AI assistance for task breakdown
4. **Track progress regularly** - Mark tasks complete as you finish them
5. **Use metadata** - Store file paths, dependencies, and technical details
6. **Leverage AI prompts** - Get intelligent assistance for planning and analysis

## 🔗 INTEGRATION

Add to your AI assistant configuration:
```json
{
  "mcpServers": {
    "simple-checklist": {
      "command": "node",
      "args": ["/Users/mayurkakade/SimpleCheckList/mcp-server/index.js"],
      "env": {
        "API_BASE_URL": "http://localhost:8355/api"
      }
    }
  }
}
```

**That's it! You're ready to build complete projects with AI-powered task management! 🚀**
