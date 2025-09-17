import axios from 'axios';
import { Project, Group, TaskList, Task, Subtask, ProjectStats, TaskWithDetails } from '../types';

import { config } from '../config';

const API_BASE_URL = config.API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Projects API
export const projectsApi = {
  getAll: (): Promise<Project[]> => api.get('/projects').then(res => res.data),
  getById: (id: string): Promise<Project> => api.get(`/projects/${id}`).then(res => res.data),
  create: (data: Partial<Project>): Promise<Project> => api.post('/projects', data).then(res => res.data),
  update: (id: string, data: Partial<Project>): Promise<Project> => api.put(`/projects/${id}`, data).then(res => res.data),
  delete: (id: string): Promise<void> => api.delete(`/projects/${id}`).then(res => res.data),
  getStats: (id: string): Promise<ProjectStats> => api.get(`/projects/${id}/stats`).then(res => res.data),
};

// Groups API
export const groupsApi = {
  getByProject: (projectId: string): Promise<Group[]> => api.get(`/projects/${projectId}/groups`).then(res => res.data),
  create: (projectId: string, data: Partial<Group>): Promise<Group> => api.post(`/projects/${projectId}/groups`, data).then(res => res.data),
  update: (id: string, data: Partial<Group>): Promise<void> => api.put(`/groups/${id}`, data).then(res => res.data),
  delete: (id: string): Promise<void> => api.delete(`/groups/${id}`).then(res => res.data),
};

// Task Lists API
export const taskListsApi = {
  getByGroup: (groupId: string): Promise<TaskList[]> => api.get(`/groups/${groupId}/task-lists`).then(res => res.data),
  create: (groupId: string, data: Partial<TaskList>): Promise<TaskList> => api.post(`/groups/${groupId}/task-lists`, data).then(res => res.data),
  update: (id: string, data: Partial<TaskList>): Promise<void> => api.put(`/task-lists/${id}`, data).then(res => res.data),
  delete: (id: string): Promise<void> => api.delete(`/task-lists/${id}`).then(res => res.data),
};

// Tasks API
export const tasksApi = {
  getByTaskList: (taskListId: string): Promise<Task[]> => api.get(`/task-lists/${taskListId}/tasks`).then(res => res.data),
  create: (taskListId: string, data: Partial<Task>): Promise<Task> => api.post(`/task-lists/${taskListId}/tasks`, data).then(res => res.data),
  update: (id: string, data: Partial<Task>): Promise<void> => api.put(`/tasks/${id}`, data).then(res => res.data),
  toggleCompletion: (id: string): Promise<void> => api.patch(`/tasks/${id}/toggle`).then(res => res.data),
  delete: (id: string): Promise<void> => api.delete(`/tasks/${id}`).then(res => res.data),
  getAll: (): Promise<TaskWithDetails[]> => api.get('/tasks/all').then(res => res.data),
};

// Subtasks API
export const subtasksApi = {
  getByTask: (taskId: string): Promise<Subtask[]> => api.get(`/tasks/${taskId}/subtasks`).then(res => res.data),
  create: (taskId: string, data: Partial<Subtask>): Promise<Subtask> => api.post(`/tasks/${taskId}/subtasks`, data).then(res => res.data),
  toggleCompletion: (id: string): Promise<void> => api.patch(`/subtasks/${id}/toggle`).then(res => res.data),
  delete: (id: string): Promise<void> => api.delete(`/subtasks/${id}`).then(res => res.data),
};

export default api;
