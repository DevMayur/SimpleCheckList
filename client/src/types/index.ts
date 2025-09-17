export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
}

export interface Group {
  id: string;
  project_id: string;
  name: string;
  description: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
}

export interface TaskList {
  id: string;
  group_id: string;
  name: string;
  description: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
}

export interface Task {
  id: string;
  task_list_id: string;
  title: string;
  description: string;
  is_completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  completed_at: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
  metadata: string | null;
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
  completed_at: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectStats {
  total_groups: number;
  total_task_lists: number;
  total_tasks: number;
  completed_tasks: number;
  total_subtasks: number;
  completed_subtasks: number;
}

export interface TaskWithDetails extends Task {
  task_list_name: string;
  group_name: string;
  project_name: string;
  project_color: string;
}
