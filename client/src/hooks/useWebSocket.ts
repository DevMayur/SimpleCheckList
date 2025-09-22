import { useEffect, useRef, useCallback, useState } from 'react';
import websocketService from '../services/websocket';

interface UseWebSocketReturn {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  joinProject: (projectId: string) => void;
  leaveProject: () => void;
  reconnect: () => void;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const [connected, setConnected] = useState(websocketService.connected);
  const [connecting, setConnecting] = useState(websocketService.connecting);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleConnection = (data: any) => {
      setConnected(data.connected);
      setConnecting(false);
      
      if (data.connected) {
        setError(null);
      } else {
        setError(data.error || data.reason || 'Connection lost');
      }
    };

    // Listen for connection status changes
    const cleanup = websocketService.on('connection', handleConnection);

    // Set initial state
    setConnected(websocketService.connected);
    setConnecting(websocketService.connecting);

    return cleanup;
  }, []);

  const joinProject = useCallback((projectId: string) => {
    websocketService.joinProject(projectId);
  }, []);

  const leaveProject = useCallback(() => {
    websocketService.leaveProject();
  }, []);

  const reconnect = useCallback(() => {
    setConnecting(true);
    setError(null);
    websocketService.reconnect();
  }, []);

  return {
    connected,
    connecting,
    error,
    joinProject,
    leaveProject,
    reconnect,
  };
};

interface UseWebSocketEventsOptions {
  onProjectCreated?: (project: any) => void;
  onProjectUpdated?: (project: any) => void;
  onProjectDeleted?: (data: { id: string }) => void;
  
  onGroupCreated?: (group: any) => void;
  onGroupUpdated?: (group: any) => void;
  onGroupDeleted?: (data: { id: string }) => void;
  
  onTaskListCreated?: (taskList: any) => void;
  onTaskListUpdated?: (taskList: any) => void;
  onTaskListDeleted?: (data: { id: string }) => void;
  
  onTaskCreated?: (task: any) => void;
  onTaskUpdated?: (task: any) => void;
  onTaskToggled?: (task: any) => void;
  onTaskDeleted?: (data: { id: string }) => void;
  
  onSubtaskCreated?: (subtask: any) => void;
  onSubtaskToggled?: (subtask: any) => void;
  onSubtaskDeleted?: (data: { id: string }) => void;
}

export const useWebSocketEvents = (options: UseWebSocketEventsOptions) => {
  const cleanupFunctionsRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    // Clean up previous listeners
    cleanupFunctionsRef.current.forEach(cleanup => cleanup());
    cleanupFunctionsRef.current = [];

    // Set up new listeners
    const setupListener = (event: string, handler?: (data: any) => void) => {
      if (handler) {
        const cleanup = websocketService.on(event, handler);
        cleanupFunctionsRef.current.push(cleanup);
      }
    };

    // Project events
    setupListener('project-created', options.onProjectCreated);
    setupListener('project-updated', options.onProjectUpdated);
    setupListener('project-deleted', options.onProjectDeleted);

    // Group events
    setupListener('group-created', options.onGroupCreated);
    setupListener('group-updated', options.onGroupUpdated);
    setupListener('group-deleted', options.onGroupDeleted);

    // Task list events
    setupListener('task-list-created', options.onTaskListCreated);
    setupListener('task-list-updated', options.onTaskListUpdated);
    setupListener('task-list-deleted', options.onTaskListDeleted);

    // Task events
    setupListener('task-created', options.onTaskCreated);
    setupListener('task-updated', options.onTaskUpdated);
    setupListener('task-toggled', options.onTaskToggled);
    setupListener('task-deleted', options.onTaskDeleted);

    // Subtask events
    setupListener('subtask-created', options.onSubtaskCreated);
    setupListener('subtask-toggled', options.onSubtaskToggled);
    setupListener('subtask-deleted', options.onSubtaskDeleted);

    // Cleanup function
    return () => {
      cleanupFunctionsRef.current.forEach(cleanup => cleanup());
      cleanupFunctionsRef.current = [];
    };
  }, [
    options.onProjectCreated,
    options.onProjectUpdated,
    options.onProjectDeleted,
    options.onGroupCreated,
    options.onGroupUpdated,
    options.onGroupDeleted,
    options.onTaskListCreated,
    options.onTaskListUpdated,
    options.onTaskListDeleted,
    options.onTaskCreated,
    options.onTaskUpdated,
    options.onTaskToggled,
    options.onTaskDeleted,
    options.onSubtaskCreated,
    options.onSubtaskToggled,
    options.onSubtaskDeleted,
  ]);
};

// Simplified hook for project-specific events
export const useProjectWebSocket = (projectId: string | null, options: UseWebSocketEventsOptions) => {
  const { joinProject, leaveProject, ...connectionStatus } = useWebSocket();
  
  useEffect(() => {
    if (projectId) {
      joinProject(projectId);
      return () => leaveProject();
    }
  }, [projectId, joinProject, leaveProject]);

  useWebSocketEvents(options);

  return connectionStatus;
};
