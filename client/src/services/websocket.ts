import { io, Socket } from 'socket.io-client';
import { config } from '../config';

class WebSocketService {
  private socket: Socket | null = null;
  private currentProjectId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private isConnecting = false;
  private eventListeners = new Map<string, Set<Function>>();

  constructor() {
    this.connect();
    this.setupVisibilityHandling();
  }

  private connect() {
    if (this.isConnecting || this.socket?.connected) {
      return;
    }

    this.isConnecting = true;
    console.log('Connecting to WebSocket server...');

    // Parse API base URL to get WebSocket URL
    const apiUrl = new URL(config.API_BASE_URL);
    const wsUrl = `${apiUrl.protocol}//${apiUrl.host}`;

    this.socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected:', this.socket?.id);
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;

      // Rejoin current project room if we were in one
      if (this.currentProjectId) {
        this.joinProject(this.currentProjectId);
      }

      // Emit connection event to listeners
      this.emit('connection', { connected: true });
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnecting = false;
      this.emit('connection', { connected: false, reason });

      // Handle automatic reconnection
      if (reason === 'io server disconnect') {
        // Server disconnected us, try to reconnect
        this.handleReconnection();
      }
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('WebSocket connection error:', error);
      this.isConnecting = false;
      this.handleReconnection();
      this.emit('connection', { connected: false, error: error.message });
    });

    // Setup all the real-time event handlers
    this.setupDataEventHandlers();
  }

  private setupDataEventHandlers() {
    if (!this.socket) return;

    // Project events
    this.socket.on('project-created', (data: any) => this.emit('project-created', data));
    this.socket.on('project-updated', (data: any) => this.emit('project-updated', data));
    this.socket.on('project-deleted', (data: any) => this.emit('project-deleted', data));

    // Group events
    this.socket.on('group-created', (data: any) => this.emit('group-created', data));
    this.socket.on('group-updated', (data: any) => this.emit('group-updated', data));
    this.socket.on('group-deleted', (data: any) => this.emit('group-deleted', data));

    // Task list events
    this.socket.on('task-list-created', (data: any) => this.emit('task-list-created', data));
    this.socket.on('task-list-updated', (data: any) => this.emit('task-list-updated', data));
    this.socket.on('task-list-deleted', (data: any) => this.emit('task-list-deleted', data));

    // Task events
    this.socket.on('task-created', (data: any) => this.emit('task-created', data));
    this.socket.on('task-updated', (data: any) => this.emit('task-updated', data));
    this.socket.on('task-toggled', (data: any) => this.emit('task-toggled', data));
    this.socket.on('task-deleted', (data: any) => this.emit('task-deleted', data));

    // Subtask events
    this.socket.on('subtask-created', (data: any) => this.emit('subtask-created', data));
    this.socket.on('subtask-toggled', (data: any) => this.emit('subtask-toggled', data));
    this.socket.on('subtask-deleted', (data: any) => this.emit('subtask-deleted', data));
  }

  private handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached. Please refresh the page.');
      this.emit('connection', { 
        connected: false, 
        error: 'Max reconnection attempts reached. Please refresh the page.' 
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 5000);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.socket?.connected) {
        this.disconnect();
        this.connect();
      }
    }, delay);
  }

  private visibilityChangeHandler = () => {
    if (!document.hidden && (!this.socket?.connected && !this.isConnecting)) {
      console.log('Tab became visible, checking WebSocket connection...');
      this.connect();
    }
  };

  private onlineHandler = () => {
    console.log('Network came back online, reconnecting WebSocket...');
    if (!this.socket?.connected && !this.isConnecting) {
      this.connect();
    }
  };

  private offlineHandler = () => {
    console.log('Network went offline');
    this.emit('connection', { connected: false, reason: 'Network offline' });
  };

  private setupVisibilityHandling() {
    // Reconnect when tab becomes visible again (in case connection was lost)
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);

    // Handle online/offline events
    window.addEventListener('online', this.onlineHandler);
    window.addEventListener('offline', this.offlineHandler);
  }

  // Public methods
  joinProject(projectId: string) {
    if (this.socket?.connected) {
      if (this.currentProjectId && this.currentProjectId !== projectId) {
        this.socket.emit('leave-project', this.currentProjectId);
      }
      this.socket.emit('join-project', projectId);
      this.currentProjectId = projectId;
      console.log(`Joined project room: ${projectId}`);
    } else {
      // Store the project ID to join when connected
      this.currentProjectId = projectId;
    }
  }

  leaveProject() {
    if (this.socket?.connected && this.currentProjectId) {
      this.socket.emit('leave-project', this.currentProjectId);
      console.log(`Left project room: ${this.currentProjectId}`);
    }
    this.currentProjectId = null;
  }

  // Event listener management
  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);

    // Return cleanup function
    return () => {
      this.off(event, callback);
    };
  }

  off(event: string, callback?: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      if (callback) {
        listeners.delete(callback);
      } else {
        listeners.clear();
      }
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket event listener for ${event}:`, error);
        }
      });
    }
  }

  // Connection status
  get connected(): boolean {
    return this.socket?.connected || false;
  }

  get connecting(): boolean {
    return this.isConnecting;
  }

  // Manual connection control
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentProjectId = null;
    this.isConnecting = false;
  }

  reconnect() {
    this.disconnect();
    this.reconnectAttempts = 0;
    this.connect();
  }

  // Cleanup
  destroy() {
    this.disconnect();
    this.eventListeners.clear();
    
    // Remove event listeners
    document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
    window.removeEventListener('online', this.onlineHandler);
    window.removeEventListener('offline', this.offlineHandler);
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
export type { Socket };
