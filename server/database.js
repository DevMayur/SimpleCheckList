const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../data/checklist.db');

class Database {
  constructor() {
    this.db = new sqlite3.Database(dbPath);
  }

  // Generic query method
  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Generic run method for INSERT, UPDATE, DELETE
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  // Get single row
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Close database connection
  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // Projects CRUD
  async createProject(project) {
    const { id, name, description, color } = project;
    const sql = `
      INSERT INTO projects (id, name, description, color)
      VALUES (?, ?, ?, ?)
    `;
    return this.run(sql, [id, name, description, color]);
  }

  async getProjects() {
    const sql = `
      SELECT * FROM projects 
      WHERE is_archived = 0 
      ORDER BY created_at DESC
    `;
    return this.query(sql);
  }

  async getProject(id) {
    const sql = 'SELECT * FROM projects WHERE id = ? AND is_archived = 0';
    return this.get(sql, [id]);
  }

  async updateProject(id, updates) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    const sql = `UPDATE projects SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    return this.run(sql, [...values, id]);
  }

  async deleteProject(id) {
    const sql = 'UPDATE projects SET is_archived = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    return this.run(sql, [id]);
  }

  // Groups CRUD
  async createGroup(group) {
    const { id, project_id, name, description, order_index } = group;
    const sql = `
      INSERT INTO groups (id, project_id, name, description, order_index)
      VALUES (?, ?, ?, ?, ?)
    `;
    return this.run(sql, [id, project_id, name, description, order_index]);
  }

  async getGroupsByProject(projectId) {
    const sql = `
      SELECT * FROM groups 
      WHERE project_id = ? AND is_archived = 0 
      ORDER BY order_index, created_at
    `;
    return this.query(sql, [projectId]);
  }

  async updateGroup(id, updates) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    const sql = `UPDATE groups SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    return this.run(sql, [...values, id]);
  }

  async deleteGroup(id) {
    const sql = 'UPDATE groups SET is_archived = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    return this.run(sql, [id]);
  }

  // Task Lists CRUD
  async createTaskList(taskList) {
    const { id, group_id, name, description, order_index } = taskList;
    const sql = `
      INSERT INTO task_lists (id, group_id, name, description, order_index)
      VALUES (?, ?, ?, ?, ?)
    `;
    return this.run(sql, [id, group_id, name, description, order_index]);
  }

  async getTaskListsByGroup(groupId) {
    const sql = `
      SELECT * FROM task_lists 
      WHERE group_id = ? AND is_archived = 0 
      ORDER BY order_index, created_at
    `;
    return this.query(sql, [groupId]);
  }

  async updateTaskList(id, updates) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    const sql = `UPDATE task_lists SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    return this.run(sql, [...values, id]);
  }

  async deleteTaskList(id) {
    const sql = 'UPDATE task_lists SET is_archived = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    return this.run(sql, [id]);
  }

  // Tasks CRUD
  async createTask(task) {
    const { id, task_list_id, title, description, priority, due_date, order_index, metadata } = task;
    const sql = `
      INSERT INTO tasks (id, task_list_id, title, description, priority, due_date, order_index, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    return this.run(sql, [id, task_list_id, title, description, priority, due_date, order_index, metadata]);
  }

  async getTasksByTaskList(taskListId) {
    const sql = `
      SELECT * FROM tasks 
      WHERE task_list_id = ? 
      ORDER BY order_index, created_at
    `;
    return this.query(sql, [taskListId]);
  }

  async updateTask(id, updates) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    const sql = `UPDATE tasks SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    return this.run(sql, [...values, id]);
  }

  async toggleTaskCompletion(id) {
    const sql = `
      UPDATE tasks 
      SET is_completed = NOT is_completed,
          completed_at = CASE 
            WHEN is_completed = 0 THEN CURRENT_TIMESTAMP 
            ELSE NULL 
          END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    return this.run(sql, [id]);
  }

  async deleteTask(id) {
    const sql = 'DELETE FROM tasks WHERE id = ?';
    return this.run(sql, [id]);
  }

  // Subtasks CRUD
  async createSubtask(subtask) {
    const { id, task_id, title, order_index } = subtask;
    const sql = `
      INSERT INTO subtasks (id, task_id, title, order_index)
      VALUES (?, ?, ?, ?)
    `;
    return this.run(sql, [id, task_id, title, order_index]);
  }

  async getSubtasksByTask(taskId) {
    const sql = `
      SELECT * FROM subtasks 
      WHERE task_id = ? 
      ORDER BY order_index, created_at
    `;
    return this.query(sql, [taskId]);
  }

  async toggleSubtaskCompletion(id) {
    const sql = `
      UPDATE subtasks 
      SET is_completed = NOT is_completed,
          completed_at = CASE 
            WHEN is_completed = 0 THEN CURRENT_TIMESTAMP 
            ELSE NULL 
          END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    return this.run(sql, [id]);
  }

  async deleteSubtask(id) {
    const sql = 'DELETE FROM subtasks WHERE id = ?';
    return this.run(sql, [id]);
  }

  // Analytics and reporting
  async getProjectStats(projectId) {
    const sql = `
      SELECT 
        COUNT(DISTINCT g.id) as total_groups,
        COUNT(DISTINCT tl.id) as total_task_lists,
        COUNT(DISTINCT t.id) as total_tasks,
        COUNT(DISTINCT CASE WHEN t.is_completed = 1 THEN t.id END) as completed_tasks,
        COUNT(DISTINCT s.id) as total_subtasks,
        COUNT(DISTINCT CASE WHEN s.is_completed = 1 THEN s.id END) as completed_subtasks
      FROM projects p
      LEFT JOIN groups g ON p.id = g.project_id AND g.is_archived = 0
      LEFT JOIN task_lists tl ON g.id = tl.group_id AND tl.is_archived = 0
      LEFT JOIN tasks t ON tl.id = t.task_list_id
      LEFT JOIN subtasks s ON t.id = s.task_id
      WHERE p.id = ? AND p.is_archived = 0
    `;
    return this.get(sql, [projectId]);
  }

  async getAllTasksWithDetails() {
    const sql = `
      SELECT 
        t.*,
        tl.name as task_list_name,
        g.name as group_name,
        p.name as project_name,
        p.color as project_color
      FROM tasks t
      JOIN task_lists tl ON t.task_list_id = tl.id
      JOIN groups g ON tl.group_id = g.id
      JOIN projects p ON g.project_id = p.id
      WHERE tl.is_archived = 0 AND g.is_archived = 0 AND p.is_archived = 0
      ORDER BY p.name, g.name, tl.name, t.order_index
    `;
    return this.query(sql);
  }

  // Additional methods needed for WebSocket integration
  async getGroup(id) {
    const sql = 'SELECT * FROM groups WHERE id = ? AND is_archived = 0';
    return this.get(sql, [id]);
  }

  async getTaskList(id) {
    const sql = 'SELECT * FROM task_lists WHERE id = ? AND is_archived = 0';
    return this.get(sql, [id]);
  }

  async getTask(id) {
    const sql = 'SELECT * FROM tasks WHERE id = ?';
    return this.get(sql, [id]);
  }

  async getSubtask(id) {
    const sql = 'SELECT * FROM subtasks WHERE id = ?';
    return this.get(sql, [id]);
  }
}

module.exports = Database;
