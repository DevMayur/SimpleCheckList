const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/checklist.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

// Create tables
const createTables = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Projects table
      db.run(`
        CREATE TABLE IF NOT EXISTS projects (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          color TEXT DEFAULT '#3B82F6',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_archived BOOLEAN DEFAULT 0
        )
      `);

      // Groups table
      db.run(`
        CREATE TABLE IF NOT EXISTS groups (
          id TEXT PRIMARY KEY,
          project_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          order_index INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_archived BOOLEAN DEFAULT 0,
          FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
        )
      `);

      // Task lists table
      db.run(`
        CREATE TABLE IF NOT EXISTS task_lists (
          id TEXT PRIMARY KEY,
          group_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          order_index INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_archived BOOLEAN DEFAULT 0,
          FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE
        )
      `);

      // Tasks table
      db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          task_list_id TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          is_completed BOOLEAN DEFAULT 0,
          priority TEXT DEFAULT 'medium',
          due_date DATETIME,
          completed_at DATETIME,
          order_index INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          metadata TEXT, -- JSON string for additional metadata
          FOREIGN KEY (task_list_id) REFERENCES task_lists (id) ON DELETE CASCADE
        )
      `);

      // Subtasks table
      db.run(`
        CREATE TABLE IF NOT EXISTS subtasks (
          id TEXT PRIMARY KEY,
          task_id TEXT NOT NULL,
          title TEXT NOT NULL,
          is_completed BOOLEAN DEFAULT 0,
          completed_at DATETIME,
          order_index INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
        )
      `);

      // Create indexes for better performance
      db.run(`CREATE INDEX IF NOT EXISTS idx_groups_project_id ON groups(project_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_task_lists_group_id ON task_lists(group_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_tasks_task_list_id ON tasks(task_list_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(is_completed)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date)`);

      db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database initialized successfully!');
          resolve();
        }
      });
    });
  });
};

createTables().catch(console.error);
