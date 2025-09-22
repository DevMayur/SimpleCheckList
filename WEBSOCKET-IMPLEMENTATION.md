# WebSocket Real-Time Updates Implementation

This document describes the robust WebSocket implementation that provides real-time synchronization across all frontend components without requiring restarts.

## 🎯 Overview

The WebSocket implementation uses Socket.IO to provide:
- **Real-time updates** across all connected clients
- **Project-scoped rooms** for efficient event distribution
- **Robust connection management** with automatic reconnection
- **Error handling and recovery** mechanisms
- **Connection status indicators** for users
- **Offline/online detection** and handling

## 🏗️ Architecture

### Backend (Socket.IO Server)

**File: `server/index.js`**
- Socket.IO server integrated with Express HTTP server
- Project-based room management (`project:${projectId}`)
- Event emission on all CRUD operations
- Connection tracking and cleanup
- Robust CORS configuration

**Key Features:**
- **Room Management**: Clients join/leave project-specific rooms
- **Event Emission**: All API operations emit corresponding WebSocket events
- **Connection Tracking**: Maintains connected client registry
- **Project ID Resolution**: Helper function to get project ID from any entity

### Frontend (Socket.IO Client)

**Files:**
- `client/src/services/websocket.ts` - Core WebSocket service
- `client/src/hooks/useWebSocket.ts` - React hooks for easy integration
- `client/src/components/ConnectionStatus.tsx` - Connection status UI

**Key Features:**
- **Singleton Service**: Single WebSocket connection shared across app
- **Automatic Reconnection**: Exponential backoff strategy
- **Visibility Handling**: Reconnects when tab becomes visible
- **Event Management**: Type-safe event listener system
- **React Integration**: Custom hooks for seamless component integration

## 🔧 Implementation Details

### Socket.IO Server Configuration

```javascript
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:8354", "http://localhost:3000", "http://localhost:8080"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});
```

### Event Types

All CRUD operations emit corresponding events:

**Projects:**
- `project-created` - New project created
- `project-updated` - Project details updated
- `project-deleted` - Project deleted

**Groups:**
- `group-created` - New group added to project
- `group-updated` - Group details updated
- `group-deleted` - Group deleted

**Task Lists:**
- `task-list-created` - New task list added
- `task-list-updated` - Task list updated
- `task-list-deleted` - Task list deleted

**Tasks:**
- `task-created` - New task added
- `task-updated` - Task details updated
- `task-toggled` - Task completion status changed
- `task-deleted` - Task deleted

**Subtasks:**
- `subtask-created` - New subtask added
- `subtask-toggled` - Subtask completion status changed
- `subtask-deleted` - Subtask deleted

### Room Management

Clients automatically join project rooms when viewing project details:

```javascript
// Join project room
socket.emit('join-project', projectId);

// Leave project room
socket.emit('leave-project', projectId);
```

Events are emitted to appropriate rooms:

```javascript
// Emit to specific project
emitToProject(projectId, 'task-created', task);

// Emit globally (for project list updates)
io.emit('project-created', project);
```

### Frontend Integration

#### Basic Usage

```typescript
import { useWebSocket, useWebSocketEvents } from '../hooks/useWebSocket';

const MyComponent = () => {
  const { connected, connecting, error } = useWebSocket();
  
  useWebSocketEvents({
    onTaskCreated: (task) => {
      // Handle new task
    },
    onTaskToggled: (task) => {
      // Handle task completion toggle
    }
  });
};
```

#### Project-Specific Usage

```typescript
import { useProjectWebSocket } from '../hooks/useWebSocket';

const ProjectDetail = () => {
  const { projectId } = useParams();
  
  const { connected } = useProjectWebSocket(projectId, {
    onGroupCreated: handleGroupCreated,
    onTaskCreated: handleTaskCreated,
    // ... other event handlers
  });
};
```

## 🔄 Connection Management

### Automatic Reconnection

The WebSocket service implements robust reconnection logic:

1. **Exponential Backoff**: Delays increase with each failed attempt
2. **Max Attempts**: Configurable maximum reconnection attempts
3. **Connection State**: Tracks connecting/connected/disconnected states
4. **Room Rejoin**: Automatically rejoins project rooms after reconnection

### Connection Status UI

Users see real-time connection status through:

1. **Inline Status Chip**: Shows in navigation/headers
2. **Snackbar Notifications**: Alerts for connection changes
3. **Manual Reconnect**: Button to force reconnection
4. **Error Messages**: Detailed error information

### Offline/Online Handling

The service responds to network changes:

```javascript
window.addEventListener('online', () => {
  // Reconnect when network comes back
});

window.addEventListener('offline', () => {
  // Handle offline state
});
```

### Tab Visibility

Reconnects automatically when tab becomes visible:

```javascript
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && !socket.connected) {
    // Reconnect when tab becomes visible
  }
});
```

## 🚀 Usage Examples

### Real-Time Task Updates

When a user toggles a task completion in one browser tab, all other connected clients immediately see the change:

1. User clicks task checkbox
2. API call updates database
3. Server emits `task-toggled` event to project room
4. All connected clients in that project receive the event
5. UI updates automatically without refresh

### Multi-User Collaboration

Multiple users can work on the same project simultaneously:

1. User A creates a new group
2. Server emits `group-created` event
3. User B's interface immediately shows the new group
4. Both users see real-time updates as they work

### Connection Recovery

If connection is lost:

1. Connection status shows "Disconnected"
2. User sees reconnection attempts in UI
3. Service automatically tries to reconnect
4. When reconnected, user rejoins their project room
5. All missed updates are handled by the backend state

## 🔧 Configuration

### Environment Variables

```bash
# Backend
PORT=8355
FRONTEND_URL=http://localhost:8354

# Frontend (in config.ts)
API_BASE_URL=http://localhost:8355/api
```

### Socket.IO Configuration

**Server Options:**
- `pingTimeout`: 60000ms (1 minute)
- `pingInterval`: 25000ms (25 seconds)
- `transports`: ['websocket', 'polling']

**Client Options:**
- `timeout`: 20000ms (20 seconds)
- `reconnectionAttempts`: 5
- `reconnectionDelay`: 1000ms (1 second)
- `reconnectionDelayMax`: 5000ms (5 seconds)

## 🔍 Debugging

### Server-Side Logging

The server logs all WebSocket events:

```javascript
console.log(`Client connected: ${socket.id}`);
console.log(`Client ${socket.id} joined project room: ${projectId}`);
console.log(`Emitted ${event} to project ${projectId}:`, data);
```

### Client-Side Debugging

Enable verbose logging in development:

```javascript
// In websocket service
console.log('Connecting to WebSocket server...');
console.log('WebSocket connected:', socket.id);
console.log('WebSocket disconnected:', reason);
```

### Connection Status Monitoring

Use the ConnectionStatus component to monitor:

```typescript
<ConnectionStatus showInline /> // Shows status chip
<ConnectionStatus showSnackbar /> // Shows notifications
```

## 🔒 Security Considerations

### CORS Configuration

Properly configured CORS prevents unauthorized access:

```javascript
cors: {
  origin: process.env.FRONTEND_URL || ["http://localhost:8354"],
  methods: ["GET", "POST"],
  credentials: true
}
```

### Room Isolation

Project-based rooms ensure users only receive relevant updates:

- Users must explicitly join project rooms
- Events are scoped to appropriate projects
- No cross-project data leakage

## 🚀 Performance Optimizations

### Event Scoping

Events are only sent to relevant clients:

```javascript
// Only to project members
emitToProject(projectId, 'task-created', task);

// Global events (project list)
io.emit('project-created', project);
```

### Connection Pooling

Single WebSocket connection per client reduces overhead:

- Shared connection across all components
- Efficient event distribution
- Minimal server resources per client

### Selective Updates

Components only listen to relevant events:

```typescript
// Task detail only listens to task and subtask events
useWebSocketEvents({
  onTaskUpdated: handleTaskUpdated,
  onSubtaskCreated: handleSubtaskCreated,
  // Doesn't listen to project or group events
});
```

## 🧪 Testing

### Manual Testing

1. **Multi-Tab Testing**: Open same project in multiple tabs
2. **Network Interruption**: Disconnect/reconnect network
3. **Server Restart**: Restart backend while frontend is open
4. **Cross-User Testing**: Multiple users on same project

### Connection Recovery Testing

1. Kill server while client connected
2. Verify reconnection attempts
3. Confirm room rejoin after reconnection
4. Test state synchronization after recovery

## 📈 Future Enhancements

### Potential Improvements

1. **User Presence**: Show who's currently viewing a project
2. **Typing Indicators**: Show when users are editing
3. **Conflict Resolution**: Handle simultaneous edits
4. **Message Queuing**: Queue events during disconnection
5. **Performance Metrics**: Track connection quality

### Scalability Considerations

1. **Redis Adapter**: For multiple server instances
2. **Load Balancing**: Sticky sessions for WebSocket
3. **Rate Limiting**: Prevent WebSocket abuse
4. **Monitoring**: Connection health metrics

## 🎯 Benefits

The WebSocket implementation provides:

✅ **No More Restarts**: Changes appear instantly across all clients  
✅ **Real-Time Collaboration**: Multiple users can work simultaneously  
✅ **Robust Connection**: Automatic reconnection and error recovery  
✅ **User Feedback**: Clear connection status and error messages  
✅ **Performance**: Efficient event distribution and minimal overhead  
✅ **Developer Experience**: Easy-to-use React hooks and TypeScript support  

This implementation eliminates the need for manual refreshes or application restarts, providing a modern, real-time collaborative experience for all users.
