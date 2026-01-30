/**
 * SQLite Database Setup
 * Uses better-sqlite3 for synchronous, fast database operations
 */

import Database from "better-sqlite3";
import path from "path";

// Database file path - use environment variable or default
const DB_PATH =
  process.env.DATABASE_PATH ||
  path.join(process.cwd(), "data", "database.sqlite");

// Singleton database instance
let db: Database.Database | null = null;

/**
 * Get or create the database connection
 */
export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);

    // Enable WAL mode for better concurrent read performance
    db.pragma("journal_mode = WAL");

    // Initialize tables
    initializeTables(db);
  }

  return db;
}

/**
 * Initialize database tables
 */
function initializeTables(database: Database.Database): void {
  // Projects table
  database.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      domain TEXT NOT NULL,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Visitor events table for tracking
  database.exec(`
    CREATE TABLE IF NOT EXISTS visitor_events (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      visitor_id TEXT NOT NULL,
      variation TEXT NOT NULL CHECK(variation IN ('A', 'B', 'C', 'D')),
      timestamp TEXT DEFAULT (datetime('now')),
      user_agent TEXT,
      referrer TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for faster queries
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_visitor_events_project_id 
    ON visitor_events(project_id)
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_visitor_events_variation 
    ON visitor_events(project_id, variation)
  `);
}

/**
 * Close the database connection (useful for cleanup)
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

export default getDatabase;
