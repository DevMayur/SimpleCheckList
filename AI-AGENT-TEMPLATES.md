# SimpleCheckList MCP - AI Agent Templates
# ==========================================

## 🎯 READY-TO-USE TEMPLATES FOR AI AGENTS

### **📋 Project Creation Templates**

#### **Web Application Project**
```javascript
// Full-stack web application
{
  name: "[App Name] - Full Stack Web Application",
  description: "Complete web application with [Frontend Framework] frontend, [Backend Framework] backend, and [Database] database. Features include user authentication, [core features], and responsive design.",
  color: "#3B82F6"
}

// Groups to create:
- Frontend Development
- Backend Development  
- Database Design
- API Integration
- Testing & QA
- Deployment & DevOps
- Documentation
```

#### **Mobile Application Project**
```javascript
{
  name: "[App Name] - Mobile Application",
  description: "Cross-platform mobile application using [React Native/Flutter]. Features include [core features], offline support, and push notifications.",
  color: "#10B981"
}

// Groups to create:
- UI/UX Development
- Core Features
- Platform Integration
- Testing
- App Store Deployment
- Documentation
```

#### **API/Backend Service Project**
```javascript
{
  name: "[Service Name] - Backend API Service",
  description: "RESTful API service built with [Framework]. Provides [core functionality] with authentication, rate limiting, and comprehensive documentation.",
  color: "#F59E0B"
}

// Groups to create:
- API Endpoints
- Authentication & Security
- Database Integration
- Third-party Integrations
- Testing & Validation
- Documentation
- Deployment
```

### **🏗️ Standard Group Templates**

#### **Frontend Development Group**
```javascript
{
  name: "Frontend Development",
  description: "User interface components, pages, and client-side functionality"
}

// Standard Task Lists:
- "UI Components" (buttons, forms, modals, etc.)
- "Pages & Navigation" (routing, page layouts)
- "State Management" (Redux, Context, etc.)
- "Styling & Theming" (CSS, styled-components)
- "User Experience" (animations, interactions)
```

#### **Backend Development Group**
```javascript
{
  name: "Backend Development", 
  description: "Server-side logic, API endpoints, and business rules"
}

// Standard Task Lists:
- "Authentication & Authorization"
- "Core API Endpoints"
- "Data Validation & Processing"
- "External Service Integration"
- "Error Handling & Logging"
```

#### **Database Design Group**
```javascript
{
  name: "Database Design",
  description: "Database schema, migrations, and data management"
}

// Standard Task Lists:
- "Schema Design"
- "Data Models & Relationships"
- "Migrations & Seeding"
- "Queries & Optimization"
- "Backup & Recovery"
```

### **📝 Task Creation Templates**

#### **Feature Implementation Task**
```javascript
{
  title: "Implement [Feature Name]",
  description: "Complete implementation of [feature description] including [specific requirements]",
  priority: "high", // or "medium", "low"
  metadata: {
    feature_type: "core", // or "enhancement", "bug_fix"
    files: [
      "components/FeatureName.tsx",
      "services/featureService.ts", 
      "tests/FeatureName.test.ts"
    ],
    dependencies: [
      "User authentication system",
      "Database schema setup"
    ],
    acceptance_criteria: [
      "Users can [action 1]",
      "System validates [validation 1]", 
      "Error handling for [scenario 1]",
      "Responsive design works on mobile"
    ],
    technical_notes: "Use [specific library/approach] for [technical detail]"
  }
}
```

#### **API Endpoint Task**
```javascript
{
  title: "Create [HTTP Method] [endpoint] endpoint",
  description: "[HTTP Method] [endpoint] - [description of functionality]",
  priority: "high",
  metadata: {
    endpoint: "[HTTP Method] /api/[path]",
    file: "routes/[routeName].js",
    controller: "controllers/[controllerName].js",
    model: "models/[ModelName].js",
    tests: "tests/[endpoint].test.js",
    request_body: {
      // Expected request structure
    },
    response_format: {
      // Expected response structure  
    },
    authentication: "JWT required", // or "Public", "API Key"
    rate_limiting: "100 requests/hour"
  }
}
```

#### **UI Component Task**
```javascript
{
  title: "Create [Component Name] component",
  description: "Reusable [component type] component with [specific functionality]",
  priority: "medium",
  metadata: {
    component_file: "components/[ComponentName].tsx",
    style_file: "components/[ComponentName].module.css",
    test_file: "components/__tests__/[ComponentName].test.tsx",
    story_file: "components/[ComponentName].stories.tsx",
    props: {
      // Component props interface
    },
    accessibility: "WCAG 2.1 AA compliant",
    responsive: "Mobile-first design"
  }
}
```

#### **Database Task**
```javascript
{
  title: "Design [Entity] database schema",
  description: "Create database schema for [entity] with relationships and constraints",
  priority: "high", 
  metadata: {
    table_name: "[entity_name]",
    migration_file: "migrations/create_[entity_name].js",
    model_file: "models/[EntityName].js",
    relationships: [
      "belongs_to: User",
      "has_many: [RelatedEntity]"
    ],
    indexes: [
      "user_id",
      "created_at",
      "status"
    ],
    constraints: [
      "email must be unique",
      "name cannot be null"
    ]
  }
}
```

### **🔧 Subtask Templates**

#### **Implementation Subtasks**
```javascript
// For any feature task, create these subtasks:
[
  {
    title: "Set up basic component structure",
    order_index: 1
  },
  {
    title: "Implement core functionality", 
    order_index: 2
  },
  {
    title: "Add input validation and error handling",
    order_index: 3
  },
  {
    title: "Write unit tests",
    order_index: 4
  },
  {
    title: "Add responsive styling",
    order_index: 5
  },
  {
    title: "Update documentation",
    order_index: 6
  }
]
```

#### **API Endpoint Subtasks**
```javascript
[
  {
    title: "Define route and middleware",
    order_index: 1
  },
  {
    title: "Implement request validation",
    order_index: 2
  },
  {
    title: "Add business logic",
    order_index: 3
  },
  {
    title: "Handle database operations",
    order_index: 4
  },
  {
    title: "Implement error responses",
    order_index: 5
  },
  {
    title: "Write integration tests",
    order_index: 6
  },
  {
    title: "Update API documentation",
    order_index: 7
  }
]
```

### **📊 Progress Tracking Templates**

#### **Daily Standup Template**
```javascript
// Use these MCP calls for daily progress:

// 1. Get current project stats
const stats = await mcp_call('get_project_stats', { project_id });

// 2. Get today's completed tasks  
const tasks = await mcp_call('get_all_tasks');
const todaysTasks = tasks.filter(task => 
  task.completed_at && 
  isToday(task.completed_at)
);

// 3. Generate status update
const report = await mcp_call('generate_status_report', {
  project_id,
  include_details: 'true'
});
```

#### **Sprint Planning Template**
```javascript
// Sprint planning workflow:

// 1. Analyze current progress
const analysis = await mcp_prompt('analyze_project_progress', {
  project_id
});

// 2. Create sprint tasks based on priority
const highPriorityTasks = await mcp_call('get_all_tasks').then(tasks =>
  tasks.filter(t => t.priority === 'high' && !t.is_completed)
);

// 3. Break down complex tasks
for (const task of complexTasks) {
  const breakdown = await mcp_prompt('suggest_task_breakdown', {
    task_description: task.description,
    priority: task.priority
  });
}
```

### **🎨 Prompt Usage Templates**

#### **Project Planning Prompt**
```javascript
// Use at project start
const projectPlan = await mcp_prompt('create_project_plan', {
  project_name: "E-commerce Platform",
  project_description: "Full-stack e-commerce with payment integration",
  complexity: "complex" // simple, moderate, complex
});

// Then create the suggested structure
```

#### **Task Breakdown Prompt**
```javascript
// Use for complex features
const taskBreakdown = await mcp_prompt('suggest_task_breakdown', {
  task_description: "Implement real-time chat system with WebSocket support, message history, file sharing, and emoji reactions",
  priority: "high"
});

// Create subtasks based on suggestions
```

#### **Progress Analysis Prompt**
```javascript
// Use weekly or at milestones
const progressAnalysis = await mcp_prompt('analyze_project_progress', {
  project_id: currentProjectId
});

// Review recommendations and adjust priorities
```

### **🔄 Workflow Templates**

#### **Feature Development Workflow**
```javascript
// Step 1: Create feature task
const featureTask = await mcp_call('create_task', {
  task_list_id: relevantTaskListId,
  title: "Implement user authentication",
  description: "Complete user auth system with login, register, password reset",
  priority: "high",
  metadata: { /* detailed metadata */ }
});

// Step 2: Break into subtasks
const subtasks = [
  "Set up authentication middleware",
  "Create login API endpoint", 
  "Create registration API endpoint",
  "Implement password hashing",
  "Add JWT token generation",
  "Create login UI component",
  "Add form validation",
  "Write authentication tests"
];

for (const [index, subtask] of subtasks.entries()) {
  await mcp_call('create_subtask', {
    task_id: featureTask.id,
    title: subtask,
    order_index: index + 1
  });
}

// Step 3: Implement and mark complete
// As you complete each subtask:
await mcp_call('toggle_subtask_completion', { subtask_id });

// Step 4: Mark main task complete
await mcp_call('toggle_task_completion', { task_id: featureTask.id });
```

#### **Bug Fix Workflow**
```javascript
// Step 1: Create bug fix task
const bugTask = await mcp_call('create_task', {
  task_list_id: bugFixTaskListId,
  title: "Fix: [Bug Description]",
  description: "Bug report: [description]\nSteps to reproduce: [steps]\nExpected: [expected]\nActual: [actual]",
  priority: "high", // based on severity
  metadata: {
    bug_type: "critical", // critical, major, minor
    affected_users: "all users", // or specific user groups
    reproduction_rate: "100%",
    browser: "Chrome, Firefox",
    files_affected: ["component.tsx", "service.ts"],
    root_cause: "to be determined"
  }
});

// Step 2: Investigation subtasks
const investigationSubtasks = [
  "Reproduce the bug locally",
  "Identify root cause",
  "Plan the fix approach", 
  "Implement the fix",
  "Test the fix thoroughly",
  "Update related tests",
  "Deploy and verify"
];
```

### **📈 Metrics and Reporting Templates**

#### **Weekly Report Template**
```javascript
// Generate comprehensive weekly report
const weeklyReport = await mcp_prompt('generate_status_report', {
  project_id: currentProjectId,
  include_details: 'true'
});

// Get additional metrics
const projectStats = await mcp_call('get_project_stats', {
  project_id: currentProjectId
});

// Calculate velocity
const allTasks = await mcp_call('get_all_tasks');
const thisWeekCompleted = allTasks.filter(task => 
  task.completed_at && 
  isThisWeek(task.completed_at)
);

const report = {
  week: getCurrentWeek(),
  completed_tasks: thisWeekCompleted.length,
  completion_rate: projectStats.completed_tasks / projectStats.total_tasks,
  high_priority_remaining: allTasks.filter(t => 
    t.priority === 'high' && !t.is_completed
  ).length,
  blockers: [], // manual input
  next_week_goals: [] // manual input
};
```

These templates provide AI agents with ready-to-use patterns for effective project management using the SimpleCheckList MCP server! 🎯
